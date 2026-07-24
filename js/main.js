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
import { buildShareImage, downloadBlob } from "./share.js";

const $ = (sel) => document.querySelector(sel);

const guest = guestList();

const state = {
  user: null,
  list: guest.list,
  // 裝扮皮卡丘紀錄，["normal", "reds-hat*", ...]
  pika: guest.pika,
  // 交換想要清單 { p003: {xxl,xxs,shiny,bg} }
  want: guest.want,
  // 不在圖鑑 79 隻內的背卡紀錄 { cardId: ["d131", ...] }
  extraBg: guest.extraBg,
  lang: DEFAULT_LANG,
  filter: "all",
  query: "",
  openId: null,
  openPika: null,
  openWant: null,
  // 目前正在看的交換清單（0–3）
  wantTab: 0,
  // 背卡圖鑑的導覽狀態：level 為 grid（背卡總覽）或 cardDetail（單張背卡）
  view: "dex",
  nav: { level: "grid", cardId: null },
};

let t = makeT(state.lang);

/* ─────────── 繪製 ─────────── */

function draw() {
  ui.setView(state.view, t);

  if (state.view === "want") {
    ui.renderStats(state.list);
    ui.renderFilterCounts(state.list);
    ui.renderGuestNotice(false, t);
    ui.renderWantGrid(state.list, state.want, state.wantTab, state.lang, t, !!state.user, state.query);
    return;
  }

  if (state.view === "pika") {
    ui.renderPikaStats(state.pika, t);
    ui.renderGuestNotice(false, t);
    ui.renderPikaGrid(state.pika, state.lang, t, !!state.user, state.query);
    return;
  }

  ui.renderStats(state.list);
  ui.renderFilterCounts(state.list);

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
  if (state.openWant !== null) {
    const w = curList().items[state.openWant];
    const p = w && state.list.find((x) => x.id === w.id);
    if (p) return ui.renderWantEdit(p, w, state.openWant, state.lang, t);
    state.openWant = null;
  }
  if (state.openPika) {
    ui.renderPikaDetail(state.openPika, state.pika, state.extraBg, state.lang, t, !!state.user);
    return;
  }
  const p = state.list.find((x) => x.id === state.openId);
  if (!p) return;
  ui.renderDetail(p, state.lang, t, !!state.user, state.want, state.wantTab);
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
    // 沒有 IV100 就不該有子狀態，一併清掉避免矛盾
    if (!p.iv100.has) {
      p.iv100.shiny = false;
      p.iv100.lucky = false;
      p.iv100.both = false;
    }
  } else if (key === "both") {
    p.iv100.both = !p.iv100.both;
    // 異色亮晶晶必然同時是異色與亮晶晶
    if (p.iv100.both) {
      p.iv100.shiny = true;
      p.iv100.lucky = true;
    }
  } else {
    // both 開著時，異色與亮晶晶被鎖住（UI 已 disabled，這裡再擋一次）
    if (p.iv100.both) return;
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

/** 找出某個裝扮在 pika 陣列裡的位置（忽略後綴） */
function pikaIndex(id) {
  return state.pika.findIndex((k) => {
    const bare = String(k).replace(/[*+#]+$/, "");
    return bare === id;
  });
}

/** 讀出某個裝扮目前的狀態 */
function pikaState(id) {
  const sets = ui.pikaSets(state.pika);
  return {
    has: sets.owned.has(id),
    shiny: sets.shiny.has(id),
    lucky: sets.lucky.has(id),
    both: sets.both.has(id),
  };
}

/**
 * 切換裝扮皮卡丘的狀態。
 * key 為 has / shiny / lucky / both。
 */
function togglePikaState(id, key) {
  if (!state.user || !id) return;
  const st = pikaState(id);
  const i = pikaIndex(id);

  if (key === "has") {
    if (st.has) state.pika.splice(i, 1); // 取消擁有時所有子狀態一併消失
    else state.pika.push(id);
  } else {
    if (!st.has || i < 0) return;
    if (key === "both") {
      st.both = !st.both;
      // 異色亮晶晶必然同時是異色與亮晶晶
      if (st.both) {
        st.shiny = true;
        st.lucky = true;
      }
    } else {
      if (st.both) return; // both 開著時鎖住
      st[key] = !st[key];
    }
    state.pika[i] = ui.pikaKey(id, st);
  }

  draw();
  if (ui.isSheetOpen()) drawDetail();
  save();
}

/** 產生並下載分享圖 */
async function doShare(btn) {
  const byId = Object.create(null);
  for (const p of state.list) byId[p.id] = p;
  const items = curList()
    .items.filter((w) => byId[w.id])
    .map((w) => ({ ...byId[w.id], want: w }));
  if (!items.length) return;

  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = t("sharing");
  try {
    const blob = await buildShareImage(items, {
      title: curList().name || t("shareTitle"),
      dark: document.body.classList.contains("dark"),
      lang: state.lang,
    });
    if (blob) {
      downloadBlob(blob, `trade-list-${Date.now()}.png`);
      ui.toast(t("shareDone"));
    } else {
      ui.toast(t("saveFailed"));
    }
  } catch (err) {
    console.error("[share] failed:", err);
    ui.toast(t("saveFailed"));
  }
  btn.disabled = false;
  btn.textContent = label;
}

/** 目前作用中的清單 */
function curList() {
  return state.want.lists[state.wantTab];
}

/** 新增一筆交換需求（預設想要異色，因為交換的價值就在於重骰） */
function wantNew(pid) {
  if (!state.user) return;
  const l = curList();
  l.items.push({ id: pid, shiny: 1 });
  state.openWant = l.items.length - 1;
  drawDetail();
  draw();
  save();
}

/** 刪除一筆需求 */
function wantDelete(idx) {
  if (!state.user) return;
  const i = Number(idx);
  const l = curList();
  if (!Number.isInteger(i) || !l.items[i]) return;
  l.items.splice(i, 1);
  // 正在編輯的那筆被刪掉就退回上一層
  if (state.openWant === i) state.openWant = null;
  else if (state.openWant !== null && state.openWant > i) state.openWant--;
  drawDetail();
  draw();
  save();
}

/** 修改某筆需求的條件 */
function wantSet(key, value) {
  if (!state.user || state.openWant === null) return;
  const w = curList().items[state.openWant];
  if (!w) return;
  if (key === "bg") {
    if (value) w.bg = value;
    else delete w.bg;
  } else if (w[key]) {
    delete w[key];
  } else {
    w[key] = 1;
  }
  drawDetail();
  draw();
  save();
}

/** 一鍵加入所有還沒 IV100 的傳說，預設想要異色 */
function wantAddMissing() {
  if (!state.user) return;
  const l = curList();
  let added = 0;
  for (const p of state.list) {
    if (p.iv100.has) continue;
    // 已經有同樣「只要異色」的需求就不重複加
    const dup = l.items.some((w) => w.id === p.id && w.shiny && !w.xxl && !w.xxs && !w.bg);
    if (dup) continue;
    l.items.push({ id: p.id, shiny: 1 });
    added++;
  }
  draw();
  if (added) save();
  ui.toast(added ? `+${added}` : t("wantEmpty"));
}

/** 統一的存檔入口，確保所有紀錄一起送出 */
function save() {
  saveUser(
    state.user.uid,
    { list: state.list, extraBg: state.extraBg, pika: state.pika, want: state.want },
    (status) => ui.toast(status === "saved" ? t("saved") : t("saveFailed"))
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
  ui.renderSettings(state.user, LANGS, state.lang, t);
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
  const pikaOpen = e.target.closest("[data-pikaopen]");
  if (pikaOpen) {
    state.openPika = pikaOpen.dataset.pikaopen;
    state.openId = null;
    state.openWant = null;
    drawDetail();
    ui.openSheet();
    return;
  }

  // 皮卡丘面板裡的擁有／異色開關
  const pikaTog = e.target.closest("[data-pikakey]");
  if (pikaTog && !pikaTog.disabled) {
    togglePikaState(state.openPika, pikaTog.dataset.pikakey);
    return;
  }

  // 皮卡丘面板裡的背卡開關
  const wantNewBtn = e.target.closest("[data-wantnew]");
  if (wantNewBtn && !wantNewBtn.disabled) {
    wantNew(wantNewBtn.dataset.wantnew);
    return;
  }

  const wantDel = e.target.closest("[data-wantdel]");
  if (wantDel && !wantDel.disabled) {
    wantDelete(wantDel.dataset.wantdel);
    return;
  }

  const wantEdit = e.target.closest("[data-wantedit]");
  if (wantEdit && !wantEdit.disabled) {
    state.openWant = Number(wantEdit.dataset.wantedit);
    drawDetail();
    return;
  }

  const wantBack = e.target.closest("[data-wantback]");
  if (wantBack) {
    state.openWant = null;
    state.openId = wantBack.dataset.wantback;
    drawDetail();
    return;
  }

  const wantSetBtn = e.target.closest("[data-wantset]");
  if (wantSetBtn && !wantSetBtn.disabled) {
    wantSet(wantSetBtn.dataset.wantset);
    return;
  }

  const wantBg = e.target.closest("[data-wantbg]");
  if (wantBg && !wantBg.disabled) {
    wantSet("bg", wantBg.dataset.wantbg);
    return;
  }

  const wtab = e.target.closest("[data-wanttab]");
  if (wtab) {
    state.wantTab = Number(wtab.dataset.wanttab);
    state.openWant = null;
    draw();
    return;
  }

  if (e.target.id === "renameBtn" || e.target.closest("#renameBtn")) {
    const l = curList();
    const name = prompt(t("wantRenamePrompt"), l.name || "");
    if (name !== null) {
      l.name = name.trim().slice(0, 24);
      draw();
      save();
    }
    return;
  }

  if (e.target.id === "addMissingBtn" || e.target.closest("#addMissingBtn")) {
    wantAddMissing();
    return;
  }

  if (e.target.id === "shareBtn" || e.target.closest("#shareBtn")) {
    await doShare(e.target.closest("#shareBtn") || e.target);
    return;
  }

  const bgKeyTog = e.target.closest("[data-bgkey]");
  if (bgKeyTog && !bgKeyTog.disabled) {
    toggleBg(bgKeyTog.dataset.bgkey, bgKeyTog.dataset.bgcard);
    return;
  }

  if (e.target.id === "settingsBtn" || e.target.closest("#settingsBtn")) {
    ui.toggleSettings();
    return;
  }

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
    state.query = "";
    const q = document.querySelector("#q");
    if (q) q.value = "";
    draw();
    if (isNarrow()) setSidebar(false);
    return;
  }

  // 點到選單以外的地方就收起設定
  if (ui.settingsOpen() && !e.target.closest("#settingsWrap")) {
    ui.toggleSettings(false);
  }

  const cell = e.target.closest(".cell");
  if (cell && cell.dataset.id) {
    state.openId = cell.dataset.id;
    state.openPika = null;
    state.openWant = null;
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
    ui.toggleSettings(false);
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
    ui.toggleSettings(false);
    await flush();
    await signOut();
    return;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (ui.settingsOpen()) {
    ui.toggleSettings(false);
  } else if (ui.isSheetOpen()) {
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
  ui.renderSettings(user, LANGS, state.lang, t);

  if (!user) {
    const g = guestList();
    state.list = g.list;
    state.extraBg = g.extraBg;
    state.pika = g.pika;
    state.want = g.want;
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
  state.pika = loaded.pika;
  state.want = loaded.want;
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

  ui.buildViewSwitch();
  ui.buildFilterBar();
  ui.renderChrome(state.lang, t);
  ui.renderAuth(null, t);
  ui.renderSettings(null, LANGS, state.lang, t);

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
