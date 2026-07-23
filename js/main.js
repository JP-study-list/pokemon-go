/**
 * main.js — 進入點
 *
 * 負責把各模組接起來，並保管目前的狀態（列表、語言、篩選）。
 * 資料流：使用者操作 → 更新 state → 重繪 → 存檔
 */

import { LANGS, DEFAULT_LANG, makeT } from "./i18n.js";
import { signIn, signOut, watchAuth } from "./auth.js";
import { loadUser, guestList, saveUser, flush } from "./store.js";
import * as ui from "./ui.js";

const $ = (sel) => document.querySelector(sel);

const guest = guestList();

const state = {
  user: null,
  list: guest.list,
  // 不在圖鑑 79 隻內的背卡紀錄 { cardId: ["d131", ...] }
  extraBg: guest.extraBg,
  lang: DEFAULT_LANG,
  filter: "all",
  query: "",
  openId: null,
  // 背卡圖鑑的導覽狀態：level 為 grid（背卡總覽）或 cardDetail（單張背卡）
  view: "dex",
  nav: { level: "grid", cardId: null },
};

let t = makeT(state.lang);

/* ─────────── 繪製 ─────────── */

function draw() {
  ui.renderStats(state.list);
  ui.renderFilterCounts(state.list);
  ui.setView(state.view, t);

  if (state.view === "bg") {
    // 背卡圖鑑自己有麵包屑導覽，訪客提示由各層自行處理
    ui.renderGuestNotice(false, t);
    if (state.nav.level === "cardDetail") {
      ui.renderCardDetail(state.nav.cardId, state.list, state.extraBg, state.lang, t, !!state.user);
    } else {
      ui.renderCardGrid(state.list, state.extraBg, state.lang, t);
    }
    return;
  }

  const shown = ui.applyFilter(state.list, state.filter, state.query);
  ui.renderGrid(shown, state.lang, t);
  ui.renderGuestNotice(!state.user, t);
}

function drawDetail() {
  const p = state.list.find((x) => x.id === state.openId);
  if (!p) return;
  ui.renderDetail(p, state.lang, t, !!state.user);
}

/* ─────────── 操作 ─────────── */

function toggleField(key) {
  if (!state.user) return; // 訪客唯讀
  const p = state.list.find((x) => x.id === state.openId);
  if (!p) return;

  if (key === "xxl" || key === "xxs") {
    p[key] = !p[key];
  } else if (key === "has") {
    p.iv100.has = !p.iv100.has;
    // 沒有 IV100 就不該有異色 / 亮晶晶，一併清掉避免矛盾狀態
    if (!p.iv100.has) {
      p.iv100.shiny = false;
      p.iv100.lucky = false;
    }
  } else {
    p.iv100[key] = !p.iv100[key];
  }

  drawDetail();
  draw();
  save();
}

/**
 * 切換某個項目在某張背卡上的擁有狀態。
 * entryKey 是 "p003"（圖鑑內傳說）或 "d131"（一般寶可夢）。
 */
function toggleBg(entryKey, cardId) {
  if (!state.user) return;

  if (entryKey.startsWith("p")) {
    const p = state.list.find((x) => x.id === entryKey);
    if (!p) return;
    p.bg = p.bg || [];
    p.bgShiny = p.bgShiny || [];
    const i = p.bg.indexOf(cardId);
    if (i >= 0) {
      p.bg.splice(i, 1);
      // 取消背卡時一併清掉異色，避免留下沒有背卡的異色紀錄
      p.bgShiny = p.bgShiny.filter((c) => c !== cardId);
    } else {
      p.bg.push(cardId);
    }
  } else {
    const arr = (state.extraBg[cardId] ||= []);
    const i = arr.findIndex((k) => k === entryKey || k === `${entryKey}*`);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(entryKey);
    if (!arr.length) delete state.extraBg[cardId];
  }

  draw();
  if (ui.isSheetOpen()) drawDetail();
  save();
}

/**
 * 切換某張背卡上該項目的異色標記。
 * 異色是背卡的子狀態，沒有背卡就不能標記。
 */
function toggleBgShiny(entryKey, cardId) {
  if (!state.user) return;

  if (entryKey.startsWith("p")) {
    const p = state.list.find((x) => x.id === entryKey);
    if (!p || !(p.bg || []).includes(cardId)) return;
    p.bgShiny = p.bgShiny || [];
    const i = p.bgShiny.indexOf(cardId);
    if (i >= 0) p.bgShiny.splice(i, 1);
    else p.bgShiny.push(cardId);
  } else {
    const arr = state.extraBg[cardId];
    if (!arr) return;
    const i = arr.findIndex((k) => k === entryKey || k === `${entryKey}*`);
    if (i < 0) return; // 沒有背卡，不能標異色
    arr[i] = arr[i].endsWith("*") ? entryKey : `${entryKey}*`;
  }

  draw();
  save();
}

/** 統一的存檔入口，確保 extraBg 一起送出 */
function save() {
  saveUser(state.user.uid, state.list, state.extraBg, (status) =>
    ui.toast(status === "saved" ? t("saved") : t("saveFailed"))
  );
}

function setLang(code) {
  state.lang = code;
  t = makeT(code);
  try {
    localStorage.setItem("pkm.lang", code);
  } catch (_) {}
  ui.renderChrome(state.lang, t);
  ui.renderAuth(state.user, t);
  draw();
  if (ui.isSheetOpen()) drawDetail();
}

function setTheme(dark) {
  document.body.classList.toggle("dark", dark);
  try {
    localStorage.setItem("pkm.dark", dark ? "1" : "0");
  } catch (_) {}
}

/** 窄螢幕時側欄是浮動覆蓋，行為和桌機不同 */
function isNarrow() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function setSidebar(open) {
  ui.setSidebar(open);
  // 手機的開合是臨時的，不記憶，避免下次在桌機開啟時是收合狀態
  if (!isNarrow()) {
    try {
      localStorage.setItem("pkm.side", open ? "1" : "0");
    } catch (_) {}
  }
}

/* ─────────── 事件 ─────────── */

document.addEventListener("click", async (e) => {
  // 背卡圖鑑第三層的方格：點一下即切換擁有狀態
  // 異色標記要在背卡格之前判斷，否則點擊會被格子攔截
  const shinyMark = e.target.closest(".shiny-mark");
  if (shinyMark) {
    if (!shinyMark.classList.contains("is-locked")) {
      const card = shinyMark.closest(".bgcell").querySelector(".bgcell-main");
      toggleBgShiny(shinyMark.dataset.shiny, card.dataset.bgtoggle);
    }
    return;
  }

  const bgMain = e.target.closest(".bgcell-main");
  if (bgMain) {
    if (!bgMain.disabled) toggleBg(bgMain.dataset.entry, bgMain.dataset.bgtoggle);
    return;
  }

  const tile = e.target.closest(".bg-tile");
  if (tile) {
    state.nav = { level: "cardDetail", cardId: tile.dataset.card };
    draw();
    window.scrollTo(0, 0);
    return;
  }

  const crumb = e.target.closest(".crumb");
  if (crumb) {
    state.nav = { level: "grid", cardId: null };
    draw();
    return;
  }

  const viewBtn = e.target.closest("#views button");
  if (viewBtn) {
    state.view = viewBtn.dataset.view;
    if (state.view === "bg") state.nav = { level: "grid", cardId: null };
    draw();
    if (isNarrow()) setSidebar(false);
    return;
  }

  const cell = e.target.closest(".cell");
  if (cell) {
    state.openId = cell.dataset.id;
    drawDetail();
    ui.openSheet();
    return;
  }

  const bgTog = e.target.closest(".tog-bg");
  if (bgTog && !bgTog.disabled) {
    toggleBg(state.openId, bgTog.dataset.bgcard);
    return;
  }

  const tog = e.target.closest(".tog");
  if (tog && !tog.disabled) {
    toggleField(tog.dataset.key);
    return;
  }

  if (e.target.id === "closeDetail" || e.target.id === "sheet") {
    ui.closeSheet();
    return;
  }

  const chip = e.target.closest(".chip");
  if (chip) {
    state.filter = chip.dataset.filter;
    document
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.toggle("is-on", c === chip));
    draw();
    if (isNarrow()) setSidebar(false); // 手機上選完就收起，免得擋住卡片
    return;
  }

  if (e.target.id === "menuBtn" || e.target.closest("#menuBtn")) {
    setSidebar(document.body.classList.contains("side-closed"));
    return;
  }

  if (e.target.id === "scrim") {
    setSidebar(false);
    return;
  }

  const langBtn = e.target.closest("#langs button");
  if (langBtn) {
    setLang(langBtn.dataset.lang);
    return;
  }

  if (e.target.id === "themeBtn") {
    setTheme(!document.body.classList.contains("dark"));
    return;
  }

  if (e.target.id === "signInBtn") {
    // 登入成功後 watchAuth 會重繪整個登入區，這個按鈕會被換掉，
    // 所以只在失敗時把它恢復可按（此時按鈕還在原地）。
    e.target.disabled = true;
    const res = await signIn();
    if (!res.ok) {
      const btn = document.querySelector("#signInBtn");
      if (btn) btn.disabled = false;
      if (res.reason !== "cancelled") ui.toast(t(res.reason));
    }
    return;
  }

  if (e.target.id === "signOutBtn") {
    await flush();
    await signOut();
    return;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (ui.isSheetOpen()) {
    ui.closeSheet();
  } else if (isNarrow() && !document.body.classList.contains("side-closed")) {
    setSidebar(false);
  }
});

$("#q").addEventListener("input", (e) => {
  state.query = e.target.value;
  draw();
});

// 離開頁面前把還沒送出的變更寫掉
window.addEventListener("pagehide", () => {
  flush();
});

// 視窗跨越手機／桌機分界時，重新套用該尺寸應有的側欄狀態
let wasNarrow = null;
window.addEventListener("resize", () => {
  const narrow = isNarrow();
  if (narrow === wasNarrow) return;
  wasNarrow = narrow;
  if (narrow) {
    ui.setSidebar(false);
  } else {
    let open = true;
    try {
      open = localStorage.getItem("pkm.side") !== "0";
    } catch (_) {}
    ui.setSidebar(open);
  }
});

/* ─────────── 登入狀態 ─────────── */

// 若短時間內連續切換帳號，較早的讀取可能比較晚回來。
// 用序號確保只有最後一次的結果會被採用。
let authSeq = 0;

watchAuth(async (user) => {
  const seq = ++authSeq;
  state.user = user;
  ui.renderAuth(user, t);

  if (!user) {
    const g = guestList();
    state.list = g.list;
    state.extraBg = g.extraBg;
    ui.closeSheet();
    draw();
    return;
  }

  ui.setBusy(true);
  let loaded;
  try {
    loaded = await loadUser(user.uid);
  } catch (err) {
    console.error("[main] load failed:", err);
    if (seq === authSeq) ui.toast(t("loadFailed"));
    loaded = guestList();
  }
  ui.setBusy(false);
  if (seq !== authSeq) return; // 已經有更新的登入事件，丟棄這次結果

  state.list = loaded.list;
  state.extraBg = loaded.extraBg;
  draw();
  if (ui.isSheetOpen()) drawDetail();
});

/* ─────────── 啟動 ─────────── */

function boot() {
  try {
    const savedLang = localStorage.getItem("pkm.lang");
    if (savedLang && LANGS.some((l) => l.code === savedLang)) {
      state.lang = savedLang;
      t = makeT(savedLang);
    }
    if (localStorage.getItem("pkm.dark") === "1") {
      document.body.classList.add("dark");
    }
  } catch (_) {}

  ui.buildLangSwitch(LANGS, state.lang);
  ui.buildViewSwitch();
  ui.buildFilterBar();
  ui.renderChrome(state.lang, t);
  ui.renderAuth(null, t);

  // 手機預設收合；桌機沿用上次的狀態
  let open = !isNarrow();
  if (!isNarrow()) {
    try {
      open = localStorage.getItem("pkm.side") !== "0";
    } catch (_) {}
  }
  ui.setSidebar(open);

  draw();
  $("#app").hidden = false;
}

boot();
