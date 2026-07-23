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

const state = {
  user: null,
  list: guestList(),
  lang: DEFAULT_LANG,
  filter: "all",
  query: "",
  openId: null,
};

let t = makeT(state.lang);

/* ─────────── 繪製 ─────────── */

function draw() {
  const shown = ui.applyFilter(state.list, state.filter, state.query);
  ui.renderStats(state.list);
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
  saveUser(state.user.uid, state.list, (status) =>
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

/* ─────────── 事件 ─────────── */

document.addEventListener("click", async (e) => {
  const cell = e.target.closest(".cell");
  if (cell) {
    state.openId = cell.dataset.id;
    drawDetail();
    ui.openSheet();
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
  if (e.key === "Escape" && ui.isSheetOpen()) ui.closeSheet();
});

$("#q").addEventListener("input", (e) => {
  state.query = e.target.value;
  draw();
});

// 離開頁面前把還沒送出的變更寫掉
window.addEventListener("pagehide", () => {
  flush();
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
    state.list = guestList();
    ui.closeSheet();
    draw();
    return;
  }

  ui.setBusy(true);
  let list;
  try {
    list = await loadUser(user.uid);
  } catch (err) {
    console.error("[main] load failed:", err);
    if (seq === authSeq) ui.toast(t("loadFailed"));
    list = guestList();
  }
  ui.setBusy(false);
  if (seq !== authSeq) return; // 已經有更新的登入事件，丟棄這次結果

  state.list = list;
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
  ui.buildFilterBar();
  ui.renderChrome(state.lang, t);
  ui.renderAuth(null, t);
  draw();
  $("#app").hidden = false;
}

boot();
