# Realm 境域架構與擴充規範（Realm Architecture & Extension Spec）

本文件詳細規範 Ludwigia 跨維度完成態世界（Realms）的目錄標準、導航契約、專屬測試分離機制，以及將新世界接入 Aetheria Portals 傳送門的標準作業流程（SSOT）。

---

## 1. 核心概念與職責邊界

Ludwigia 將探索性頁面依「成熟度」與「互動型態」清楚劃分為兩大樞紐：

| 樞紐 | 目錄位置 | 狀態定位 | 代表範例 |
| :--- | :--- | :--- | :--- |
| **Portals (Realms)** | `portals/realms/<realm-id>/` | **已完成、穩定、可長期體驗**的沉浸式互動世界 | `garden`（數位花園）、`world`（2.5D 生活世界） |
| **Labs** | `labs/<prototype-id>/` | **實驗中、演化中、輕量驗證**的原型展示 | `shooting-mode`、`massive-multiplayer-laser-tag`、`question-bank` |

每個 Realm 皆為一個獨立、自包含（Self-contained）的子系統，擁有自己的視圖渲染邏輯、資產與專屬測試。

---

## 2. Realm 目錄標準結構

新 Realm 必須放置於 `portals/realms/<realm-id>/` 目錄下，其推薦檔案結構如下：

```
portals/realms/<realm-id>/
├── index.html                   # [必備] 境域靜態入口，支援本機與純靜態伺服器直接開啟
├── tests/                       # [必備] Realm 專屬測試目錄
│   └── test_<realm-id>_data.py  # [必備] 境域專屬資料、契約與元件測試
├── assets/                      # [推薦] 境域專屬靜態資產（CSS、JS、圖片、音效）
├── js/                          # （可選）原生 JS 引擎或模組
├── data/                        # （可選）若採資料驅動（如角色、劇情），放創作真相來源 JSON
└── <source-app>/                # （可選）若採 React/Vite 等現代框架，源碼獨立於子目錄
```

### 關鍵路徑契約（Path & Navigation Contract）
1. **深度為 3 級**：`portals/realms/<realm-id>/` 相對於專案根目錄之深度固定為 3（`../../../`）。
2. **返回導覽契約**：Realm 內部的 Header、HUD 或返回按鈕，其目標網址**必須嚴格指向 `../../index.html`**（即 Aetheria Portals 傳送門大廳），不得指向站點根目錄或 labs。
3. **全站 Design Tokens 繼承**：若需使用全站 11 套主題色盤，應引用 `../../../assets/css/site/palette-tokens.css`。

---

## 3. 專屬測試與動態聚合契約（Test Isolation & Aggregation）

為避免個別世界的專屬測試（如 NPC 台詞檢查、花園元件測試）污染根目錄 `tests/`，Ludwigia 採用**分散維護、自動聚合**架構：

```
tests/test_misc_data.py          (根目錄聚合器：透過 importlib 自動掃描發現)
   │
   ├── 掃描 ──> portals/realms/world/tests/test_world_data.py
   └── 掃描 ──> portals/realms/garden/tests/test_garden_data.py
```

### 運作原理
- 每個 Realm 在自己的 `portals/realms/<realm-id>/tests/` 底下撰寫符合標準 `unittest` 規範的 `test_*.py` 測試檔案。
- 根目錄的 [tests/test_misc_data.py](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/tests/test_misc_data.py) 定義了動態 `load_tests` 協議，在執行 `python3 cli.py test`（或 `python3 -m unittest`）時，會自動迭代 `portals/realms/*/tests/` 並動態掛載所有符合 `test_*.py` 的模組。
- **無感註冊**：新增 Realm 時，**完全不需要修改 `tests/test_misc_data.py`**！只要檔案放在對應目錄下，全站 CI / 測試即會自動納入守門。

---

## 4. 傳送門大廳註冊協議（Portals Hub Registration）

完成 Realm 後，把它接到 Portals 大廳的某一座傳送門上。大廳的互動是「點門 → 約 0.7 秒漩渦轉場（Esc 可取消）→ 直接進入」，沒有資訊面板，所以註冊時只需要提供位置、外觀，以及兩段簡短的多語文字。

### 步驟 4.1：在 `portals/src/data/portalsData.ts` 登錄門戶

型別定義在 `portals/src/types/portal.ts`。所有對外文字都是 `LocalizedText`（`zh-Hant` / `zh-Hans` / `en` 三語必填），由 `portals/src/i18n.ts` 依主站語言偏好（`localStorage` 的 `site_lang_v1`）選擇顯示：

```typescript
{
  id: 'portal-<realm-id>',
  name: { 'zh-Hant': '星霄之門', 'zh-Hans': '星霄之门', en: 'Starry Gate' },          // 門的名字（短）
  destination: { 'zh-Hant': '星霄秘境', 'zh-Hans': '星霄秘境', en: 'Starry Realm' },   // 目的地名稱
  targetUrl: './realms/<realm-id>/index.html',   // 相對於 portals/index.html
  previewImage: './realms/<realm-id>/preview.webp', // 選填：hover 縮圖，圖片不存在時自動不顯示

  // 全景位置（3400px 寬）
  x: 1600,          // 水平中心 px（0 ~ 3400）
  yPercent: 35,     // 垂直中心百分比
  width: 280,
  height: 280,
  rotation: 0,

  // 外觀
  shape: 'celestial-circle',  // organic-oval | celestial-circle | water-oval | crystal-geode | spore-dome | lunar-arch
  colors: {
    primary: '#06b6d4',
    accent: '#7dd3fc',
    glow: 'rgba(6, 182, 212, 0.5)',                          // 門周圍的柔光
    vortexGradient: ['#082f49', '#0284c7', '#38bdf8', '#0c4a6e'], // 漩渦與轉場配色
  },
  signpost: { material: 'floating-stone', offsetX: 140, offsetY: -30, runeSymbol: 'ᚱ' },
  audioPreset: 'astral',      // wood | astral | water | crystal | spore | moon
}
```

規則：

- **沒有 `targetUrl` 的門就是「封印中」**：外觀會降低飽和度並凍結動畫，點擊只會顯示「尚未開放」提示；`destination` 可以省略。要讓新 Realm 上線，最省事的做法是把它接到現有的一座封印門上：補上 `destination`、`targetUrl` 與（選填）`previewImage`，全景構圖完全不用改。
- **縮圖規格（選填）**：16:9，建議 1600×900，WebP 或 JPG，約 200KB 以內，放在 Realm 自己的目錄（`portals/realms/<realm-id>/preview.webp`），符合 Realm 自包含原則。縮圖只在滑鼠停在界標上時才會請求；檔案不存在時，界標維持純文字。
- **介面文字不寫死在元件裡**：新增按鈕或提示時，文字一律加在 `portals/src/i18n.ts` 的 `UI` 字典（三語），不要在 TSX 裡寫死某一種語言。
- **視覺使用共用 token**：強調色只用從全站 palette 投影出來的 `--ap-accent`（`index.source.html` 的 preload 會套用 `site_palette_v1` 並載入 `assets/css/site/palette-tokens.css`）。按鈕、卡片、面板一律使用 `index.css` 的 `.ap-chip` / `.ap-btn-primary` / `.ap-panel` 與四級字級（`.ap-caption` / `.ap-body` / `.ap-title` / `.ap-display`），不要另外加霓虹漸層、毛玻璃或常駐閃爍動畫。門本身的 `colors` 只用在門的美術上，不用在 UI 元件。

### 步驟 4.2：（可選）在 TopBar 增加常駐捷徑

TopBar 只保留品牌、少數一級 Realm 捷徑、首頁與音效。若新 Realm 是一級世界，可在 `portals/src/components/TopBar.tsx` 的 `<nav>` 加一顆捷徑，沿用同一種 chip 樣式，文字放進 `UI` 字典：

```tsx
<a href="./realms/<realm-id>/index.html" className="ap-chip" title={UI.goStarry[lang]}>
  <YourIcon className="w-4 h-4" aria-hidden="true" />
  <span className="hidden sm:inline">{UI.starry[lang]}</span>
</a>
```

逐門導覽由底部小地圖（手機上是目前門的卡片加圓點）負責，TopBar 不再列出每一座門的名字。

### 步驟 4.3：重新編譯傳送門大廳

```bash
python3 cli.py build-portals
```

這個指令會在 `portals/` 下用 Vite 編譯，輸出靜態的 `portals/index.html` 並更新 `portals/assets/`（兩者都必須納入版控）。

## 5. 新增 Realm 擴充標準檢核表（Extension Checklist）

當需要建立一個新 Realm 時，請依序完成以下檢查：

- [ ] 1. **目錄建立**：建立 `portals/realms/<realm-id>/` 與 `index.html`。
- [ ] 2. **導航契約**：確認內部返回按鈕連結為 `../../index.html`。
- [ ] 3. **測試建立**：建立 `portals/realms/<realm-id>/tests/test_<realm-id>_data.py`，驗證該世界的必要資產、資料與標記結構。
- [ ] 4. **門戶登錄**：在 `portals/src/data/portalsData.ts` 註冊門戶（或接上一座封印門），填好三語 `name` / `destination` 與 `targetUrl: './realms/<realm-id>/index.html'`；可另外附上 `preview.webp` 縮圖。
- [ ] 5. **傳送門編譯**：執行 `python3 cli.py build-portals` 重編大廳產物。
- [ ] 6. **版控白名單（若有）**：若該 Realm 含有需被靜態站直接引用的 build 產物目錄，請在 `AGENTS.md` 與 `docs/specs/system-spec.md` 的白名單中登記。
- [ ] 7. **全站驗證**：執行 `python3 cli.py test`，確認新測試被自動發現並全數 PASS。
- [ ] 8. **效能檢核**：對照下方 §6 的效能契約，確認新 Realm 或新增的建築、角色沒有引入每幀全量運算、每幀 DOM 寫入或常駐的大型合成圖層。

---

## 6. 效能與可擴展性契約（Performance & Scalability Contract）

Portals 與 World 都是常駐動畫頁面。我們希望之後加入更多 Realm、建築與角色時，每幀成本只跟「畫面上看得到的東西」成正比，而不是跟世界總量成正比。以下規則適用於所有 Realm，World 與 Portals 是目前的參考實作。

### 6.1 Ludwigia World（canvas 等軸測引擎）

- **深度排序不得退化為 O(n²)**：`sortIsometricEntities()`（`portals/realms/world/js/engine.js`）只在「螢幕 x 欄位重疊」的實體之間建立遮擋邊。等軸測投影的螢幕 x 為 `(gx - gy) · TW/2`，與高度無關；兩個 footprint 的 `[xMin − yMax, xMax − yMin]` 區間不相交時，畫面上不可能重疊，也就不需要排序邊。實作採「依左界排序＋掃描線」，ready queue 使用以 `(baseDepth, idx)` 為鍵的 binary heap。`isBehind()` 的家具／角色層級、高度判斷、前後景因果規則，以及以 `baseDepth` 打破閉環的回復策略都維持不變（無閉環拓撲深度排序契約）。`SORT_COLUMN_PAD`（1.5 tile）保留給屋簷、招牌、名牌等水平外溢的繪製。
- **靜態地形只分類一次**：`buildTerrainTable()` 在第一次繪製時，把每格的顏色、所屬室內區（供 cutaway 淡化）與裝飾旗標寫入 typed array。之後每幀只走訪視口反投影出的格子範圍，並依「透明度群組 × 顏色」合併成少量 path 一次 fill，不再每格 `save / fill / restore`。新增地形種類時，改 `classifyTerrainTile()` 即可，不要回到每幀逐格判斷。
- **一律做視口裁剪**：主迴圈每幀算一次 `world.viewRect`（縮放前的螢幕座標），地形、地面貼花（TikTok 標誌、心靈星球、籃球場線）、浮島崖壁與雲海、靜態實體、粒子都用它裁剪。靜態實體以 footprint 的投影外框判斷可見，不再用中點判斷，避免長牆端點在畫面內卻整面消失。新增大型貼花或沿地圖周邊繪製的效果時，必須先檢查 `isGroundRectVisible()` 或 `viewRect`。
- **每幀不得無條件寫 DOM**：HUD 文字一律經 `setTextIfChanged()` / `setHtmlIfChanged()` 寫入；CSS 變數（例如 abyss halo）只在數值改變時才寫。每幀 `innerHTML` 或 `style.setProperty` 會讓瀏覽器每幀重算樣式與版面。
- **Backing-store DPR 上限**：桌面最多 2×，觸控裝置最多 1.75×。手機回報的 3× DPR 會讓每次 fill 多處理 2.25 倍像素，但這種插畫風格看不出差別。所有座標仍以 CSS px 計算，點擊逆投影不受影響。
- **被遮住時降頻**：通關密語遮罩或 modal 的全螢幕模糊背景蓋住 canvas 時，主迴圈降到約 20 fps（每 250 ms 檢查一次遮罩狀態）。
- **`prefers-reduced-motion`**：不繪製純裝飾的漂浮花瓣粒子與深淵飄雪。
- **觸控裝置不在 HUD 上做即時 backdrop blur**：在 `@media (pointer: coarse)` 下，玻璃面板改用 `--space-surface-solid` 的實色表面。底色仍來自 theme / palette token，不另外維護色碼（色盤聯動契約不變）。

### 6.2 Aetheria Portals（React 大廳）

- **Spring 鏡頭按需執行**：只有在目標、拖曳或甩動改變時才啟動 rAF，位置與速度收斂後就停止；React `scrollX` 只在四捨五入到 0.5 px 後的值改變時才更新。靜止時不應有任何每幀工作。
- **只掛載可見的日夜相位**：`ParallaxBackground` 只掛載目前的相位，以及交叉淡出期間（約 1 秒）的上一個相位。以前四個相位的 5600 px 寬圖層會同時常駐（每個都被 `will-change` 升為合成層）。新的相位層以 `animate-phase-in` keyframe 淡入。
- **合成層預算**：不要對透明度為 0 或不可見的元素加 `will-change`。長期存在的超寬圖層只保留真正會隨視差位移的容器。
- **畫面外的傳送門暫停動畫**：`PortalComponent` 以 `IntersectionObserver` 在根節點設定 `data-offscreen`，CSS 據此暫停其無限動畫（漩渦、ping、pulse、dash flow）。元件以 `React.memo` 包裝，鏡頭移動時不會重繪全部傳送門。新增傳送門不會增加畫面外的動畫成本。
- **避免逐幀重繪的 SVG 濾鏡與佈局動畫**：連接各門的路徑是一條靜態的細虛線（`--ap-accent`，不套 `feGaussianBlur`、不跑 dash 動畫）。日夜進度條用 `transform: scaleX()`，不對 `width` 做 transition。
- **`prefers-reduced-motion`**：`index.css` 關閉無限動畫與 transition，孢子 canvas 只畫一幀靜態畫面；孢子數量依視口面積縮放（桌面 24 顆，手機約 10 顆），不畫光暈。
- **常駐動態保持克制**：只保留傳送門漩渦與傳送轉場兩個主要動態；日夜自動輪替預設關閉；門上的 ping / pulse 閃光點、太陽與月亮的旋轉或脈動光環都已移除。

### 6.3 量測方式

效能修改要附上前後數據。做法是用 headless Chrome（CDP）在桌面（1440×900、DPR 2）與手機（390×844、DPR 3、CPU 降速 4×）兩種環境量測：

- World：注入計時器包住 `loop` / `update` / `drawTerrain`，把玩家傳送到 8 個固定地點，各取樣 2.5 秒。
- Portals：量測靜止、箭頭平移與日夜切換三種情境。
- 兩者都記錄 `Performance.getMetrics`（主執行緒 script / style / layout 佔比），Portals 另外記錄 `LayerTree` 的合成層數與面積。

headless Chrome 的合成器不是手機 GPU，即使是優化前的版本，rAF 也幾乎都能維持 60 fps，所以主執行緒佔比、每幀 JS 時間與合成層面積才是主要指標。2026-11-15 的基準數據記錄在 `TODO.md` 的 Constellation Queue。
