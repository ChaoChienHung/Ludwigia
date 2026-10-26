# Ludwigia Isometric World Specification (等軸 2.5D 虛擬生活空間與社交世界技術規格)

本文件詳細記載 Ludwigia 虛擬生活校園空間（`labs/world/`）的完整技術架構、數學模型、渲染管線、狀態機與原創演算法，作為全站等軸世界的單一真相來源（SSOT）。

---

## 1. 系統架構與模組化設計（Modular Architecture & Tech Stack）

本系統為**零外部肥大依賴（Zero Heavy Dependencies）**的純前端純 Canvas 2D 引擎，經高內聚、低耦合原則重構為清晰的模組化目錄結構：

```
labs/world/
├── index.html              # 入口頁面與 UI 綁定（HUD、晝夜切換、音效、對話框）
├── world.css               # 磨砂玻璃（Glassmorphism）與全響應式版型樣式表
├── data/
│   └── characters.json     # 單一真相來源：23 位角色、性別、外觀裝扮、初始坐標與隨機中英雙語對話
└── js/
    ├── engine.js           # 核心數學模型、等角投影、NavGrid 8 向 A* 尋路、Kahn 拓撲排序與 Web Audio
    ├── models.js           # 3D 幾何家具模型庫（精密書桌檯燈、零浮空書櫃、4座上床下桌、機櫃、白板、柚木長椅、噴泉）
    ├── characters.js       # 角色步態雙向擺臂腿渲染、自定義色彩名牌膠囊與隨機對話狀態機
    └── world.js            # 主渲染管線、相機平滑平移縮放、多方向互動門與地圖景深排程器
```

---

## 2. 幾何投影與座標系轉換（Isometric Mathematics）

系統採用經典的 2:1 等軸測投影（Isometric Axonometric Projection），其網格菱形寬高比為 $TW:TH = 64\text{px}:32\text{px}$，地圖擴展為 $28 \times 44$ 宏觀校園地圖。

### 2.1 網格座標轉螢幕像素（Iso-to-Screen）
給定網格座標 $(g_x, g_y, g_z)$ 與視窗錨點 $(o_x, o_y)$，其螢幕座標 $(s_x, s_y)$ 為：
$$s_x = o_x + (g_x - g_y) \times \frac{TW}{2}$$
$$s_y = o_y + (g_x + g_y) \times \frac{TH}{2} - g_z \times TH$$

### 2.2 螢幕像素反推網格座標（Screen-to-Iso）
當使用者點擊或觸控螢幕座標 $(s_x, s_y)$ 時，逆變換為：
$$\Delta x = s_x - o_x, \quad \Delta y = s_y - o_y$$
$$g_x = \frac{\Delta x / (TW / 2) + \Delta y / (TH / 2)}{2}$$
$$g_y = \frac{\Delta y / (TH / 2) - \Delta x / (TW / 2)}{2}$$

---

## 3. 深度排序與 2.5D 拓撲遮擋演算法（Topological Occlusion & Depth Pipeline）

### 3.1 2.5D 幾何包圍盒拓撲排序演算法（Topological Sort with Kahn's Algorithm）
為根本解決前後穿越破圖與書櫃/模型閃爍（Flickering / Glitch），Ludwigia 引入了基於地面軸對齊包圍盒（AABB $[x_{min}, x_{max}] \times [y_{min}, y_{max}]$）的拓撲遮擋圖排序：
1. **實體 AABB 定義**：
   - 每個動態角色定義微小包圍半徑：$[c.x - 0.25, c.x + 0.25] \times [c.y - 0.25, c.y + 0.25]$。
   - 每個家具、樹木基座、噴水池底座與隔斷牆段均定義精準的實體佔地範圍 $[x_{min}, x_{max}] \times [y_{min}, y_{max}]$。
2. **等軸測遮擋依賴判斷（`isBehind(B, A)`）**：
   當且僅當物體 $B$ 在幾何上位於物體 $A$ 的等軸視角後方（亦即 $A$ 會遮擋 $B$，$B$ 必須先於 $A$ 繪製）時成立：
   - **X 軸後方且 Y 投影重疊**：$B.x_{max} \le A.x_{min}$ 且 $(B.y_{max} > A.y_{min} \land B.y_{min} < A.y_{max})$。
   - **Y 軸後方且 X 投影重疊**：$B.y_{max} \le A.x_{min}$ 且 $(B.x_{max} > A.x_{min} \land B.x_{min} < A.x_{max})$。
   - **雙軸完全後方**：$B.x_{max} \le A.x_{min} \land B.y_{max} \le A.y_{min}$。
   - **角色與角色間**：直接比較地面接觸點基準深淺度 $\text{baseDepth} = (c.x + c.y)$。
3. **有向無環圖拓撲建構與 Kahn 演算法排程**：
   - 每影格在實體集（約 50~70 個物件）上構建有向圖 $B \to A$（$B$ 先畫）。
   - 初始化所有入度 $\text{inDegree}[i] = 0$ 之獨立物件進入優先就緒佇列。
   - 每次選取就緒佇列中 $\text{baseDepth}$ 最小的物件進行繪製，並遞減其鄰接節點的入度，當入度歸零時加入就緒隊列。
   - 演算法時間複雜度為 $O(V + E)$（百微秒以內完成，極其輕量），100% 杜絕任何家具與角色間的前後穿透穿牆破圖。

---

## 4. 六大生活與研究聚落空間佈局（Six Quad Campuses Architecture）

地圖規格擴展至 $28 \times 44$ 瓦片，劃分為六大獨立建築聚落與縱向貫穿的中央社交綠意十字大道：

```
[Zone 1: 站長家宅 Ludwig's House] (NW, y: 0..9)          [Zone 3: AI 前瞻實驗室 AI Studio] (NE, y: 0..9)
(趙健宏, 媽媽, 爸爸, 妹妹, 餅餅)                           (ChatGPT, Gemini, Claude)
- 正門雙扇門 (SE) / 側邊露台雙扇門 (SW)                      - 雙排42U伺服器機櫃 / 曲面指令台
- 檯燈與鍵盤皮革桌墊 / 零浮空精裝書櫃                       - 玻璃白板 DPO 公式 / 義式咖啡吧
                 \                                              /
                  +--------------------------------------------+
                  |  中央廣場與噴泉大道 Central Plaza Avenue    |
                  |  雙層宏偉石造噴水池 (Fountain)              |
                  |  鑄鐵柚木長椅 / 櫻花林蔭道 / 景觀紀念地標柱  |
                  +--------------------------------------------+
                 /                                              \
[Zone 2: 男11 211 宿舍] (SW, y: 17..26)                  [Zone 4: 典雅藏書閣 Grand Library] (SE, y: 17..26)
(張哲瑋, 王品翔, 林子傑, 黃昱翔, 柯克偉, 吳哲, 吳柏翰, 吳宥謙) (知識藏書閣門樑招牌 / 典籍閱覽席)
- 4 座經典上床下桌 (Loft Bed/Desk)                       - 通頂桃花心木大書牆 / 滑軌黃銅梯
- 寢室門牌 "男11 211" / 經典深藍舒適沙發                   - 祖母綠玻璃銀行燈胡桃木長桌 / 渾天儀
- 實木進口雙開門                                         - 酒紅波斯地毯單人扶手椅 / 玻璃溫室
                 |                                              |
[Zone 5: 三民高中 • 經典教室] (SW2, y: 33..42)            [Zone 6: 抖音研發中心 Douyin Tech Office] (SE2, y: 33..42)
(凌振嚴, 林浥翔, 陳俊龍, 賴柏廷)                         (裴皓磊, 陳泊霖, 徐偉豪, 劉晨馨)
- 北面主牆置中翡翠大黑板 (5.2格) / 頂部掛鐘              - 6組工程師升降雙螢幕工作站 (Aeron 人體工學椅)
- 黑板正前方置中教師講台                                  - 抖音官方彩色光暈地面發光標誌 (TikTok Emblem)
- 4列整齊學生課桌椅 (中央 1.55格主走道)                   - 現代科技茶水間咖啡吧檯 (Coffee & Refreshment Bar)
- 西面雙採光大窗 / 南面置物儲物櫃與公佈欄                - 內側門樑科技標牌 / 全景外向玻璃帷幕
```

### 4.1 六大象限互動門與立體過樑門楣（Quad Doorways & Lintel Beams）
- **實體外牆與門楣高度契約**：門扇高度統一 $H_{door} = 2.15$；實體外牆統一 $H_{wall} = 2.55$；門頭跨接 $z = 2.15..2.55$ 的立體過樑（Lintel Beam），確保門面結構堅實。
- **Zone 1 正門與露台雙開門**：靠近至 2.4 格以內時向庭院平滑旋轉開啟。
- **Zone 2 男11 211 寢室門**：雙開實木門嵌掛經典藍底白字「男11 211」琺瑯金屬門牌。
- **Zone 3 AI 工作室滑門**：感應靠近時向兩側無聲平移滑動。
- **Zone 4 藏書閣大門**：門頭配備浮雕金屬標牌「GRAND LIBRARY」，靠近時自動旋開。
- **Zone 5 三民高中教室門**：門扇上方懸掛「三民高中」牌匾，靠近時自動旋開。
- **Zone 6 抖音科技辦公室門**：科技感懸臂感應推開。

---

## 5. 動態角色系統與 JSON 資料解耦（Character System & Data Decoupling）

### 5.1 資料層單一真相來源（`characters.json`）
所有 23 位常駐角色（涵蓋家人、大學室友、AI 夥伴、國高中同學、抖音研發同事）之屬性均以 `data/characters.json` 為單一真相來源（SSOT），執行期動態加載並響應多語系切換：
- **基礎資訊**：`id`, `name` (`zh-TW` / `en`), `gender` (`male` / `female` / `ai` / `cat`), `role` (`zh-TW` / `en`), `avatar`, `zone`
- **外觀特徵**：`skin`, `hair`, `hairStyle`, `shirt`, `pants`, `nameColor`
- **初始坐標**：`spawn` (`x`, `y`)
- **多語系對話池**：每位角色的 `dialogues.user` 以 `zh-TW` / `en` 分別存放多組多句對話，只供玩家主動點擊；`dialogues.self` 以同樣語系鍵存放環境獨白，不借用玩家對話的首句。頂層 `npcDialogues` 存放角色互聊的 `participants` 與逐句 `speaker` / `text` / `delay`，所有 ID 均須對應 `characters` 中的角色。環境排程隨機嘗試獨白或互聊，當前類別不可觸發時才退到另一類；互聊需符合角色距離與分區條件。
- **角色名冊（共 23 位）**：
  1. **Zone 1 站長家庭**：趙健宏 (`ludwig`, 站長)、媽媽 (`yully`)、爸爸 (`wuyen`)、妹妹 (`luena`)、橘貓餅餅 (`mochi`)
  2. **Zone 2 男11 211 寢室室友**：王品翔 (`happy`)、張哲瑋 (`kerry`)、柯克偉 (`clark`)、林子傑 (`jerry`)、黃昱翔 (`billy`)、吳哲 (`billy`)、吳柏翰 (`bohan`)
  3. **Zone 3 AI 前瞻實驗室**：Ludwigia (`ludwigia`)、Gemini (`gemini`)、Claude (`claude`)、ChatGPT (`chatgpt`)
  4. **Zone 5 高中 / 國中同學**：凌振嚴 (`zhenyan`)、林浥翔 (`willkane`)、陳俊龍 (`chunlong`)、賴柏廷 (`benny`)
  5. **Zone 6 抖音研發中心同事**：裴皓磊 (`haolei`)、陳泊霖 (`baisen`)、徐偉豪 (`weihao`)、劉晨馨 (`chenxin`)

### 5.2 步態動力學與雙向擺臂腿渲染（Walk Animation Physics）
- 移動狀態由 `c.isWalking` 與 `c.walkTimer` 統轄，無論採用鍵盤 WASD、方向鍵、手機 D-Pad 或滑鼠 A* 尋路，均無差別驅動步態計時器。
- **下肢交替擺腿**：雙腿沿正弦曲線交替前後擺動（$\Delta leg = \pm \sin(walkTimer) \times 4.5\text{px}$）。
- **上肢反向擺臂**：雙手臂與對側雙腿維持物理反向擺動（$\Delta arm = \mp \Delta leg \times 0.4$），營造自然協調的走動節奏。
- **身體重心起伏**：軀幹與頭部伴隨步伐產生垂直微幅諧振（$\Delta bob = \sin(walkTimer) \times 2.5\text{px}$）。
- **停止靜止收步**：停止移動時立即重置 `walkTimer = 0`，雙腿平行筆直站立，手臂自然垂落，絕無卡死跨步現象。

---

## 6. 原創演算法與物理狀態機（Original Algorithms & Physics Engine）

### 6.1 視口中心錨定縮放演算法（Centered Viewport Zoom Focus）
為了杜絕相機縮放時以世界原點為基準所導致的畫面漂移，鏡頭縮放以屏幕中心 $(cx, cy) = (width/2, height/2)$ 為軸心：
- **畫面渲染座標變換**：
  $$\text{ctx.translate}(cx, cy) \to \text{ctx.scale}(zoom, zoom) \to \text{ctx.translate}(-cx, -cy)$$
- **螢幕點擊逆投影對齊**：
  $$adjS_x = \frac{s_x - cx}{zoom} + cx, \quad adjS_y = \frac{s_y - cy}{zoom} + cy$$
  再將 $(adjS_x, adjS_y)$ 傳入 `screenToIso(adjSx, adjSy, ox, oy)` 逆推網格座標，確保玩家在遠端分區建築（如三民高中教室、抖音辦公室）縮放視角時，點擊尋路與焦點永遠 100% 準確無漂移。

### 6.2 等軸測牆面剪切與幾何斜度對齊（Isometric Wall Projection Shear Matrices）
為保證掛在建築牆面上的黑板、掛鐘、門楣牌匾自然依附牆面角度，系統嚴格應用剪切變換矩陣：
- **北向與南向橫牆（沿 X 軸）**：使用剪切矩陣 `(1, 0.5, 0, 1, 0, 0)`，使平面物體自然平行於等軸側北牆。
- **東向與西向縱牆（沿 Y 軸）**：使用剪切矩陣 `(1, -0.5, 0, 1, 0, 0)`，使平面物體自然平行於等軸側西牆。
- 杜絕在傾斜牆面進行水平裸繪，保證全場景 2.5D 透視視角嚴格自洽。

### 6.3 防人物重疊與社交防群聚排斥力場（Social Distance Repulsion Field）
為消除 NPC 重疊與扎堆，系統在更新迴圈實施排斥向量場：
- 每影格檢測所有人物對之歐幾里得距離 $d = \text{hypot}(\Delta x, \Delta y)$。
- 當 $d < d_{min}$（閾值 $1.4$ 瓦片）時，計算反比排斥向量：
  $$\vec{F}_{push} = \frac{\Delta \vec{r}}{d} \times (d_{min} - d) \times 0.4 \times dt$$
- 分別在非玩家實體上施加平滑推力向量，並進行 `NavGrid.isWalkableRadius` 邊界校驗，確保人物自然散開至舒適社交距離且不穿牆。
- **目標空曠驗證**：NPC 漫步選點時，若目標周圍 $1.4$ 格內已有其他人，自動放棄並重新選點。

### 6.4 8 方向對角 A* 與視線射線穿透平滑演算法（Diagonal A* & Line-of-Sight Raycasting）
- 支援直向（Cost 1.0）與對角斜向（Cost $\sqrt{2} \approx 1.414$）移動，在對角移動時加入兩側鄰格連通性檢驗（Prevent Corner-Cutting）。
- **射線穿透路徑平滑（Bresenham-based LOS Smoothing）**：
  從路徑起點向終點方向逆向尋找最遠之無障礙直視節點（Line of Sight），略過中途冗餘的階梯狀折點，使人物移動路徑呈現自然的直線與斜線推進。

### 6.5 全站 Design System 與即時色盤聯動契約（Theme & Palette Contract）
- HUD 玻璃擬態面板、狀態文字、互動提示與高亮選框繼承全站 11 套色盤 Design Tokens（`--space-accent`, `--space-accent-glow` 等）。
- 色盤基色只維護在 `assets/css/site/palette-tokens.css`；主站 `shared.css` 匯入它，World `index.html` 直接載入它，`world.css` 由共用 `--palette-accent-dark/light` 映射成 World 的 accent 與 glow。Theme 的背景 surface 仍留在 `world.css`；不得為新 palette 再抄一份 World 色碼。
- 監聽 `ludwig-palette-changed` 與 `ludwig-theme-changed` 自定義 DOM 事件，跨頁切換風格時動態無感重繪，零刷新維護視覺一致性。

---

## 7. 音訊合成管線（Web Audio Procedural Synthesizer）

系統完全不加載任何外部 mp3/wav 靜態音檔，純粹透過 Web Audio API 於瀏覽器端即時程序化數學合成環境聲景：
1. **Rain Mode（雨聲）**：
   - 生成 2 秒雙聲道白噪音緩衝區（White Noise Buffer，振幅隨機分佈於 $[-1, 1]$）。
   - 通過 `BiquadFilterNode`（Lowpass 800Hz, Q=1.2）濾波，模擬雨滴敲擊瓦片與樹葉的低頻細密聲響。
2. **Vinyl Mode（黑膠唱片）**：
   - 60Hz 交流電底噪與微弱三角波。
   - 隨機週期觸發短暫 Delta 脈衝類比黑膠細微爆裂聲。
3. **Cafe Mode（暖調和弦）**：
   - F-Major 7th 四音振盪器（$174.61\text{Hz}, 220.00\text{Hz}, 261.63\text{Hz}, 329.63\text{Hz}$）。
   - 搭配超低頻振盪器（LFO 0.15Hz）調製振幅與立體聲聲像，實現緩慢呼吸感的沉浸式背景音效。

---

## 8. 外部參考來源與授權聲明（Citations & Attributions）

本空間開發過程參考並借鑑下列優秀開源專案與設計概念：
1. **whatsmyagentdoing**（MIT License, Charonyuu）：
   - Source: `https://github.com/Charonyuu/whatsmyagentdoing`
   - 借鑑項目：純前端 Canvas 等軸深度排序演算法、微縮像素人物步態幾何與晝夜動態採光思路。
2. **Heart Island 政策心島**（Puma.taipei）：
   - Source: `https://puma.taipei/heart-island`
   - 借鑑項目：大地圖多區域漫步、浮動人物名牌、時段切換與沉浸式互動敘事。
3. **Kenney Mini Characters & Furniture**（CC0 License）：
   - 借鑑項目：等軸室內外家具與環境物件的配色語彙與比例尺度。
