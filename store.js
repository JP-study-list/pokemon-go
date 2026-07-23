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
 *   updated: 時間戳
 */

import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./auth.js";
import { COLLECTION, SAVE_DELAY } from "./config.js";
import { POKEMON, blankState } from "./data.js";

/** 把 Firestore 讀到的狀態套到基礎資料上，產生畫面要用的完整列表 */
export function buildList(states) {
  const saved = states || {};
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
 * 讀取某位使用者的紀錄
 * @returns {Promise<Array>} 完整列表
 */
export async function loadUser(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  return buildList(snap.exists() ? snap.data().states : null);
}

/** 未登入時顯示的唯讀列表 */
export function guestList() {
  return buildList(null);
}

let timer = null;
let pending = null;

/**
 * 儲存（延遲寫入，連續操作只送一次）
 * @param {string} uid
 * @param {Array} list
 * @param {(status: "saved"|"failed") => void} onDone
 */
export function saveUser(uid, list, onDone) {
  pending = { uid, list };
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const job = pending;
    pending = null;
    try {
      await setDoc(doc(db, COLLECTION, job.uid), {
        states: extractStates(job.list),
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
      updated: Date.now(),
    });
  } catch (err) {
    console.error("[store] flush failed:", err);
  }
}
