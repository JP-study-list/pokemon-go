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

import { spriteAttrs, shinyAttrs } from "./data.js";
import { typeInfo } from "./types.js";
import { movesetsFor } from "./moves.js";
import { allCards, cardsFor, cardsForCostume, entriesOf } from "./backgrounds.js";
import { lookup } from "./pokedex.js";
import { COSTUMES, costumeArt, findCostume, COSTUME_COUNT } from "./pikachu.js";

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


/**
 * 遊戲風格的狀態圖示。
 *
 * 用內嵌 SVG 而非圖片檔，因為 PokeMiners 的圖示路徑不穩定，
 * 而且這兩個形狀很簡單，內嵌可以避免額外的網路請求與破圖風險。
 *
 * shiny  三顆星，對應遊戲裡異色寶可夢的閃光特效
 * lucky  菱形亮點，對應幸運寶可夢的金色閃爍
 */
const ICON_SHINY = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M9 2.5l1.5 4L14.5 8l-4 1.5L9 13.5 7.5 9.5 3.5 8l4-1.5z"/>
  <path d="M17 11l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z"/>
  <path d="M11.5 16.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/>
</svg>`;

const ICON_LUCKY = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 2.5c1.4 4.3 3.2 6.1 7.5 7.5-4.3 1.4-6.1 3.2-7.5 7.5-1.4-4.3-3.2-6.1-7.5-7.5 4.3-1.4 6.1-3.2 7.5-7.5z"/>
  <circle cx="18.5" cy="18" r="2.2"/>
</svg>`;

/** 狀態圖示標記，顯示在卡片左上角 */
function stateMark(kind, title) {
  const svg = kind === "lucky" ? ICON_LUCKY : ICON_SHINY;
  return `<span class="smark smark-${kind}" title="${esc(title)}">${svg}</span>`;
}

/** 依收集狀態產生左上角的圖示（異色亮晶晶時兩個都顯示） */
function stateMarks(st, t) {
  if (!st) return "";
  const out = [];
  if (st.both) {
    out.push(stateMark("shiny", t("shinyLucky")));
    out.push(stateMark("lucky", t("shinyLucky")));
  } else {
    if (st.shiny) out.push(stateMark("shiny", t("shiny")));
    if (st.lucky) out.push(stateMark("lucky", t("lucky")));
  }
  return out.length ? `<span class="smarks">${out.join("")}</span>` : "";
}

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

function renderCard(p, lang, t) {
  const empty = !p.xxl && !p.xxs && !p.iv100.has && !(p.bg || []).length;
  const pip = (on, color) =>
    on ? `<i class="pip" style="background:${color}"></i>` : "";
  const cp = (v) => (v == null ? "—" : v);
  return `
    <button class="cell${empty ? " is-empty" : ""}" data-id="${p.id}" type="button">
      <span class="pips">
        ${pip(p.xxl, "var(--xxl)")}${pip(p.xxs, "var(--xxs)")}${pip(p.iv100.has, "var(--iv)")}${pip((p.bg || []).length > 0, "var(--bg-card)")}
      </span>
      ${stateMarks(p.iv100, t)}
      <img ${spriteAttrs(p.go, p.art)} alt="" loading="lazy" decoding="async">
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
        <div class="grid">${items.map((p) => renderCard(p, lang, t)).join("")}</div>
      </section>`;
    })
    .join("");
}

/* ─────────── 詳情面板 ─────────── */

export function renderDetail(p, lang, t, canEdit, want, wantTab) {
  const others = ["zh", "ja", "en"]
    .filter((k) => k !== lang)
    .map((k) => esc(p[k]))
    .join(" · ");

  const cp = (v) =>
    v == null ? `<span class="cp-none">${t("noCp")}</span>` : v;

  const toggle = (key, label, on, color, locked) => `
    <button class="tog${locked ? " is-locked" : ""}" type="button" data-key="${key}"
            data-on="${on ? 1 : 0}" style="--tog:${color}"
            ${canEdit && !locked ? "" : "disabled"}
            ${locked ? `title="${esc(t("lockedByBoth"))}"` : ""}>
      <span>${label}</span><span class="sw" aria-hidden="true"></span>
    </button>`;

  const badges = (p.types || [])
    .map((slug) => {
      const { color, name } = typeInfo(slug, lang);
      return `<span class="type-tag" style="--tt:${color}">${esc(name)}</span>`;
    })
    .join("");

  // 團體戰最佳配招
  const sets = movesetsFor(p.id, lang);
  const moveBlock = sets.length
    ? `
    <p class="d-sect">${t("bestMoves")}</p>
    <div class="movesets">
      ${sets
        .map(
          (m, i) => `
        <div class="moveset">
          <span class="ms-rank">${i + 1}</span>
          <span class="ms-moves">
            <span class="mv" style="--mv:var(--type-${m.fast.type})">${esc(m.fast.name)}${
              m.eliteFast ? `<em title="${esc(t("eliteMove"))}">★</em>` : ""
            }</span>
            <span class="ms-plus">+</span>
            <span class="mv" style="--mv:var(--type-${m.charged.type})">${esc(m.charged.name)}${
              m.eliteCharged ? `<em title="${esc(t("eliteMove"))}">★</em>` : ""
            }</span>
          </span>
        </div>`
        )
        .join("")}
    </div>`
    : "";

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
      <img ${spriteAttrs(p.go, p.art)} alt="" decoding="async">
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

    ${moveBlock}

    <p class="d-sect">${t("status")}</p>
    <div class="togs">
      ${toggle("xxl", t("xxl"), p.xxl, "var(--xxl)")}
      ${toggle("xxs", t("xxs"), p.xxs, "var(--xxs)")}
      ${toggle("has", t("iv100"), p.iv100.has, "var(--iv)")}
      <div class="sub"${p.iv100.has ? "" : " hidden"}>
        ${toggle("shiny", t("shiny"), p.iv100.shiny, "var(--shiny)", p.iv100.both)}
        ${toggle("lucky", t("lucky"), p.iv100.lucky, "var(--lucky)", p.iv100.both)}
        ${toggle("both", t("shinyLucky"), p.iv100.both, "var(--both)", false)}
      </div>
    </div>
    ${bgSection}
    ${wantSection(p, want, wantTab || 0, lang, t, canEdit)}

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
    // 登入後只留頭像，登出移到設定選單裡
    box.innerHTML = user.photo
      ? `<img class="avatar" src="${esc(user.photo)}" alt="" referrerpolicy="no-referrer">`
      : `<span class="who">${esc(user.name)}</span>`;
  } else {
    box.innerHTML = `<button class="btn-signin" type="button" id="signInBtn">${t("signIn")}</button>`;
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
  $("#statsTitle").textContent = t("sideStats");
  $("#filterTitle").textContent = t("sideFilter");
  document.querySelectorAll(".chip").forEach((c) => {
    const f = FILTERS.find((x) => x.id === c.dataset.filter);
    const el = c.querySelector(".txt");
    if (f && el) el.textContent = t(f.label);
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
  const extra = strip((extraBg && extraBg[card.id]) || []);
  let n = 0;
  for (const e of entriesOf(card)) {
    if (e.pid) {
      if ((byId[e.pid]?.bg || []).includes(card.id)) n++;
    } else if (extra.has(e.key)) n++;
  }
  return n;
}

/** 把帶 "*" 的鍵去掉標記後放進 Set，方便比對 */
function strip(keys) {
  const out = new Set();
  for (const k of keys) out.add(k.endsWith("*") ? k.slice(0, -1) : k);
  return out;
}

/** 這些鍵裡哪些是異色 */
function shinySet(keys) {
  const out = new Set();
  for (const k of keys) if (k.endsWith("*")) out.add(k.slice(0, -1));
  return out;
}

/** 層級 2：某張背卡的寶可夢方格牆 */
export function renderCardDetail(cardId, list, extraBg, lang, t, canEdit) {
  const found = allCards().find(({ card }) => card.id === cardId);
  if (!found) return;
  const { event, card } = found;

  const byId = Object.create(null);
  for (const p of list) byId[p.id] = p;
  const rawExtra = (extraBg && extraBg[card.id]) || [];
  const extra = strip(rawExtra);
  const extraShiny = shinySet(rawExtra);

  const cells = entriesOf(card)
    .map((e) => {
      let name, imgAttrs, no, owned, isShiny;
      if (e.pid) {
        const p = byId[e.pid];
        if (!p) return "";
        name = p[lang];
        imgAttrs = spriteAttrs(p.go, p.art);
        no = p.no;
        owned = (p.bg || []).includes(card.id);
        isShiny = (p.bgShiny || []).includes(card.id);
      } else {
        const cos = e.costume ? findCostume(e.costume) : null;
        if (cos) {
          // 裝扮皮卡丘：用裝扮的圖與名稱
          const d = lookup(e.dex, lang);
          name = d ? d.name : cos[lang] || cos.en;
          imgAttrs = `src="${costumeArt(cos.file)}"`;
          no = e.dex;
        } else {
          const d = lookup(e.dex, lang);
          if (!d) return "";
          name = d.name;
          // GO 圖示找不到時自動退回官方立繪
          imgAttrs = `src="${d.art}" onerror="this.onerror=null;this.src='${d.fallback}'"`;
          no = d.no;
        }
        owned = extra.has(e.key);
        isShiny = extraShiny.has(e.key);
      }
      const note = e.note ? e.note[lang] || e.note.en : "";
      // 異色是背卡的子狀態：沒有背卡就不能標記異色
      const shinyBtn = `
        <span class="shiny-mark${isShiny ? " is-on" : ""}${owned ? "" : " is-locked"}"
              data-shiny="${e.key}" title="${esc(t("shiny"))}"
              role="button" aria-pressed="${isShiny ? "true" : "false"}">✦</span>`;
      return `
      <div class="cell bgcell${owned ? " is-owned" : " is-empty"}">
        <button class="bgcell-main" type="button" data-bgtoggle="${card.id}"
                data-entry="${e.key}" ${canEdit ? "" : "disabled"}>
          <img ${imgAttrs} alt="" loading="lazy" decoding="async">
          <span class="nm">${esc(name)}</span>
          ${note ? `<span class="note">${esc(note)}</span>` : ""}
          <span class="dex">${dexNo(no)}</span>
        </button>
        ${canEdit ? shinyBtn : ""}
      </div>`;
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
    <button type="button" data-view="bg"></button>
    <button type="button" data-view="pika"></button>
    <button type="button" data-view="want"></button>`;
}

/**
 * 套用目前的檢視：切換按鈕高亮，並隱藏背卡圖鑑用不到的控制項
 */
export function setView(view, t) {
  document.querySelectorAll("#views button").forEach((b) => {
    const on = b.dataset.view === view;
    b.classList.toggle("is-on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
    const map = { dex: "viewDex", bg: "viewBg", pika: "viewPika", want: "viewWant" };
    b.textContent = t(map[b.dataset.view]);
  });
  // 搜尋在寶可夢圖鑑與皮卡丘圖鑑都有用；篩選只對寶可夢圖鑑有意義
  $("#q").hidden = view === "bg";
  $("#filterBlock").hidden = view !== "dex";
}

/* ─────────── 皮卡丘圖鑑 ─────────── */

/**
 * 把 pika 陣列拆成幾個集合。
 *
 * 鍵的後綴表示額外狀態，可以疊加：
 *   "reds-hat"    一般
 *   "reds-hat*"   異色
 *   "reds-hat+"   亮晶晶
 *   "reds-hat#"   異色亮晶晶（最難的那種，獨立成就）
 *
 * 舊資料只有 "*"，讀進來行為不變。
 */
export function pikaSets(pika) {
  const owned = new Set();
  const shiny = new Set();
  const lucky = new Set();
  const both = new Set();
  for (const raw of pika || []) {
    if (typeof raw !== "string" || !raw) continue;
    let id = raw;
    let s = false, l = false, b = false;
    // 後綴可能有多個，逐一剝除
    while (id.length && "*+#".includes(id[id.length - 1])) {
      const ch = id[id.length - 1];
      if (ch === "*") s = true;
      else if (ch === "+") l = true;
      else b = true;
      id = id.slice(0, -1);
    }
    if (!id) continue;
    owned.add(id);
    if (s) shiny.add(id);
    if (l) lucky.add(id);
    if (b) both.add(id);
  }
  return { owned, shiny, lucky, both };
}

/** 依狀態組出儲存用的鍵 */
export function pikaKey(id, st) {
  return id + (st.shiny ? "*" : "") + (st.lucky ? "+" : "") + (st.both ? "#" : "");
}

export function renderPikaStats(pika, t) {
  const { owned, shiny, lucky, both } = pikaSets(pika);
  const total = COSTUME_COUNT;
  const rows = [
    [t("pikaOwned"), owned.size, "var(--iv)"],
    [t("shiny"), shiny.size, "var(--shiny)"],
    [t("lucky"), lucky.size, "var(--lucky)"],
    [t("shinyLucky"), both.size, "var(--both)"],
  ];
  $("#stats").innerHTML = rows
    .map(
      ([label, n, color]) => `
      <div class="stat-row">
        <span class="l">${esc(label)}</span>
        <span class="n" style="color:${color}">${n}<span class="of">/${total}</span></span>
        <span class="bar"><i style="width:${total ? (n / total) * 100 : 0}%;background:${color}"></i></span>
      </div>`
    )
    .join("");
}

export function renderPikaGrid(pika, lang, t, canEdit, query) {
  const { owned, shiny, lucky, both } = pikaSets(pika);
  const q = (query || "").trim().toLowerCase();
  const items = COSTUMES.filter(
    (c) =>
      !q ||
      c.zh.toLowerCase().includes(q) ||
      c.ja.toLowerCase().includes(q) ||
      c.en.toLowerCase().includes(q)
  );

  if (!items.length) {
    $("#list").innerHTML = `<p class="empty">${t("empty")}</p>`;
    return;
  }

  $("#list").innerHTML = `
    ${canEdit ? "" : `<p class="guest-notice">${t("guestNotice")}</p>`}
    <div class="grid">
      ${items
        .map((c) => {
          const has = owned.has(c.id);
          const marks = stateMarks(
            { shiny: shiny.has(c.id), lucky: lucky.has(c.id), both: both.has(c.id) },
            t
          );
          return `
        <button class="cell${has ? " is-owned" : " is-empty"}" type="button" data-pikaopen="${c.id}">
          ${marks}
          <img src="${costumeArt(c.file)}" alt="" loading="lazy" decoding="async">
          <span class="nm">${esc(c[lang] || c.en)}</span>
        </button>`;
        })
        .join("")}
    </div>`;
}

/** 裝扮皮卡丘的詳情面板 */
export function renderPikaDetail(costumeId, pika, extraBg, lang, t, canEdit) {
  const c = findCostume(costumeId);
  if (!c) return;
  const sets = pikaSets(pika);
  const has = sets.owned.has(c.id);
  const isShiny = sets.shiny.has(c.id);
  const isLucky = sets.lucky.has(c.id);
  const isBoth = sets.both.has(c.id);

  const others = ["zh", "ja", "en"]
    .filter((k) => k !== lang)
    .map((k) => esc(c[k]))
    .join(" · ");

  const toggle = (key, label, on, color, locked) => `
    <button class="tog${locked ? " is-locked" : ""}" type="button" data-pikakey="${key}"
            data-on="${on ? 1 : 0}" style="--tog:${color}"
            ${canEdit && !locked ? "" : "disabled"}
            ${locked ? `title="${esc(t("lockedByBoth"))}"` : ""}>
      <span>${label}</span><span class="sw" aria-hidden="true"></span>
    </button>`;

  // 這個裝扮出現在哪些背卡上
  const bgCards = cardsForCostume(c.id);
  const bgSection = bgCards.length
    ? `
    <p class="d-sect">${t("bgSection")}</p>
    <div class="togs">
      ${bgCards
        .map(({ event, card, key }) => {
          const raw = (extraBg && extraBg[card.id]) || [];
          const got = raw.some((k) => k === key || k === `${key}*`);
          return `
        <button class="tog tog-bg" type="button" data-bgcard="${card.id}" data-bgkey="${key}"
                data-on="${got ? 1 : 0}" style="--tog:var(--bg-card)" ${canEdit ? "" : "disabled"}>
          <img class="bg-thumb" src="${card.img}" alt="" loading="lazy">
          <span class="bg-meta">
            <span class="bg-name">${esc(card[lang] || card.en)}</span>
            <span class="bg-ev">${esc(event[lang] || event.en)}</span>
          </span>
          <span class="sw" aria-hidden="true"></span>
        </button>`;
        })
        .join("")}
    </div>`
    : "";

  $("#panel").innerHTML = `
    <div class="d-top">
      <img src="${costumeArt(c.file)}" alt="" decoding="async">
      <div>
        <h2>${esc(c[lang] || c.en)}</h2>
        <p class="d-alt">${others}</p>
      </div>
    </div>

    <p class="d-sect">${t("status")}</p>
    <div class="togs">
      ${toggle("has", t("pikaOwned"), has, "var(--iv)", false)}
      <div class="sub"${has ? "" : " hidden"}>
        ${toggle("shiny", t("shiny"), isShiny, "var(--shiny)", isBoth)}
        ${toggle("lucky", t("lucky"), isLucky, "var(--lucky)", isBoth)}
        ${toggle("both", t("shinyLucky"), isBoth, "var(--both)", false)}
      </div>
    </div>
    ${bgSection}

    <button class="btn-close" type="button" id="closeDetail">${t("close")}</button>`;
}

/* ─────────── 設定選單 ─────────── */

export function renderSettings(user, langs, lang, t) {
  const box = $("#settingsMenu");
  box.innerHTML = `
    <p class="set-title">${t("sideLang")}</p>
    <div class="langs" id="langs">
      ${langs
        .map(
          (l) =>
            `<button type="button" data-lang="${l.code}" class="${
              l.code === lang ? "is-on" : ""
            }" aria-pressed="${l.code === lang ? "true" : "false"}">${l.label}</button>`
        )
        .join("")}
    </div>
    ${
      user
        ? `<div class="set-user">
             ${user.photo ? `<img class="avatar" src="${esc(user.photo)}" alt="" referrerpolicy="no-referrer">` : ""}
             <span class="who">${esc(user.name)}</span>
           </div>
           <button class="btn-text set-out" type="button" id="signOutBtn">${t("signOut")}</button>`
        : ""
    }`;
}

export function toggleSettings(force) {
  const el = $("#settingsWrap");
  const open = force === undefined ? el.hidden : force;
  el.hidden = !open;
  $("#settingsBtn").setAttribute("aria-expanded", open ? "true" : "false");
}

export function settingsOpen() {
  return !$("#settingsWrap").hidden;
}

/* ─────────── 交換清單 ─────────── */

/** 清單分頁 + 方格牆。背卡疊在立繪後方，XXL/XXS/異色以文字標籤疊在前面 */
export function renderWantGrid(list, want, active, lang, t, canEdit, query) {
  const byId = Object.create(null);
  for (const p of list) byId[p.id] = p;

  const cur = want.lists[active] || { name: "", items: [] };
  const q = (query || "").trim().toLowerCase();
  const rows = cur.items
    .map((w, i) => ({ w, i, p: byId[w.id] }))
    .filter((x) => x.p)
    .filter(
      (x) =>
        !q ||
        x.p.zh.toLowerCase().includes(q) ||
        x.p.ja.toLowerCase().includes(q) ||
        x.p.en.toLowerCase().includes(q) ||
        String(x.p.no).includes(q)
    );

  const tabs = want.lists
    .map(
      (l, i) => `
      <button class="wtab${i === active ? " is-on" : ""}" type="button" data-wanttab="${i}">
        ${esc(l.name || t("wantListN", i + 1))}
        ${l.items.length ? `<em>${l.items.length}</em>` : ""}
      </button>`
    )
    .join("");

  $("#list").innerHTML = `
    ${canEdit ? "" : `<p class="guest-notice">${t("guestNotice")}</p>`}
    <div class="wtabs">${tabs}</div>
    <div class="want-bar">
      <button class="chip" type="button" id="renameBtn" ${canEdit ? "" : "disabled"}>
        ${t("wantRename")}
      </button>
      <button class="chip" type="button" id="addMissingBtn" ${canEdit ? "" : "disabled"}>
        ${t("wantAddMissing")}
      </button>
      <button class="chip is-on" type="button" id="shareBtn" ${cur.items.length ? "" : "disabled"}>
        ${t("shareImage")}
      </button>
    </div>
    ${
      rows.length
        ? `<div class="grid">${rows.map((x) => wantCell(x.p, x.w, x.i, lang, t, canEdit)).join("")}</div>`
        : `<p class="empty">${t("wantEmpty")}</p>`
    }
    ${canEdit ? `<button class="fab" type="button" id="wantPickBtn" title="${esc(t("wantAdd"))}">+</button>` : ""}`;
}

function wantCell(p, w, idx, lang, t, canEdit) {
  const found = w.bg ? allCards().find((x) => x.card.id === w.bg) : null;
  const bgLayer = found
    ? `<span class="want-bg" style="background-image:url('${found.card.img}')"></span>`
    : "";
  const tags = [
    w.xxl ? `<em class="wt" style="--wt:var(--xxl)">XXL</em>` : "",
    w.xxs ? `<em class="wt" style="--wt:var(--xxs)">XXS</em>` : "",
    w.shiny ? `<em class="wt" style="--wt:var(--shiny)">✦</em>` : "",
  ].join("");

  return `
    <div class="cell want-cell">
      ${bgLayer}
      <img ${w.shiny ? shinyAttrs(p) : spriteAttrs(p.go, p.art)} alt="" loading="lazy" decoding="async">
      <span class="nm">${esc(p[lang])}</span>
      ${tags ? `<span class="want-tags">${tags}</span>` : ""}
      ${
        canEdit
          ? `<button class="want-del" type="button" data-wantdel="${idx}"
                     title="${esc(t("wantRemove"))}">×</button>`
          : ""
      }
    </div>`;
}

/** 詳情面板裡的「想要」設定區。同一隻可以有多筆不同需求 */
export function wantSection(p, want, active, lang, t, canEdit) {
  const cur = want.lists[active] || { items: [] };
  const mine = cur.items
    .map((w, i) => ({ w, i }))
    .filter((x) => x.w.id === p.id);
  const cards = cardsFor(p.id);

  const describe = (w) => {
    const parts = [];
    if (w.xxl) parts.push(`<em class="wt" style="--wt:var(--xxl)">XXL</em>`);
    if (w.xxs) parts.push(`<em class="wt" style="--wt:var(--xxs)">XXS</em>`);
    if (w.shiny) parts.push(`<em class="wt" style="--wt:var(--shiny)">✦</em>`);
    if (w.bg) {
      const c = allCards().find((x) => x.card.id === w.bg);
      if (c) parts.push(`<em class="wt" style="--wt:var(--bg-card)">${esc(c.card[lang] || c.card.en)}</em>`);
    }
    return parts.length ? parts.join("") : `<span class="want-any">${t("wantAny")}</span>`;
  };

  const rows = mine
    .map(
      ({ w, i }) => `
      <div class="want-row">
        <span class="want-row-tags">${describe(w)}</span>
        <span class="want-row-btns">
          <button class="mini" type="button" data-wantedit="${i}" ${canEdit ? "" : "disabled"}>${t("wantEdit")}</button>
          <button class="mini" type="button" data-wantdel="${i}" ${canEdit ? "" : "disabled"}>×</button>
        </span>
      </div>`
    )
    .join("");

  const listName = (want.lists[active] && want.lists[active].name) || t("wantListN", active + 1);
  return `
    <p class="d-sect">${t("wantSection")} · ${esc(listName)}</p>
    <div class="want-rows">
      ${rows || `<p class="want-none">${t("wantNone")}</p>`}
      <button class="btn-add" type="button" data-wantnew="${p.id}" ${canEdit ? "" : "disabled"}>
        + ${t("wantAdd")}
      </button>
    </div>`;
}

/** 編輯單筆需求的面板 */
export function renderWantEdit(p, w, idx, lang, t) {
  const cards = cardsFor(p.id);
  const tog = (key, label, val, color) => `
    <button class="tog" type="button" data-wantset="${key}" data-on="${val ? 1 : 0}"
            style="--tog:${color}">
      <span>${label}</span><span class="sw" aria-hidden="true"></span>
    </button>`;

  $("#panel").innerHTML = `
    <div class="d-top">
      <img ${spriteAttrs(p.go, p.art)} alt="" decoding="async">
      <div>
        <h2>${esc(p[lang])}</h2>
        <p class="d-alt">${t("wantSection")}</p>
      </div>
    </div>

    <p class="d-sect">${t("status")}</p>
    <div class="togs">
      ${tog("xxl", t("xxl"), w.xxl, "var(--xxl)")}
      ${tog("xxs", t("xxs"), w.xxs, "var(--xxs)")}
      ${tog("shiny", t("shiny"), w.shiny, "var(--shiny)")}
    </div>

    ${
      cards.length
        ? `<p class="d-sect">${t("bgSection")}</p>
           <div class="want-bgpick">
             <button class="bgpick${!w.bg ? " is-on" : ""}" type="button" data-wantbg="">${t("wantNoBg")}</button>
             ${cards
               .map(
                 ({ card }) => `
               <button class="bgpick${w.bg === card.id ? " is-on" : ""}" type="button"
                       data-wantbg="${card.id}" title="${esc(card[lang] || card.en)}">
                 <img src="${card.img}" alt="">
               </button>`
               )
               .join("")}
           </div>`
        : ""
    }

    <button class="btn-close" type="button" data-wantback="${p.id}">${t("wantDone")}</button>`;
}


/**
 * 挑選面板：從傳說圖鑑選一隻加入交換清單。
 * 可直接勾選異色與背卡，選完一次建立。
 */
export function renderWantPicker(list, draft, lang, t, query) {
  const q = (query || "").trim().toLowerCase();
  const sel = draft.id ? list.find((p) => p.id === draft.id) : null;

  if (!sel) {
    const rows = list.filter(
      (p) =>
        !q ||
        p.zh.toLowerCase().includes(q) ||
        p.ja.toLowerCase().includes(q) ||
        p.en.toLowerCase().includes(q) ||
        String(p.no).includes(q)
    );
    $("#panel").innerHTML = `
      <p class="d-sect">${t("wantPickMon")}</p>
      <input type="search" class="pick-search" id="pickSearch"
             placeholder="${esc(t("search"))}" value="${esc(query || "")}">
      <div class="pick-grid">
        ${rows
          .map(
            (p) => `
          <button class="pick-cell" type="button" data-pick="${p.id}">
            <img ${spriteAttrs(p.go, p.art)} alt="" loading="lazy" decoding="async">
            <span class="nm">${esc(p[lang])}</span>
          </button>`
          )
          .join("")}
      </div>
      ${rows.length ? "" : `<p class="empty">${t("empty")}</p>`}
      <button class="btn-close" type="button" id="closeDetail">${t("close")}</button>`;
    return;
  }

  // 已選定寶可夢，設定條件
  const cards = cardsFor(sel.id);
  const tog = (key, label, on, color) => `
    <button class="tog" type="button" data-draft="${key}" data-on="${on ? 1 : 0}"
            style="--tog:${color}">
      <span>${label}</span><span class="sw" aria-hidden="true"></span>
    </button>`;

  $("#panel").innerHTML = `
    <div class="d-top">
      <img ${draft.shiny ? shinyAttrs(sel) : spriteAttrs(sel.go, sel.art)} alt="" decoding="async">
      <div>
        <h2>${esc(sel[lang])}</h2>
        <p class="d-alt">${dexNo(sel.no)}</p>
      </div>
    </div>

    <p class="d-sect">${t("status")}</p>
    <div class="togs">
      ${tog("xxl", t("xxl"), draft.xxl, "var(--xxl)")}
      ${tog("xxs", t("xxs"), draft.xxs, "var(--xxs)")}
      ${tog("shiny", t("shiny"), draft.shiny, "var(--shiny)")}
    </div>

    ${
      cards.length
        ? `<p class="d-sect">${t("bgSection")}</p>
           <div class="want-bgpick">
             <button class="bgpick${!draft.bg ? " is-on" : ""}" type="button" data-draftbg="">${t("wantNoBg")}</button>
             ${cards
               .map(
                 ({ card }) => `
               <button class="bgpick${draft.bg === card.id ? " is-on" : ""}" type="button"
                       data-draftbg="${card.id}" title="${esc(card[lang] || card.en)}">
                 <img src="${card.img}" alt="">
               </button>`
               )
               .join("")}
           </div>`
        : ""
    }

    <div class="pick-actions">
      <button class="btn-close" type="button" id="pickBack">${t("wantBack")}</button>
      <button class="btn-primary" type="button" id="pickConfirm">${t("wantConfirm")}</button>
    </div>`;
}
