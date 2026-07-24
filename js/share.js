/**
 * share.js — 產生交換清單的分享圖
 *
 * 用 canvas 把想要的寶可夢畫成一張圖，可以直接傳給朋友。
 * 背卡會疊在立繪後方，並標上 XXL / XXS / 異色。
 *
 * ── 為什麼要用 crossOrigin ──
 * 圖片來自其他網域的 CDN，沒有設定 crossOrigin 的話 canvas 會被標記為
 * 「污染」（tainted），toBlob 會直接失敗。所有來源都支援 CORS。
 */

import { artUrl, goUrl } from "./data.js";
import { allCards } from "./backgrounds.js";

const COLS = 4;
const CELL = 180;
const PAD = 20;
const HEAD = 68;
const NAME_H = 30;

/** 載入圖片，失敗時回傳 null 而不中斷整張圖 */
function loadImage(src) {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 先試 GO 圖示，失敗再退回官方立繪 */
async function loadSprite(go, art) {
  return (await loadImage(goUrl(go))) || (await loadImage(artUrl(art)));
}

/** 圓角矩形路徑 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 產生分享圖
 * @param {Array} items 想要的寶可夢（已套用 want 狀態）
 * @param {object} opts { title, dark, lang }
 * @returns {Promise<Blob|null>}
 */
export async function buildShareImage(items, opts) {
  const { title, dark, lang } = opts;
  if (!items.length) return null;

  const rows = Math.ceil(items.length / COLS);
  const W = PAD * 2 + COLS * CELL;
  const H = HEAD + PAD + rows * (CELL + NAME_H) + PAD;

  const canvas = document.createElement("canvas");
  const scale = 2; // 兩倍解析度，在手機上看才清楚
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const ink = dark ? "#ece9e0" : "#22201c";
  const dim = dark ? "#96908a" : "#7d7870";
  const bg = dark ? "#16150f" : "#f5f5f3";
  const cardBg = dark ? "#211f18" : "#ffffff";
  const line = dark ? "#34312a" : "#e2e0da";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 標題
  ctx.fillStyle = "#b8860b";
  ctx.font = "600 26px 'Noto Sans TC', sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(title, PAD, HEAD / 2);

  ctx.fillStyle = dim;
  ctx.font = "13px 'Noto Sans TC', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${items.length}`, W - PAD, HEAD / 2);
  ctx.textAlign = "left";

  const cardById = Object.create(null);
  for (const { card } of allCards()) cardById[card.id] = card;

  // 先把需要的圖全部載入，避免逐格等待
  const jobs = items.map(async (it) => ({
    it,
    sprite: await loadSprite(it.go, it.art),
    bgImg: it.want.bg && cardById[it.want.bg] ? await loadImage(cardById[it.want.bg].img) : null,
  }));
  const loaded = await Promise.all(jobs);

  loaded.forEach(({ it, sprite, bgImg }, i) => {
    const cx = PAD + (i % COLS) * CELL;
    const cy = HEAD + PAD + Math.floor(i / COLS) * (CELL + NAME_H);
    const inner = CELL - 10;

    ctx.save();
    roundRect(ctx, cx + 5, cy, inner, inner, 12);
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.clip();

    // 背卡疊在立繪後方
    if (bgImg) {
      const s = Math.max(inner / bgImg.width, inner / bgImg.height);
      const w = bgImg.width * s;
      const h = bgImg.height * s;
      ctx.drawImage(bgImg, cx + 5 + (inner - w) / 2, cy + (inner - h) / 2, w, h);
    }

    if (sprite) {
      const s = Math.min((inner * 0.78) / sprite.width, (inner * 0.78) / sprite.height);
      const w = sprite.width * s;
      const h = sprite.height * s;
      ctx.drawImage(sprite, cx + 5 + (inner - w) / 2, cy + (inner - h) / 2, w, h);
    }
    ctx.restore();

    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    roundRect(ctx, cx + 5.5, cy + 0.5, inner - 1, inner - 1, 12);
    ctx.stroke();

    // 狀態標籤
    const tags = [];
    if (it.want.xxl) tags.push(["XXL", "#2f6f4f"]);
    if (it.want.xxs) tags.push(["XXS", "#8a5cc4"]);
    if (it.want.shiny) tags.push(["✦", "#c94f7c"]);
    let tx = cx + 11;
    ctx.font = "600 11px 'Noto Sans TC', sans-serif";
    for (const [label, color] of tags) {
      const w = ctx.measureText(label).width + 12;
      ctx.fillStyle = color;
      roundRect(ctx, tx, cy + 8, w, 18, 9);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "middle";
      ctx.fillText(label, tx + 6, cy + 17.5);
      tx += w + 4;
    }

    // 名稱
    ctx.fillStyle = ink;
    ctx.font = "500 13px 'Noto Sans TC', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const name = it[lang] || it.en;
    const maxW = inner - 8;
    let shown = name;
    while (ctx.measureText(shown).width > maxW && shown.length > 1) {
      shown = shown.slice(0, -1);
    }
    if (shown !== name) shown = shown.slice(0, -1) + "…";
    ctx.fillText(shown, cx + 5 + inner / 2, cy + inner + NAME_H / 2);
    ctx.textAlign = "left";
  });

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/** 觸發下載 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
