/**
 * store.js — 資料讀寫
 *
 * 設計原則：Firestore 只存「使用者的收集狀態」，不存名稱、CP 等基礎資料。
 * 基礎資料一律以 data.js 為準。
 *
 * 這樣做的好處：之後在 data.js 新增寶可夢或修正名稱，
 * 所有使用者的既有紀錄都不受影響，也不需要做資料遷移。
 *
 * ── Firestore 結構 ──
 * users/{uid}
 *   states: { p000: {xxl, xxs, iv100:{has,shiny,lucky}}, p001: {...} }
 *   bg:     { "gf26-global": ["p003*","d131"], ... }  背卡：卡片 → 已取得的項目
 *   pika:   ["normal", "reds-hat*", ...]              裝扮皮卡丘，同樣用 "*" 表示異色
 *   updated: 時間戳
 *
 * 背卡的項目鍵有兩種：
 *   "p003"  圖鑑（data.js）裡的傳說
 *   "d131"  一般寶可夢，d 後面接全國圖鑑編號
 *
 * 鍵尾加上 "*" 表示該背卡的是異色，例如 "p003*"、"d131*"。
 * 異色是背卡的子狀態：有 "*" 就一定也算擁有該背卡。
 * 舊資料沒有 "*"，讀進來就是非異色，不需要轉換。
 */

import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./auth.js";
import { COLLECTION, SAVE_DELAY } from "./config.js";
import { POKEMON, blankState } from "./data.js";

/**
 * 把 Firestore 讀到的狀態套到基礎資料上，產生畫面要用的完整列表
 * @param {object} states 收集狀態
 * @param {object} bg 背卡紀錄 { cardId: [pokemonId, ...] }
 */
export function buildList(states, bg) {
  const saved = states || {};
  const cards = bg || {};
  // 反查：項目鍵 -> [cardId]，避免每張卡都掃一次陣列
  // 鍵可能帶 "*"（異色），這裡先去掉再比對
  const owned = Object.create(null);
  const shiny = Object.create(null);
  for (const [cardId, list] of Object.entries(cards)) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      if (typeof raw !== "string") continue;
      const isShiny = raw.endsWith("*");
      const key = isShiny ? raw.slice(0, -1) : raw;
      (owned[key] ||= []).push(cardId);
      if (isShiny) (shiny[key] ||= []).push(cardId);
    }
  }
  return POKEMON.map((p) => {
    const s = saved[p.id];
    const base = blankState();
    return {
      ...p,
      xxl: s ? !!s.xxl : base.xxl,
      xxs: s ? !!s.xxs : base.xxs,
      iv100: {
        has: !!(s && s.iv100 && s.iv100.has),
        shiny: !!(s && s.iv100 && s.iv100.shiny),
        lucky: !!(s && s.iv100 && s.iv100.lucky),
      },
      bg: owned[p.id] || [],
      bgShiny: shiny[p.id] || [],
    };
  });
}

/** 從完整列表抽出要寫回 Firestore 的部分 */
function extractStates(list) {
  const out = {};
  for (const p of list) {
    // 全部都是預設值就不必存，可以省空間
    if (!p.xxl && !p.xxs && !p.iv100.has) continue;
    out[p.id] = {
      xxl: p.xxl,
      xxs: p.xxs,
      iv100: { has: p.iv100.has, shiny: p.iv100.shiny, lucky: p.iv100.lucky },
    };
  }
  return out;
}

/**
 * 背卡紀錄以「卡片 → 已取得的項目」儲存，只存有的。
 *
 * 傳說（p###）的狀態掛在 list 上，一般寶可夢（d###）不在 list 裡，
 * 所以額外用 extraBg 帶進來，兩者合併後再寫回。
 */
function extractBg(list, extraBg) {
  const out = {};
  for (const p of list) {
    const sh = new Set(p.bgShiny || []);
    for (const cardId of p.bg || []) {
      (out[cardId] ||= []).push(sh.has(cardId) ? `${p.id}*` : p.id);
    }
  }
  for (const [cardId, keys] of Object.entries(extraBg || {})) {
    if (!Array.isArray(keys)) continue;
    for (const k of keys) {
      const arr = (out[cardId] ||= []);
      if (!arr.includes(k)) arr.push(k);
    }
  }
  // 移除空陣列，保持文件精簡
  for (const k of Object.keys(out)) if (!out[k].length) delete out[k];
  return out;
}

/** 從 Firestore 讀到的 bg 中，抽出不屬於圖鑑 79 隻的項目（d### 開頭） */
export function extractNonDexBg(bg) {
  const out = {};
  for (const [cardId, keys] of Object.entries(bg || {})) {
    if (!Array.isArray(keys)) continue;
    // 保留原樣（含 "*"），d 開頭的才是非圖鑑項目
    const rest = keys.filter((k) => typeof k === "string" && k.startsWith("d"));
    if (rest.length) out[cardId] = rest;
  }
  return out;
}

/**
 * 讀取某位使用者的紀錄
 * @returns {Promise<{list: Array, extraBg: object}>}
 */
export async function loadUser(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  const d = snap.exists() ? snap.data() : null;
  const bg = d ? d.bg : null;
  return {
    list: buildList(d ? d.states : null, bg),
    extraBg: extractNonDexBg(bg),
    pika: Array.isArray(d && d.pika) ? d.pika.filter((x) => typeof x === "string") : [],
  };
}

/** 未登入時顯示的唯讀列表 */
export function guestList() {
  return { list: buildList(null, null), extraBg: {}, pika: [] };
}

let timer = null;
let pending = null;

/**
 * 儲存（延遲寫入，連續操作只送一次）
 * @param {string} uid
 * @param {Array} list
 * @param {object} extraBg 不在圖鑑內的背卡紀錄
 * @param {Array} pika 裝扮皮卡丘紀錄
 * @param {(status: "saved"|"failed") => void} onDone
 */
export function saveUser(uid, list, extraBg, pika, onDone) {
  pending = { uid, list, extraBg, pika };
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const job = pending;
    pending = null;
    try {
      await setDoc(doc(db, COLLECTION, job.uid), {
        states: extractStates(job.list),
        bg: extractBg(job.list, job.extraBg),
        pika: job.pika || [],
        updated: Date.now(),
      });
      onDone("saved");
    } catch (err) {
      console.error("[store] save failed:", err);
      onDone("failed");
    }
  }, SAVE_DELAY);
}

/** 立刻寫入尚未送出的變更（例如關閉分頁前） */
export async function flush() {
  if (!pending) return;
  clearTimeout(timer);
  const job = pending;
  pending = null;
  try {
    await setDoc(doc(db, COLLECTION, job.uid), {
      states: extractStates(job.list),
      bg: extractBg(job.list, job.extraBg),
      pika: job.pika || [],
      updated: Date.now(),
    });
  } catch (err) {
    console.error("[store] flush failed:", err);
  }
}
