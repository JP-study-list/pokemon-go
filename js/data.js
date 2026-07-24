/**
 * data.js — 寶可夢基礎資料（唯讀參考資料）
 *
 * 這裡只放「不會因使用者而異」的資訊：名稱、圖鑑編號、世代、CP。
 * 使用者的收集狀態（XXL / XXS / IV100）存在 Firestore，不在這個檔案。
 *
 * ── 如何新增一隻寶可夢 ──
 * 1. 在下面陣列加一行，id 用還沒被使用過的編號（例如 p068、p069…）
 * 2. id 一旦發布就不要再改，它是使用者紀錄的對應鍵，改了會導致紀錄對不上
 * 3. art 是圖片編號，一般情況等於 no；
 *    不同型態（起源、靈獸等）要用 PokeAPI 的專屬編號，見下方對照
 * 4. cp20 / cp25 不知道就填 null，之後再補
 *
 * ── go 欄位 ──
 * Pokémon GO 遊戲內的圖示檔名。有值就優先使用，
 * 載入失敗時會自動退回 art 指向的官方立繪。
 *
 * ── art 特殊編號對照 ──
 * 起源帝牙盧卡 10245 / 起源帕路奇亞 10246 / 騎拉帝納(起源) 10007
 * 龍卷雲(靈獸) 10019 / 雷電雲(靈獸) 10020 / 土地雲(靈獸) 10021
 * 熊徒弟(連擊) 10191
 * 查詢方式：https://pokeapi.co/api/v2/pokemon/{名稱}
 */

export const POKEMON = [
  { id:"p000", no:144, art:144, gen:1, zh:"急凍鳥", ja:"フリーザー", en:"Articuno", cp20:1743, cp25:2179, types:["ice","flying"], go:"pm144.icon.png" },
  { id:"p001", no:145, art:145, gen:1, zh:"閃電鳥", ja:"サンダー", en:"Zapdos", cp20:2015, cp25:2519, types:["electric","flying"], go:"pm145.icon.png" },
  { id:"p002", no:146, art:146, gen:1, zh:"火焰鳥", ja:"ファイヤー", en:"Moltres", cp20:1980, cp25:2475, types:["fire","flying"], go:"pm146.icon.png" },
  { id:"p003", no:150, art:150, gen:1, zh:"超夢", ja:"ミュウツー", en:"Mewtwo", cp20:2387, cp25:2984, types:["psychic"], go:"pm150.icon.png" },
  { id:"p004", no:243, art:243, gen:2, zh:"雷公", ja:"ライコウ", en:"Raikou", cp20:1972, cp25:2466, types:["electric"], go:"pm243.icon.png" },
  { id:"p005", no:244, art:244, gen:2, zh:"炎帝", ja:"エンテイ", en:"Entei", cp20:1984, cp25:2480, types:["fire"], go:"pm244.icon.png" },
  { id:"p006", no:245, art:245, gen:2, zh:"水君", ja:"スイクン", en:"Suicune", cp20:1704, cp25:2130, types:["water"], go:"pm245.icon.png" },
  { id:"p007", no:249, art:249, gen:2, zh:"洛奇亞", ja:"ルギア", en:"Lugia", cp20:2115, cp25:2645, types:["psychic","flying"], go:"pm249.icon.png" },
  { id:"p008", no:250, art:250, gen:2, zh:"鳳王", ja:"ホウオウ", en:"Ho-Oh", cp20:2207, cp25:2759, types:["fire","flying"], go:"pm250.icon.png" },
  { id:"p009", no:377, art:377, gen:3, zh:"雷吉洛克", ja:"レジロック", en:"Regirock", cp20:1784, cp25:2230, types:["rock"], go:"pm377.icon.png" },
  { id:"p010", no:378, art:378, gen:3, zh:"雷吉艾斯", ja:"レジアイス", en:"Regice", cp20:1784, cp25:2230, types:["ice"], go:"pm378.icon.png" },
  { id:"p011", no:379, art:379, gen:3, zh:"雷吉斯奇魯", ja:"レジスチル", en:"Registeel", cp20:1398, cp25:1748, types:["steel"], go:"pm379.icon.png" },
  { id:"p012", no:380, art:380, gen:3, zh:"拉帝亞斯", ja:"ラティアス", en:"Latias", cp20:2006, cp25:2507, types:["dragon","psychic"], go:"pm380.icon.png" },
  { id:"p013", no:381, art:381, gen:3, zh:"拉帝歐斯", ja:"ラティオス", en:"Latios", cp20:2178, cp25:2723, types:["dragon","psychic"], go:"pm381.icon.png" },
  { id:"p014", no:382, art:382, gen:3, zh:"蓋歐卡", ja:"カイオーガ", en:"Kyogre", cp20:2351, cp25:2939, types:["water"], go:"pm382.icon.png" },
  { id:"p015", no:383, art:383, gen:3, zh:"固拉多", ja:"グラードン", en:"Groudon", cp20:2351, cp25:2939, types:["ground"], go:"pm383.icon.png" },
  { id:"p016", no:384, art:384, gen:3, zh:"烈空坐", ja:"レックウザ", en:"Rayquaza", cp20:2191, cp25:2739, types:["dragon","flying"], go:"pm384.icon.png" },
  { id:"p017", no:480, art:480, gen:4, zh:"由克希", ja:"ユクシー", en:"Uxie", cp20:1442, cp25:1803, types:["psychic"], go:"pm480.icon.png" },
  { id:"p018", no:481, art:481, gen:4, zh:"艾姆利多", ja:"エムリット", en:"Mesprit", cp20:1747, cp25:2184, types:["psychic"], go:"pm481.icon.png" },
  { id:"p019", no:482, art:482, gen:4, zh:"亞克諾姆", ja:"アグノム", en:"Azelf", cp20:1834, cp25:2293, types:["psychic"], go:"pm482.icon.png" },
  { id:"p020", no:483, art:483, gen:4, zh:"帝牙盧卡", ja:"ディアルガ", en:"Dialga", cp20:2307, cp25:2884, types:["steel","dragon"], go:"pm483.icon.png" },
  { id:"p021", no:483, art:10245, gen:4, zh:"起源帝牙盧卡", ja:"オリジンディアルガ", en:"Origin Dialga", cp20:2337, cp25:2921, types:["steel","dragon"], go:"pm483.fORIGIN.icon.png" },
  { id:"p022", no:484, art:484, gen:4, zh:"帕路奇亞", ja:"パルキア", en:"Palkia", cp20:2280, cp25:2850, types:["water","dragon"], go:"pm484.icon.png" },
  { id:"p023", no:484, art:10246, gen:4, zh:"起源帕路奇亞", ja:"オリジンパルキア", en:"Origin Palkia", cp20:2367, cp25:2958, types:["water","dragon"], go:"pm484.fORIGIN.icon.png" },
  { id:"p024", no:485, art:485, gen:4, zh:"席多蘭恩", ja:"ヒードラン", en:"Heatran", cp20:2145, cp25:2681, types:["fire","steel"], go:"pm485.icon.png" },
  { id:"p025", no:486, art:486, gen:4, zh:"雷吉奇卡斯", ja:"レジギガス", en:"Regigigas", cp20:2483, cp25:3104, types:["normal"], go:"pm486.icon.png" },
  { id:"p026", no:487, art:487, gen:4, zh:"騎拉帝納(別種)", ja:"ギラティナ(アナザー)", en:"Giratina (Altered)", cp20:1931, cp25:2414, types:["ghost","dragon"], go:"pm487.fALTERED.icon.png" },
  { id:"p027", no:487, art:10007, gen:4, zh:"騎拉帝納(起源)", ja:"ギラティナ(オリジン)", en:"Giratina (Origin)", cp20:2105, cp25:2631, types:["ghost","dragon"], go:"pm487.fORIGIN.icon.png" },
  { id:"p028", no:488, art:488, gen:4, zh:"克雷色利亞", ja:"クレセリア", en:"Cresselia", cp20:1633, cp25:2041, types:["psychic"], go:"pm488.icon.png" },
  { id:"p029", no:638, art:638, gen:5, zh:"勾帕路翁", ja:"コバルオン", en:"Cobalion", cp20:1727, cp25:2159, types:["steel","fighting"], go:"pm638.icon.png" },
  { id:"p030", no:639, art:639, gen:5, zh:"代拉基翁", ja:"テラキオン", en:"Terrakion", cp20:2113, cp25:2641, types:["rock","fighting"], go:"pm639.icon.png" },
  { id:"p031", no:640, art:640, gen:5, zh:"畢力吉翁", ja:"ビリジオン", en:"Virizion", cp20:1727, cp25:2159, types:["grass","fighting"], go:"pm640.icon.png" },
  { id:"p032", no:641, art:641, gen:5, zh:"龍卷雲(化身)", ja:"トルネロス(化身)", en:"Tornadus (Incarnate)", cp20:1911, cp25:2389, types:["flying"], go:"pm641.fINCARNATE.icon.png" },
  { id:"p033", no:641, art:10019, gen:5, zh:"龍卷雲(靈獸)", ja:"トルネロス(霊獣)", en:"Tornadus (Therian)", cp20:1837, cp25:2296, types:["flying"], go:"pm641.fTHERIAN.icon.png" },
  { id:"p034", no:642, art:642, gen:5, zh:"雷電雲(化身)", ja:"ボルトロス(化身)", en:"Thundurus (Incarnate)", cp20:1911, cp25:2389, types:["electric","flying"], go:"pm642.fINCARNATE.icon.png" },
  { id:"p035", no:642, art:10020, gen:5, zh:"雷電雲(靈獸)", ja:"ボルトロス(霊獣)", en:"Thundurus (Therian)", cp20:2091, cp25:2614, types:["electric","flying"], go:"pm642.fTHERIAN.icon.png" },
  { id:"p036", no:643, art:643, gen:5, zh:"萊希拉姆", ja:"レシラム", en:"Reshiram", cp20:2307, cp25:2884, types:["dragon","fire"], go:"pm643.icon.png" },
  { id:"p037", no:644, art:644, gen:5, zh:"捷克羅姆", ja:"ゼクロム", en:"Zekrom", cp20:2307, cp25:2884, types:["dragon","electric"], go:"pm644.icon.png" },
  { id:"p038", no:645, art:645, gen:5, zh:"土地雲(化身)", ja:"ランドロス(化身)", en:"Landorus (Incarnate)", cp20:2050, cp25:2563, types:["ground","flying"], go:"pm645.fINCARNATE.icon.png" },
  { id:"p039", no:645, art:10021, gen:5, zh:"土地雲(靈獸)", ja:"ランドロス(霊獣)", en:"Landorus (Therian)", cp20:2241, cp25:2801, types:["ground","flying"], go:"pm645.fTHERIAN.icon.png" },
  { id:"p040", no:646, art:646, gen:5, zh:"酋雷姆", ja:"キュレム", en:"Kyurem", cp20:2042, cp25:2553, types:["dragon","ice"], go:"pm646.fNORMAL.icon.png" },
  { id:"p041", no:716, art:716, gen:6, zh:"哲爾尼亞斯", ja:"ゼルネアス", en:"Xerneas", cp20:2160, cp25:2701, types:["fairy"], go:"pm716.icon.png" },
  { id:"p042", no:717, art:717, gen:6, zh:"伊裴爾塔爾", ja:"イベルタル", en:"Yveltal", cp20:2160, cp25:2701, types:["dark","flying"], go:"pm717.icon.png" },
  { id:"p043", no:785, art:785, gen:7, zh:"卡璞・鳴鳴", ja:"カプ・コケコ", en:"Tapu Koko", cp20:1810, cp25:2263, types:["electric","fairy"], go:"pm785.icon.png" },
  { id:"p044", no:786, art:786, gen:7, zh:"卡璞・蝶蝶", ja:"カプ・テテフ", en:"Tapu Lele", cp20:1996, cp25:2496, types:["psychic","fairy"], go:"pm786.icon.png" },
  { id:"p045", no:787, art:787, gen:7, zh:"卡璞・哞哞", ja:"カプ・ブルル", en:"Tapu Bulu", cp20:1953, cp25:2442, types:["grass","fairy"], go:"pm787.icon.png" },
  { id:"p046", no:788, art:788, gen:7, zh:"卡璞・鰭鰭", ja:"カプ・レヒレ", en:"Tapu Fini", cp20:1632, cp25:2041, types:["water","fairy"], go:"pm788.icon.png" },
  { id:"p047", no:791, art:791, gen:7, zh:"索爾迦雷歐", ja:"ソルガレオ", en:"Solgaleo", cp20:2310, cp25:2887, types:["psychic","steel"], go:"pm791.icon.png" },
  { id:"p048", no:792, art:792, gen:7, zh:"露奈雅拉", ja:"ルナアーラ", en:"Lunala", cp20:2438, cp25:3047, types:["psychic","ghost"], go:"pm792.icon.png" },
  { id:"p049", no:793, art:793, gen:7, zh:"虛吾伊德", ja:"ウツロイド", en:"Nihilego", cp20:2256, cp25:2821, types:["rock","poison"], go:"pm793.icon.png" },
  { id:"p050", no:794, art:794, gen:7, zh:"爆肌蚊", ja:"マッシブーン", en:"Buzzwole", cp20:1977, cp25:2472, types:["bug","fighting"], go:"pm794.icon.png" },
  { id:"p051", no:795, art:795, gen:7, zh:"費洛美螂", ja:"フェローチェ", en:"Pheromosa", cp20:1624, cp25:2030, types:["bug","fighting"], go:"pm795.icon.png" },
  { id:"p052", no:796, art:796, gen:7, zh:"電束木", ja:"デンジュモク", en:"Xurkitree", cp20:2249, cp25:2812, types:["electric"], go:"pm796.icon.png" },
  { id:"p053", no:797, art:797, gen:7, zh:"鐵火輝夜", ja:"テッカグヤ", en:"Celesteela", cp20:1772, cp25:2216, types:["steel","flying"], go:"pm797.icon.png" },
  { id:"p054", no:798, art:798, gen:7, zh:"紙御劍", ja:"カミツルギ", en:"Kartana", cp20:2101, cp25:2626, types:["grass","steel"], go:"pm798.icon.png" },
  { id:"p055", no:799, art:799, gen:7, zh:"惡食大王", ja:"アクジキング", en:"Guzzlord", cp20:1650, cp25:2062, types:["dark","dragon"], go:"pm799.icon.png" },
  { id:"p056", no:800, art:800, gen:7, zh:"奈克洛茲瑪", ja:"ネクロズマ", en:"Necrozma", cp20:2104, cp25:2630, types:["psychic"], go:"pm800.icon.png" },
  { id:"p057", no:803, art:803, gen:7, zh:"毒貝比", ja:"ベベノム", en:"Poipole", cp20:918, cp25:1148, types:["poison"], go:"pm803.icon.png" },
  { id:"p058", no:804, art:804, gen:7, zh:"四顎針龍", ja:"アーゴヨン", en:"Naganadel", cp20:1842, cp25:2302, types:["poison","dragon"], go:"pm804.icon.png" },
  { id:"p059", no:805, art:805, gen:7, zh:"壘磊石", ja:"ツンデツンデ", en:"Stakataka", cp20:1882, cp25:2353, types:["rock","steel"], go:"pm805.icon.png" },
  { id:"p060", no:806, art:806, gen:7, zh:"砰頭小丑", ja:"ズガドーン", en:"Blacephalon", cp20:1884, cp25:2355, types:["fire","ghost"], go:"pm806.icon.png" },
  { id:"p061", no:888, art:888, gen:8, zh:"蒼響", ja:"ザシアン", en:"Zacian", cp20:2188, cp25:2735, types:["fairy"], go:"pm888.fHERO.icon.png" },
  { id:"p062", no:889, art:889, gen:8, zh:"藏瑪然特", ja:"ザマゼンタ", en:"Zamazenta", cp20:2188, cp25:2735, types:["fighting"], go:"pm889.fHERO.icon.png" },
  { id:"p063", no:892, art:892, gen:8, zh:"熊徒弟(一擊)", ja:"ウーラオス(いちげきのかた)", en:"Urshifu (Single Strike)", cp20:2109, cp25:2637, types:["fighting","dark"], go:"pm892.fSINGLE_STRIKE.icon.png" },
  { id:"p064", no:892, art:10191, gen:8, zh:"熊徒弟(連擊)", ja:"ウーラオス(れんげきのかた)", en:"Urshifu (Rapid Strike)", cp20:2109, cp25:2637, types:["fighting","water"], go:"pm892.fRAPID_STRIKE.icon.png" },
  { id:"p065", no:894, art:894, gen:8, zh:"雷吉艾勒奇", ja:"レジエレキ", en:"Regieleki", cp20:1602, cp25:2002, types:["electric"], go:"pm894.icon.png" },
  { id:"p066", no:895, art:895, gen:8, zh:"雷吉鐸拉戈", ja:"レジドラゴ", en:"Regidrago", cp20:1699, cp25:2124, types:["dragon"], go:"pm895.icon.png" },
  { id:"p067", no:905, art:905, gen:9, zh:"眷戀雲(化身)", ja:"ラブトロス(けしんフォルム)", en:"Enamorus (Incarnate)", cp20:1957, cp25:2447, types:["fairy","flying"], go:"pm905.fINCARNATE.icon.png" },
  { id:"p068", no:905, art:10250, gen:9, zh:"眷戀雲(靈獸)", ja:"ラブトロス(れいじゅうフォルム)", en:"Enamorus (Therian)", cp20:1935, cp25:2420, types:["fairy","flying"], go:"pm905.fTHERIAN.icon.png" },
  { id:"p069", no:386, art:386, gen:3, zh:"代歐奇希斯", ja:"デオキシス", en:"Deoxys", cp20:1806, cp25:2257, types:["psychic"], go:"pm386.icon.png" },
  { id:"p070", no:386, art:10001, gen:3, zh:"代歐奇希斯(攻擊)", ja:"デオキシス(アタックフォルム)", en:"Deoxys (Attack)", cp20:1474, cp25:1842, types:["psychic"], go:"pm386.fATTACK.icon.png" },
  { id:"p071", no:386, art:10002, gen:3, zh:"代歐奇希斯(防禦)", ja:"デオキシス(ディフェンスフォルム)", en:"Deoxys (Defense)", cp20:1299, cp25:1624, types:["psychic"], go:"pm386.fDEFENSE.icon.png" },
  { id:"p072", no:386, art:10003, gen:3, zh:"代歐奇希斯(速度)", ja:"デオキシス(スピードフォルム)", en:"Deoxys (Speed)", cp20:1645, cp25:2056, types:["psychic"], go:"pm386.fSPEED.icon.png" },
  { id:"p073", no:491, art:491, gen:4, zh:"達克萊伊", ja:"ダークライ", en:"Darkrai", cp20:2136, cp25:2671, types:["dark"], go:"pm491.icon.png" },
  { id:"p074", no:649, art:649, gen:5, zh:"蓋諾賽克特", ja:"ゲノセクト", en:"Genesect", cp20:1916, cp25:2395, types:["bug","steel"], go:"pm649.fNORMAL.icon.png" },
  { id:"p075", no:649, art:10028, gen:5, zh:"蓋諾賽克特(火焰卡帶)", ja:"ゲノセクト(バーンカセット)", en:"Genesect (Burn)", cp20:1916, cp25:2395, types:["bug","steel"], go:"pm649.fBURN.icon.png" },
  { id:"p076", no:649, art:10029, gen:5, zh:"蓋諾賽克特(冰凍卡帶)", ja:"ゲノセクト(シャインカセット)", en:"Genesect (Chill)", cp20:1916, cp25:2395, types:["bug","steel"], go:"pm649.fCHILL.icon.png" },
  { id:"p077", no:649, art:10030, gen:5, zh:"蓋諾賽克特(水流卡帶)", ja:"ゲノセクト(アクアカセット)", en:"Genesect (Douse)", cp20:1916, cp25:2395, types:["bug","steel"], go:"pm649.fDOUSE.icon.png" },
  { id:"p078", no:649, art:10031, gen:5, zh:"蓋諾賽克特(閃電卡帶)", ja:"ゲノセクト(ブレイズカセット)", en:"Genesect (Shock)", cp20:1916, cp25:2395, types:["bug","steel"], go:"pm649.fSHOCK.icon.png" },
];

/** 官方立繪（PokeAPI CDN）。作為 GO 圖示的備援 */
export const artUrl = (art) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${art}.png`;

/** Pokémon GO 遊戲內圖示（PokeMiners） */
export const GO_BASE =
  "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/";

export const goUrl = (go) => (go ? GO_BASE + go : null);

/**
 * 產生 <img> 用的屬性字串：優先顯示 GO 圖示，載入失敗自動換成官方立繪。
 * 少數寶可夢（例如捷拉奧拉）在 PokeMiners 沒有圖示，就會走備援。
 */
export function spriteAttrs(go, art) {
  const fallback = artUrl(art);
  const primary = goUrl(go) || fallback;
  // onerror 只觸發一次，避免備援也失敗時無限迴圈
  return `src="${primary}" onerror="this.onerror=null;this.src='${fallback}'"`;
}

/** 一筆全新的空白收集狀態 */
export const blankState = () => ({
  xxl: false,
  xxs: false,
  iv100: { has: false, shiny: false, lucky: false, both: false },
});
