/**
 * backgrounds.js — 活動背卡資料
 *
 * 背卡（Special Background）是在特定活動期間捕捉寶可夢時，
 * 有機率附加在寶可夢資料頁上的背景圖。
 *
 * ── 資料結構 ──
 * EVENTS 是活動清單，每個活動底下有一或多張背卡（cards）。
 * 每張背卡記錄哪些寶可夢可能帶有它（pokemon: 圖鑑 id 陣列）。
 *
 * ── 如何新增一個活動 ──
 * 1. 在 EVENTS 陣列加一筆，id 不要跟既有的重複
 * 2. 背卡圖片放進 img/bg/，檔名對應 card.img
 * 3. pokemon 陣列有兩種寫法：
 *
 *    "p003"                    圖鑑（data.js）裡的傳說，直接用 id
 *    { dex: 131 }              一般寶可夢，用全國圖鑑編號，名稱查 pokedex.js
 *    { dex: 131, note_zh:"布蘭琪風", note_ja:"ブランシェ", note_en:"Blanche" }
 *                              特殊造型，合併成本體但加註說明
 *
 * 造型一律合併成本體（例如帕底亞肯泰羅三種都算「肯泰羅」一格），
 * 需要區分時用 note 註記。
 *
 * ── scope 的意思 ──
 * "global"   全球活動，所有玩家都有機會取得
 * "regional" 地區限定，只有該地區的實體活動才拿得到，非常稀有
 */

export const EVENTS = [
  {
    id: "gofest2026",
    zh: "GO Fest 2026 全球",
    ja: "GO Fest 2026 グローバル",
    en: "GO Fest 2026: Global",
    date: "2026-07-06 ~ 07-12",
    cards: [
      {
        id: "gf26-global",
        scope: "global",
        img: "./img/bg/gofest2026-global.jpg",
        zh: "GO Fest 2026",
        ja: "GO Fest 2026",
        en: "GO Fest 2026",
        note_zh: "7/6～7/12 期間五星、原始、超級團戰捕捉的寶可夢有機率帶有",
        note_ja: "7/6〜7/12 の五つ星・原始・メガレイドで捕獲したポケモンに付く可能性",
        note_en: "From five-star, Primal, and Mega Raids between July 6 and 12",
        pokemon: [
          "p000", "p001", "p002", "p004", "p005", "p006", "p007", "p008",
          "p017", "p018", "p019", "p020", "p022", "p026", "p027", "p041",
          "p042", "p047", "p048", "p014", "p015", "p016", "p036", "p037",
          "p040", "p009", "p010", "p011", "p021", "p023", "p024", "p025",
          "p032", "p033", "p034", "p035", "p038", "p039", "p065", "p066",
          "p067", "p068", "p069", "p070", "p071", "p072", "p074", "p075",
          "p076", "p077", "p078", "p043", "p044", "p045", "p046", "p049",
          "p050", "p051", "p052", "p053", "p054", "p055", "p056", "p059",
          "p060", "p012", "p013", "p028", "p073", "p029", "p030", "p031",
          "p061", "p062",
        ],
      },
      {
        id: "gf26-mewtwo",
        scope: "global",
        img: "./img/bg/gofest2026-mewtwo.jpg",
        zh: "超夢限定",
        ja: "ミュウツー限定",
        en: "Mewtwo Special",
        note_zh: "GO Fest 期間從超級究極團戰捕捉的超夢限定",
        note_ja: "GO Fest 期間のスーパーメガレイドのミュウツー限定",
        note_en: "Only from Super Mega Raid Mewtwo during GO Fest",
        pokemon: ["p003"],
      },
    ],
  },

  {
    id: "gofest2026-inperson",
    zh: "GO Fest 2026 實體活動",
    ja: "GO Fest 2026 リアルイベント",
    en: "GO Fest 2026: In-Person",
    date: "2026-05-25 ~ 06-15",
    cards: [
      {
        id: "gf26-tokyo",
        scope: "regional",
        img: "./img/bg/gofest2026-tokyo.jpg",
        zh: "東京",
        ja: "東京",
        en: "Tokyo",
        note_zh: "5/25～6/1 台場，僅限持票者。急凍鳥、水君為當場限定",
        note_ja: "5/25〜6/1 お台場、チケット所持者限定。フリーザーとスイクンが登場",
        note_en: "May 25 – Jun 1, Tokyo Waterfront City. Ticket holders only.",
        pokemon: [
          "p000", "p006", "p003", "p014", "p015",
          { dex: 128, note_zh: "帕底亞的樣子・水", note_ja: "パルデアのすがた・水", note_en: "Paldean Aqua" },
          { dex: 131, note_zh: "布蘭琪風", note_ja: "ブランシェ風", note_en: "Blanche-themed" },
          { dex: 807 },
        ],
      },
      {
        id: "gf26-chicago",
        scope: "regional",
        img: "./img/bg/gofest2026-chicago.jpg",
        zh: "芝加哥",
        ja: "シカゴ",
        en: "Chicago",
        note_zh: "6/4～6/8 Grant Park，僅限持票者。閃電鳥、雷公為當場限定",
        note_ja: "6/4〜6/8 グラントパーク、チケット所持者限定。サンダーとライコウが登場",
        note_en: "Jun 4 – 8, Grant Park. Ticket holders only.",
        pokemon: [
          "p001", "p004", "p003", "p014", "p015",
          { dex: 128, note_zh: "帕底亞的樣子・火", note_ja: "パルデアのすがた・炎", note_en: "Paldean Blaze" },
          { dex: 239, note_zh: "斯帕克風", note_ja: "スパーク風", note_en: "Spark-themed" },
          { dex: 807 },
        ],
      },
      {
        id: "gf26-copenhagen",
        scope: "regional",
        img: "./img/bg/gofest2026-copenhagen.jpg",
        zh: "哥本哈根",
        ja: "コペンハーゲン",
        en: "Copenhagen",
        note_zh: "6/11～6/15 Fælledparken，僅限持票者。火焰鳥、炎帝為當場限定",
        note_ja: "6/11〜6/15 フェレズパーケン、チケット所持者限定。ファイヤーとエンテイが登場",
        note_en: "Jun 11 – 15, Fælledparken. Ticket holders only.",
        pokemon: [
          "p002", "p005", "p003", "p014", "p015",
          { dex: 77, note_zh: "坎黛拉風", note_ja: "キャンデラ風", note_en: "Candela-themed" },
          { dex: 128, note_zh: "帕底亞的樣子・鬥", note_ja: "パルデアのすがた・格闘", note_en: "Paldean Combat" },
          { dex: 807 },
        ],
      },
    ],
  },
];

/** 攤平成 [{event, card}] 方便查詢 */
export function allCards() {
  const out = [];
  for (const ev of EVENTS) for (const card of ev.cards) out.push({ event: ev, card });
  return out;
}

/**
 * 把 pokemon 陣列裡的一筆轉成統一格式。
 * 兩種輸入：字串 id（圖鑑內的傳說）或 { dex, note_* }（一般寶可夢）。
 * @returns {{key: string, pid: string|null, dex: number|null, note: object}}
 */
export function normalizeEntry(entry) {
  if (typeof entry === "string") {
    return { key: entry, pid: entry, dex: null, note: null };
  }
  return {
    key: `d${entry.dex}`,
    pid: null,
    dex: entry.dex,
    note: {
      zh: entry.note_zh || "",
      ja: entry.note_ja || "",
      en: entry.note_en || "",
    },
  };
}

/** 某張背卡的所有項目（已正規化） */
export function entriesOf(card) {
  return card.pokemon.map(normalizeEntry);
}

/** 某隻寶可夢可能擁有的所有背卡（只查圖鑑內的傳說） */
export function cardsFor(pokemonId) {
  return allCards().filter(({ card }) =>
    card.pokemon.some((e) => typeof e === "string" && e === pokemonId)
  );
}

/** 背卡總數（用於統計） */
export function totalCardSlots() {
  return allCards().reduce((n, { card }) => n + card.pokemon.length, 0);
}
