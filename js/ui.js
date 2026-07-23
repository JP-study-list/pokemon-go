/**
 * ui.js — 畫面繪製
 *
 * 這個檔案只負責「把資料變成畫面」，不碰 Firebase，也不決定資料怎麼變。
 * 所有使用者操作都透過 handlers 回報給 main.js 處理。
 *
 * ── 常見修改 ──
 * 想改卡片長相 → renderCard
 * 想改詳情面板 → renderDetail
 * 想加篩選條件 → FILTERS 陣列 + applyFilter
 */

import { artUrl } from "./data.js";
import { typeInfo } from "./types.js";
import { allCards, cardsFor, entriesOf } from "./backgrounds.js";
import { lookup } from "./pokedex.js";

const $ = (sel) => document.querySelector(sel);

/** 篩選選項。key 對應 i18n 的字串代號 */
export const FILTERS = [
  { id: "all", label: "filterAll" },
  { id: "xxl", label: "filterXxl" },
  { id: "xxs", label: "filterXxs" },
  { id: "iv", label: "filterIv" },
  { id: "bg", label: "filterBg" },
  { id: "got", label: "filterGot" },
];

/** 依條件過濾 */
export function applyFilter(list, filterId, query) {
  const q = query.trim().toLowerCase();
  return list.filter((p) => {
    if (q) {
      const hit =
        p.zh.toLowerCase().includes(q) ||
        p.ja.toLowerCase().includes(q) ||
        p.en.toLowerCase().includes(q) ||
        String(p.no).includes(q);
      if (!hit) return false;
    }
    switch (filterId) {
      case "xxl":
        return !p.xxl;
      case "xxs":
        return !p.xxs;
      case "iv":
        return !p.iv100.has;
      case "bg":
        return cardsFor(p.id).length > 0 && !(p.bg || []).length;
      case "got":
        return p.xxl || p.xxs || p.iv100.has || (p.bg || []).length > 0;
      default:
        return true;
    }
  });
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const dexNo = (n) => `#${String(n).padStart(3, "0")}`;

/* ─────────── 頂部統計 ─────────── */

export function renderStats(list) {
  const total = list.length;
  const rows = [
    ["XXL", list.filter((p) => p.xxl).length, "var(--xxl)"],
    ["XXS", list.filter((p) => p.xxs).length, "var(--xxs)"],
    ["IV100", list.filter((p) => p.iv100.has).length, "var(--iv)"],
    ["BG", list.filter((p) => (p.bg || []).length > 0).length, "var(--bg-card)"],
  ];
  $("#stats").innerHTML = rows
    .map(
      ([label, n, color]) => `
      <div class="stat-row">
        <span class="l">${label}</span>
        <span class="n" style="color:${color}">${n}<span class="of">/${total}</span></span>
        <span class="bar"><i style="width:${total ? (n / total) * 100 : 0}%;background:${color}"></i></span>
      </div>`
    )
    .join("");
}

/* ─────────── 卡片牆 ─────────── */

function renderCard(p, lang) {
  const empty = !p.xxl && !p.xxs && !p.iv100.has && !(p.bg || []).length;
  const pip = (on, color) =>
    on ? `<i class="pip" style="background:${color}"></i>` : "";
  const cp = (v) => (v == null ? "—" : v);
  return `
    <button class="cell${empty ? " is-empty" : ""}" data-id="${p.id}" type="button">
      <span class="pips">
        ${pip(p.xxl, "var(--xxl)")}${pip(p.xxs, "var(--xxs)")}${pip(p.iv100.has, "var(--iv)")}${pip((p.bg || []).length > 0, "var(--bg-card)")}
      </span>
      <img src="${artUrl(p.art)}" alt="" loading="lazy" decoding="async">
      <span class="nm">${esc(p[lang])}</span>
      <span class="dex">${dexNo(p.no)} · ${cp(p.cp20)} / ${cp(p.cp25)}</span>
    </button>`;
}

export function renderGrid(list, lang, t) {
  const box = $("#list");
  if (!list.length) {
    box.innerHTML = `<p class="empty">${t("empty")}</p>`;
    return;
  }
  const gens = [...new Set(list.map((p) => p.gen))].sort((a, b) => a - b);
  box.innerHTML = gens
    .map((g) => {
      const items = list.filter((p) => p.gen === g);
      const done = items.filter((p) => p.xxl && p.xxs && p.iv100.has).length;
      return `
      <section class="gen">
        <h2 class="gen-head">
          ${t("gen", g)}
          <span>${done}/${items.length} ${t("complete")}</span>
        </h2>
        <div class="grid">${items.map((p) => renderCard(p, lang)).join("")}</div>
      </section>`;
    })
    .join("");
}

/* ─────────── 詳情面板 ─────────── */

export function renderDetail(p, lang, t, canEdit) {
  const others = ["zh", "ja", "en"]
    .filter((k) => k !== lang)
    .map((k) => esc(p[k]))
    .join(" · ");

  const cp = (v) =>
    v == null ? `<span class="cp-none">${t("noCp")}</span>` : v;

  const toggle = (key, label, on, color) => `
    <button class="tog" type="button" data-key="${key}" data-on="${on ? 1 : 0}"
            style="--tog:${color}" ${canEdit ? "" : "disabled"}>
      <span>${label}</span><span class="sw" aria-hidden="true"></span>
    </button>`;

  const badges = (p.types || [])
    .map((slug) => {
      const { color, name } = typeInfo(slug, lang);
      return `<span class="type-tag" style="--tt:${color}">${esc(name)}</span>`;
    })
    .join("");

  const myCards = cardsFor(p.id);
  const bgOwned = new Set(p.bg || []);
  const bgSection = myCards.length
    ? `
    <p class="d-sect">${t("bgSection")}</p>
    <div class="togs">
      ${myCards
        .map(
          ({ event, card }) => `
        <button class="tog tog-bg" type="button" data-bgcard="${card.id}"
                data-on="${bgOwned.has(card.id) ? 1 : 0}" style="--tog:var(--bg-card)"
                ${canEdit ? "" : "disabled"}>
          <img class="bg-thumb" src="${card.img}" alt="" loading="lazy">
          <span class="bg-meta">
            <span class="bg-name">${esc(card[lang] || card.en)}</span>
            <span class="bg-ev">${esc(event[lang] || event.en)}</span>
          </span>
          <span class="sw" aria-hidden="true"></span>
        </button>`
        )
        .join("")}
    </div>`
    : "";

  $("#panel").innerHTML = `
    <div class="d-top">
      <img src="${artUrl(p.art)}" alt="" decoding="async">
      <div>
        <h2>${esc(p[lang])}</h2>
        <p class="d-alt">${others}<br>${dexNo(p.no)} · ${t("gen", p.gen)}</p>
        <p class="d-types">${badges}</p>
      </div>
    </div>

    <div class="d-cps">
      <div class="cpbox"><span class="k">${t("cp20")}</span><span class="v">${cp(p.cp20)}</span></div>
      <div class="cpbox"><span class="k">${t("cp25")}</span><span class="v">${cp(p.cp25)}</span></div>
    </div>

    <p class="d-sect">${t("status")}</p>
    <div class="togs">
      ${toggle("xxl", t("xxl"), p.xxl, "var(--xxl)")}
      ${toggle("xxs", t("xxs"), p.xxs, "var(--xxs)")}
      ${toggle("has", t("iv100"), p.iv100.has, "var(--iv)")}
      <div class="sub"${p.iv100.has ? "" : " hidden"}>
        ${toggle("shiny", t("shiny"), p.iv100.shiny, "var(--shiny)")}
        ${toggle("lucky", t("lucky"), p.iv100.lucky, "var(--lucky)")}
      </div>
    </div>
    ${bgSection}

    <button class="btn-close" type="button" id="closeDetail">${t("close")}</button>`;
}

export function openSheet() {
  $("#sheet").classList.add("is-open");
  $("#sheet").setAttribute("aria-hidden", "false");
}

export function closeSheet() {
  $("#sheet").classList.remove("is-open");
  $("#sheet").setAttribute("aria-hidden", "true");
}

export function isSheetOpen() {
  return $("#sheet").classList.contains("is-open");
}

/* ─────────── 登入區 ─────────── */

export function renderAuth(user, t) {
  const box = $("#authArea");
  if (user) {
    const avatar = user.photo
      ? `<img class="avatar" src="${esc(user.photo)}" alt="" referrerpolicy="no-referrer">`
      : "";
    box.innerHTML = `
      ${avatar}
      <span class="who">${esc(user.name)}</span>
      <button class="btn-text" type="button" id="signOutBtn">${t("signOut")}</button>`;
  } else {
    box.innerHTML = `
      <button class="btn-signin" type="button" id="signInBtn">${t("signIn")}</button>`;
  }
}

export function renderGuestNotice(show, t) {
  const el = $("#guestNotice");
  el.hidden = !show;
  if (show) el.textContent = t("guestNotice");
}

/* ─────────── 靜態文字 ─────────── */

export function renderChrome(lang, t) {
  document.documentElement.lang = t("htmlLang");
  $("#subtitle").textContent = t("subtitle");
  $("#q").placeholder = t("search");
  $("#themeBtn").title = t("tipTheme");
  $("#menuBtn").title = t("tipMenu");
  $("#viewTitle").textContent = t("sideView");
  $("#langTitle").textContent = t("sideLang");
  $("#statsTitle").textContent = t("sideStats");
  $("#filterTitle").textContent = t("sideFilter");
  document.querySelectorAll(".chip").forEach((c) => {
    const f = FILTERS.find((x) => x.id === c.dataset.filter);
    const el = c.querySelector(".txt");
    if (f && el) el.textContent = t(f.label);
  });
  document.querySelectorAll("#langs button").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.lang === lang);
    b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
  });
}

/** 側欄開合 */
export function setSidebar(open) {
  document.body.classList.toggle("side-closed", !open);
  $("#menuBtn").setAttribute("aria-expanded", open ? "true" : "false");
  $("#scrim").hidden = !open;
}

export function buildFilterBar() {
  $("#filters").innerHTML = FILTERS.map(
    (f, i) =>
      `<button class="chip${i === 0 ? " is-on" : ""}" type="button" data-filter="${f.id}">
         <span class="txt"></span><span class="count"></span>
       </button>`
  ).join("");
}

/** 更新每個篩選旁的數量 */
export function renderFilterCounts(list) {
  document.querySelectorAll(".chip").forEach((c) => {
    const n = applyFilter(list, c.dataset.filter, "").length;
    const el = c.querySelector(".count");
    if (el) el.textContent = n;
  });
}

export function buildLangSwitch(langs, current) {
  $("#langs").innerHTML = langs
    .map(
      (l) =>
        `<button type="button" data-lang="${l.code}" class="${
          l.code === current ? "is-on" : ""
        }">${l.label}</button>`
    )
    .join("");
}

/* ─────────── 提示訊息 ─────────── */

let toastTimer = null;
export function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), 2000);
}

export function setBusy(on) {
  $("#app").setAttribute("aria-busy", on ? "true" : "false");
}

/* ─────────── 背卡圖鑑 ─────────── */

/** 層級 1：所有背卡的大圖網格（不分活動，活動名稱顯示在卡片下方） */
export function renderCardGrid(list, extraBg, lang, t) {
  const cards = allCards();
  $("#list").innerHTML = `
    <div class="bg-grid">
      ${cards
        .map(({ event, card }) => {
          const total = card.pokemon.length;
          const got = countOwned(card, list, extraBg);
          return `
        <button class="bg-tile" type="button" data-card="${card.id}">
          <span class="bg-thumb-wrap">
            <img src="${card.img}" alt="" loading="lazy">
            <em class="scope-${card.scope}">${t(card.scope === "regional" ? "bgRegional" : "bgGlobal")}</em>
          </span>
          <span class="bg-tile-body">
            <span class="bg-tile-name">${esc(card[lang] || card.en)}</span>
            <span class="bg-tile-ev">${esc(event[lang] || event.en)}</span>
            <span class="bg-tile-foot">
              <span class="bar"><i style="width:${total ? (got / total) * 100 : 0}%;background:var(--bg-card)"></i></span>
              <span class="ev-n">${got}/${total}</span>
            </span>
          </span>
        </button>`;
        })
        .join("")}
    </div>`;
}

/** 計算某張背卡已取得的數量，同時涵蓋傳說與一般寶可夢 */
function countOwned(card, list, extraBg) {
  const byId = Object.create(null);
  for (const p of list) byId[p.id] = p;
  const extra = new Set((extraBg && extraBg[card.id]) || []);
  let n = 0;
  for (const e of entriesOf(card)) {
    if (e.pid) {
      if ((byId[e.pid]?.bg || []).includes(card.id)) n++;
    } else if (extra.has(e.key)) n++;
  }
  return n;
}

/** 層級 2：某張背卡的寶可夢方格牆 */
export function renderCardDetail(cardId, list, extraBg, lang, t, canEdit) {
  const found = allCards().find(({ card }) => card.id === cardId);
  if (!found) return;
  const { event, card } = found;

  const byId = Object.create(null);
  for (const p of list) byId[p.id] = p;
  const extra = new Set((extraBg && extraBg[card.id]) || []);

  const cells = entriesOf(card)
    .map((e) => {
      let name, art, no, owned;
      if (e.pid) {
        const p = byId[e.pid];
        if (!p) return "";
        name = p[lang];
        art = artUrl(p.art);
        no = p.no;
        owned = (p.bg || []).includes(card.id);
      } else {
        const d = lookup(e.dex, lang);
        if (!d) return "";
        name = d.name;
        art = d.art;
        no = d.no;
        owned = extra.has(e.key);
      }
      const note = e.note ? e.note[lang] || e.note.en : "";
      return `
      <button class="cell bgcell${owned ? " is-owned" : " is-empty"}" type="button"
              data-bgtoggle="${card.id}" data-entry="${e.key}" ${canEdit ? "" : "disabled"}>
        <img src="${art}" alt="" loading="lazy" decoding="async">
        <span class="nm">${esc(name)}</span>
        ${note ? `<span class="note">${esc(note)}</span>` : ""}
        <span class="dex">${dexNo(no)}</span>
      </button>`;
    })
    .join("");

  const total = card.pokemon.length;
  const got = countOwned(card, list, extraBg);

  $("#list").innerHTML = `
    <button class="crumb" type="button" data-back="grid">← ${t("bgAllEvents")}</button>
    <div class="bg-head">
      <img src="${card.img}" alt="">
      <div>
        <h2>${esc(card[lang] || card.en)}</h2>
        <p class="bg-ev-line">${esc(event[lang] || event.en)} · ${esc(event.date)}</p>
        <p class="bg-note">${esc(card[`note_${lang}`] || card.note_en || "")}</p>
        <p class="bg-count">${got} / ${total}</p>
      </div>
    </div>
    ${canEdit ? "" : `<p class="guest-notice">${t("guestNotice")}</p>`}
    <div class="grid">${cells}</div>`;
}

/** 檢視切換（寶可夢圖鑑 / 背卡圖鑑） */
export function buildViewSwitch() {
  $("#views").innerHTML = `
    <button type="button" data-view="dex" class="is-on"></button>
    <button type="button" data-view="bg"></button>`;
}

/**
 * 套用目前的檢視：切換按鈕高亮，並隱藏背卡圖鑑用不到的控制項
 */
export function setView(view, t) {
  document.querySelectorAll("#views button").forEach((b) => {
    const on = b.dataset.view === view;
    b.classList.toggle("is-on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.textContent = t(b.dataset.view === "dex" ? "viewDex" : "viewBg");
  });
  // 搜尋與篩選只對寶可夢圖鑑有意義
  const dex = view === "dex";
  $("#q").hidden = !dex;
  $("#filterBlock").hidden = !dex;
}
