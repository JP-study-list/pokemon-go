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
 *   states: { p000: {xxl, xxs, iv100:{has,shiny,lucky,both}}, p001: {...} }
 *
 * iv100.both 表示「同時是異色又是亮晶晶的個體」，
 * 它是獨立的收藏成就，不由 shiny / lucky 推導。
 *   bg:     { "gf26-global": ["p003*","d131"], ... }  背卡：卡片 → 已取得的項目
 *   pika:   ["normal", "reds-hat*", ...]              裝扮皮卡丘，同樣用 "*" 表示異色
 *   want:   { lists: [{name, items:[{id,xxl,xxs,shiny,bg}]}, ...] }  交換清單
 *
 * 共四份清單，可以分別給不同的人看。每份清單裡同一隻寶可夢可以有多筆需求，
 * 例如「異色超夢」與「有東京背卡的超夢」是兩個獨立的交換目標。
 *
 * 舊格式（單一陣列、或更早的物件）會在讀取時自動轉成第一份清單。
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
        both: !!(s && s.iv100 && s.iv100.both),
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
      iv100: {
        has: p.iv100.has,
        shiny: p.iv100.shiny,
        lucky: p.iv100.lucky,
        both: p.iv100.both,
      },
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
    want: cleanWant(d && d.want),
  };
}

/** 未登入時顯示的唯讀列表 */
export function guestList() {
  return { list: buildList(null, null), extraBg: {}, pika: [], want: emptyWant() };
}

export const WANT_LISTS = 4;

/** 空白的四份清單 */
export function emptyWant() {
  return { lists: Array.from({ length: WANT_LISTS }, () => ({ name: "", items: [] })) };
}

/**
 * 過濾交換清單，確保結構乾淨。
 * 兩種舊格式都會自動轉成新格式的第一份清單，使用者不會掉資料。
 */
function cleanWant(want) {
  const fresh = emptyWant();
  if (!want) return fresh;

  // 新格式
  if (want.lists && Array.isArray(want.lists)) {
    for (let i = 0; i < WANT_LISTS; i++) {
      const l = want.lists[i];
      if (!l || typeof l !== "object") continue;
      fresh.lists[i] = {
        name: typeof l.name === "string" ? l.name.slice(0, 24) : "",
        items: Array.isArray(l.items)
          ? l.items.map(normalizeWant).filter(Boolean).slice(0, 300)
          : [],
      };
    }
    return fresh;
  }

  // 舊格式 2：陣列 → 第一份清單
  if (Array.isArray(want)) {
    fresh.lists[0].items = want.map(normalizeWant).filter(Boolean).slice(0, 300);
    return fresh;
  }

  // 舊格式 1：{ p003: {...} } → 每隻一筆，放進第一份清單
  if (typeof want === "object") {
    const out = [];
    for (const [pid, v] of Object.entries(want)) {
      if (!v || typeof v !== "object") continue;
      out.push(normalizeWant({ ...v, id: pid }));
    }
    fresh.lists[0].items = out.filter(Boolean).slice(0, 300);
  }
  return fresh;
}

function normalizeWant(v) {
  if (!v || typeof v !== "object" || typeof v.id !== "string" || !v.id) return null;
  const e = { id: v.id };
  if (v.xxl) e.xxl = 1;
  if (v.xxs) e.xxs = 1;
  if (v.shiny) e.shiny = 1;
  if (typeof v.bg === "string" && v.bg) e.bg = v.bg;
  return e;
}

let timer = null;
let pending = null;

/**
 * 儲存（延遲寫入，連續操作只送一次）
 * @param {string} uid
 * @param {{list, extraBg, pika, want}} payload
 * @param {(status: "saved"|"failed") => void} onDone
 */
export function saveUser(uid, payload, onDone) {
  pending = { uid, ...payload };
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const job = pending;
    pending = null;
    try {
      await setDoc(doc(db, COLLECTION, job.uid), {
        states: extractStates(job.list),
        bg: extractBg(job.list, job.extraBg),
        pika: job.pika || [],
        want: job.want || emptyWant(),
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
      want: job.want || emptyWant(),
      updated: Date.now(),
    });
  } catch (err) {
    console.error("[store] flush failed:", err);
  }
}
