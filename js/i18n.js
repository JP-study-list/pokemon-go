/**
 * i18n.js — 介面文字（繁中 / 日文 / 英文）
 *
 * ── 如何新增一種語言 ──
 * 1. 在 STRINGS 加一組，key 要跟 zh 那組完全一樣
 * 2. 在 LANGS 加上語言代碼與按鈕文字
 * 3. 寶可夢名稱也要在 data.js 每一筆加上對應欄位（例如 ko:"..."）
 *
 * ── 如何修改文字 ──
 * 直接改對應的值即可，三種語言都要記得改。
 */

/** 語言切換按鈕。code 必須對應 STRINGS 的 key，也對應 data.js 的名稱欄位 */
export const LANGS = [
  { code: "zh", label: "中" },
  { code: "ja", label: "日" },
  { code: "en", label: "EN" },
];

export const DEFAULT_LANG = "zh";

export const STRINGS = {
  zh: {
    htmlLang: "zh-Hant",
    subtitle: "傳說寶可夢收集進度",
    search: "搜尋名稱或編號",

    filterAll: "全部",
    filterXxl: "缺 XXL",
    filterXxs: "缺 XXS",
    filterIv: "缺 IV100",
    filterGot: "已收集",

    gen: "第 %s 代",
    complete: "完成",
    empty: "沒有符合的寶可夢",

    cp20: "LV 20 CP",
    cp25: "LV 25 CP",
    noCp: "未填",
    status: "收集狀態",
    xxl: "XXL",
    xxs: "XXS",
    iv100: "IV100",
    shiny: "異色",
    lucky: "亮晶晶",
    close: "關閉",

    signIn: "使用 Google 登入",
    signOut: "登出",
    signedInAs: "已登入",
    guestNotice: "你正在瀏覽範例資料。登入後即可記錄自己的收集進度，並在任何裝置同步。",
    loading: "載入中…",

    saved: "已儲存",
    saveFailed: "儲存失敗，請確認網路後重試",
    loadFailed: "載入失敗，請重新整理頁面",
    signInFailed: "登入失敗，請再試一次",
    popupBlocked: "瀏覽器擋住了登入視窗，請允許彈出視窗後再試",

    tipTheme: "深色模式",
    tipMenu: "側邊欄",
    sideLang: "語言",
    sideStats: "收集狀態",
    sideFilter: "篩選",
    sideView: "檢視",
    viewDex: "寶可夢圖鑑",
    viewBg: "背卡圖鑑",
    filterBg: "缺背卡",
    bgSection: "活動背卡",
    bgAllEvents: "所有活動",
    bgGlobal: "全球",
    bgRegional: "地區限定",
  },

  ja: {
    htmlLang: "ja",
    subtitle: "伝説のポケモン収集状況",
    search: "名前・図鑑番号で検索",

    filterAll: "すべて",
    filterXxl: "XXL未取得",
    filterXxs: "XXS未取得",
    filterIv: "IV100未取得",
    filterGot: "取得済み",

    gen: "第%s世代",
    complete: "達成",
    empty: "該当するポケモンがいません",

    cp20: "LV20 CP",
    cp25: "LV25 CP",
    noCp: "未入力",
    status: "収集状況",
    xxl: "XXL",
    xxs: "XXS",
    iv100: "IV100",
    shiny: "色違い",
    lucky: "キラ",
    close: "閉じる",

    signIn: "Googleでログイン",
    signOut: "ログアウト",
    signedInAs: "ログイン中",
    guestNotice: "サンプルデータを表示しています。ログインすると自分の記録を保存でき、どの端末でも同期されます。",
    loading: "読み込み中…",

    saved: "保存しました",
    saveFailed: "保存に失敗しました。通信環境をご確認ください",
    loadFailed: "読み込みに失敗しました。ページを再読み込みしてください",
    signInFailed: "ログインに失敗しました。もう一度お試しください",
    popupBlocked: "ポップアップがブロックされました。許可してから再度お試しください",

    tipTheme: "ダークモード",
    tipMenu: "サイドバー",
    sideLang: "言語",
    sideStats: "収集状況",
    sideFilter: "絞り込み",
    sideView: "表示",
    viewDex: "ポケモン図鑑",
    viewBg: "背景コレクション",
    filterBg: "背景未取得",
    bgSection: "イベント背景",
    bgAllEvents: "すべてのイベント",
    bgGlobal: "グローバル",
    bgRegional: "地域限定",
  },

  en: {
    htmlLang: "en",
    subtitle: "Legendary collection tracker",
    search: "Search by name or number",

    filterAll: "All",
    filterXxl: "XXL missing",
    filterXxs: "XXS missing",
    filterIv: "IV100 missing",
    filterGot: "Collected",

    gen: "Gen %s",
    complete: "complete",
    empty: "No Pokémon match this filter",

    cp20: "LV 20 CP",
    cp25: "LV 25 CP",
    noCp: "—",
    status: "Collection",
    xxl: "XXL",
    xxs: "XXS",
    iv100: "IV100",
    shiny: "Shiny",
    lucky: "Lucky",
    close: "Close",

    signIn: "Sign in with Google",
    signOut: "Sign out",
    signedInAs: "Signed in",
    guestNotice: "You're viewing sample data. Sign in to track your own collection and sync it across devices.",
    loading: "Loading…",

    saved: "Saved",
    saveFailed: "Couldn't save. Check your connection and try again.",
    loadFailed: "Couldn't load your data. Refresh the page to retry.",
    signInFailed: "Sign-in didn't complete. Try again.",
    popupBlocked: "Your browser blocked the sign-in window. Allow pop-ups and try again.",

    tipTheme: "Dark mode",
    tipMenu: "Sidebar",
    sideLang: "Language",
    sideStats: "Collection",
    sideFilter: "Filter",
    sideView: "View",
    viewDex: "Pokédex",
    viewBg: "Backgrounds",
    filterBg: "Background missing",
    bgSection: "Event backgrounds",
    bgAllEvents: "All events",
    bgGlobal: "Global",
    bgRegional: "Regional",
  },
};

/** 取得目前語言的文字；%s 會被 arg 取代 */
export function makeT(lang) {
  const dict = STRINGS[lang] || STRINGS[DEFAULT_LANG];
  return (key, arg) => {
    const s = dict[key] ?? key;
    return arg === undefined ? s : s.replace("%s", arg);
  };
}
