/**
 * config.js — Firebase 專案設定
 *
 * 換 Firebase 專案時只要改這個檔案。
 *
 * 這些值出現在前端是正常的，不是密碼。真正的防護來自 Firestore 安全規則
 * （見 firestore.rules）：每位使用者只能存取自己 uid 底下的資料。
 *
 * ── 取得方式 ──
 * Firebase Console → 專案設定 → 你的應用程式 → 設定
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAHlZEt0QC3drMN4Wqg1yYA1e1ypP7JOP0",
  authDomain: "pokemon-iv100.firebaseapp.com",
  projectId: "pokemon-iv100",
  storageBucket: "pokemon-iv100.firebasestorage.app",
  messagingSenderId: "300601274919",
  appId: "1:300601274919:web:2776da58f075ed2563d402",
};

/** Firebase SDK 版本，升級時改這裡即可 */
export const SDK = "10.12.2";

/** 存放使用者資料的集合名稱 */
export const COLLECTION = "users";

/** 儲存前的等待時間（毫秒）。連續切換多個開關時只送出一次寫入 */
export const SAVE_DELAY = 700;
