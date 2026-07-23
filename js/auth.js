/**
 * auth.js — Google 登入
 *
 * 對外只暴露三件事：登入、登出、監聽登入狀態。
 * 其他檔案不需要知道 Firebase 的細節。
 *
 * ── 前置設定（在 Firebase Console 完成，程式無法代勞）──
 * 1. Authentication → Sign-in method → 啟用 Google
 * 2. Authentication → 已授權網域 → 加入你的網域
 *    （localhost 預設已存在，GitHub Pages 需自行加入 jp-study-list.github.io）
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/** Firestore 實例，給 store.js 使用 */
export const db = getFirestore(app);

/**
 * 開啟 Google 登入視窗
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function signIn() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    return { ok: true };
  } catch (err) {
    // 使用者自己關掉視窗，不算錯誤，安靜處理
    if (
      err.code === "auth/popup-closed-by-user" ||
      err.code === "auth/cancelled-popup-request"
    ) {
      return { ok: false, reason: "cancelled" };
    }
    if (err.code === "auth/popup-blocked") {
      return { ok: false, reason: "popupBlocked" };
    }
    console.error("[auth] sign-in failed:", err);
    return { ok: false, reason: "signInFailed" };
  }
}

/** 登出 */
export async function signOut() {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error("[auth] sign-out failed:", err);
  }
}

/**
 * 監聽登入狀態。頁面載入時會立刻呼叫一次。
 * @param {(user: {uid: string, name: string, photo: string} | null) => void} cb
 */
export function watchAuth(cb) {
  onAuthStateChanged(auth, (user) => {
    if (!user) return cb(null);
    cb({
      uid: user.uid,
      name: user.displayName || user.email || "",
      photo: user.photoURL || "",
    });
  });
}
