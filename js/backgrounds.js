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
 * 3. pokemon 填 data.js 裡的 id（例如 "p003"）
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
];

/** 攤平成 [{event, card}] 方便查詢 */
export function allCards() {
  const out = [];
  for (const ev of EVENTS) for (const card of ev.cards) out.push({ event: ev, card });
  return out;
}

/** 某隻寶可夢可能擁有的所有背卡 */
export function cardsFor(pokemonId) {
  return allCards().filter(({ card }) => card.pokemon.includes(pokemonId));
}

/** 背卡總數（用於統計） */
export function totalCardSlots() {
  return allCards().reduce((n, { card }) => n + card.pokemon.length, 0);
}
