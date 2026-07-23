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

const $ = (sel) => document.querySelector(sel);

/** 篩選選項。key 對應 i18n 的字串代號 */
export const FILTERS = [
  { id: "all", label: "filterAll" },
  { id: "xxl", label: "filterXxl" },
  { id: "xxs", label: "filterXxs" },
  { id: "iv", label: "filterIv" },
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
      case "got":
        return p.xxl || p.xxs || p.iv100.has;
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
  const empty = !p.xxl && !p.xxs && !p.iv100.has;
  const pip = (on, color) =>
    on ? `<i class="pip" style="background:${color}"></i>` : "";
  const cp = (v) => (v == null ? "—" : v);
  return `
    <button class="cell${empty ? " is-empty" : ""}" data-id="${p.id}" type="button">
      <span class="pips">
        ${pip(p.xxl, "var(--xxl)")}${pip(p.xxs, "var(--xxs)")}${pip(p.iv100.has, "var(--iv)")}
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
