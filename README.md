# IV100 圖鑑

Pokémon GO 傳說寶可夢收集進度追蹤工具。記錄 XXL、XXS、IV100（含異色 / 亮晶晶），
支援繁中・日文・英文切換，用 Google 帳號登入後自動跨裝置同步。

---

## 檔案結構

```
index.html            頁面骨架（頂部列 + 側欄 + 主內容容器）
css/style.css         全部樣式，設計 token 集中在 :root
js/config.js          Firebase 設定
js/data.js            68 隻寶可夢的基礎資料
js/i18n.js            三語字典
js/types.js           屬性顏色與三語名稱
js/auth.js            Google 登入
js/store.js           Firestore 讀寫
js/ui.js              畫面繪製
js/main.js            進入點，把各模組接起來
firestore.rules       安全規則（需手動貼到 Console）
```

拆檔的用意是**改一件事只碰一個檔案**：

| 想做的事 | 改哪裡 |
| --- | --- |
| 新增寶可夢 | `js/data.js` |
| 改配色、字級、間距 | `css/style.css` 的 `:root` |
| 改介面文字、加語言 | `js/i18n.js` |
| 改屬性配色 | `js/types.js` |
| 換 Firebase 專案 | `js/config.js` |
| 改卡片或詳情面板長相 | `js/ui.js` |
| 改側欄寬度 | `css/style.css` 的 `--side-w` |

---

## 首次設定

### 1. Firebase Console

**Authentication**
1. 建構 → Authentication → 開始使用
2. Sign-in method → Google → 啟用 → 選支援電子郵件 → 儲存
3. 同一頁的「已授權網域」→ 新增 `jp-study-list.github.io`
   （`localhost` 預設已存在，本機測試不用另外加）

**Firestore**
1. 建構 → Firestore Database → 建立資料庫
2. 位置選 `asia-east1`
3. 建好後進「規則」分頁，把 `firestore.rules` 的內容整段貼上 → 發布

> 沒完成第 3 步的話，所有讀寫都會被拒絕，程式會顯示「載入失敗」。

### 2. 部署到 GitHub Pages

1. 建 repo `pokemon-go`
2. 用 GitHub Desktop 把整個資料夾 commit + push
3. Settings → Pages → Source 選 `main` / `/ (root)` → Save
4. 等一兩分鐘，網址是 `https://jp-study-list.github.io/pokemon-go/`

---

## 本機測試

ES modules 不能用 `file://` 開啟，必須跑一個本機伺服器：

```bash
cd pokemon-go
python3 -m http.server 8000
```

然後開 `http://localhost:8000`。

---

## 新增寶可夢

在 `js/data.js` 的陣列加一行：

```js
{ id:"p068", no:888, art:888, gen:8, zh:"蒼響", ja:"ザシアン", en:"Zacian", cp20:null, cp25:null, types:["fairy"] },
```

規則：

- **`id` 一旦發布就不要改。** 它是使用者紀錄的對應鍵，改了會讓既有紀錄對不上。
  新增時用還沒用過的號碼往下接即可。
- `art` 是圖片編號。一般等於 `no`；不同型態要用 PokeAPI 的專屬編號，
  可在 `https://pokeapi.co/api/v2/pokemon/{名稱}` 查到。
- `cp20` / `cp25` 填**IV 100% 時的捕捉 CP**（LV20 是一般團戰，LV25 是天氣加成）。
  不知道就填 `null`，畫面會顯示「—」。
- `types` 用屬性代號，可用的代號見 `js/types.js`。單屬性就寫一個。

刪除寶可夢時只要把那行拿掉，使用者資料庫裡的殘留紀錄會被自動忽略，不用另外清理。

---

## 資料設計

Firestore **只存收集狀態**，不存名稱和 CP：

```
users/{uid}
  states: { p000: { xxl, xxs, iv100: { has, shiny, lucky } }, ... }
  updated: 時間戳
```

名稱、圖鑑編號、CP 一律以 `data.js` 為準。這樣之後修正名稱或新增寶可夢，
所有使用者的既有紀錄都不受影響，不需要做資料遷移。

另外，狀態全部是預設值的寶可夢不會被寫入，所以文件通常很小。

---

## 安全性

- `js/config.js` 裡的 `apiKey` 出現在前端是正常的，那不是密碼
- 真正的防護在 `firestore.rules`：每個人只能存取自己 `uid` 底下的文件
- 沒有登入就完全無法讀寫任何資料

**注意**：規則裡限制了單一文件最多 2000 筆狀態，避免有人把你的專案當免費儲存空間。
如果之後寶可夢數量超過這個值，記得同步調整。

---

## 版面

- **頂部列**：漢堡鈕、置中標題、深色模式、搜尋框
- **側欄**（264px）：語言、收集統計、篩選，登入區固定在底部
- 側欄未來要加功能，就在 `index.html` 的 `.side-scroll` 裡加一個 `<section class="side-block">`
- 桌機會記住上次的收合狀態；手機預設收合，選完篩選自動關閉

## 已知待辦

- XXS 尚未實際盤點，預設全部未取得
- CP 目前只能看不能在畫面上編輯
- 地區背景欄位尚未實作
- 手機版側欄僅做基本覆蓋，細節尚未打磨
- Firestore 免費額度為每日 5 萬次讀取，使用者變多時要留意
