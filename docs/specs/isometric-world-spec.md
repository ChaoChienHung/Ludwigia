# Ludwigia Isometric World Specification (等軸 2.5D 虛擬生活空間與社交世界技術規格)

本文件詳細記載 Ludwigia 虛擬生活校園空間（`labs/world/`）的完整技術架構、數學模型、渲染管線、狀態機與互動機制，作為全站等軸世界的單一真相來源（SSOT）。

---

## 1. 系統架構與模組化設計（Modular Architecture & Tech Stack）

本系統為**零外部肥大依賴（Zero Heavy Dependencies）**的純前端純 Canvas 引擎，經高內聚、低耦合原則重構為清晰的模組化目錄結構：

```
labs/world/
├── index.html              # 入口頁面與 UI 綁定（HUD、晝夜切換、音效、對話框）
├── world.css               # 磨砂玻璃（Glassmorphism）與全響應式版型樣式表
├── data/
│   └── characters.json     # 單一真相來源：角色性別、外觀裝扮、分區與五套隨機中英雙語對話
└── js/
    ├── engine.js           # 核心數學模型、等角投影、NavGrid 8 向 A* 尋路、Kahn 拓撲排序與 Web Audio
    ├── models.js           # 3D 幾何家具模型庫（精密書桌檯燈、零浮空書櫃、4座上床下桌、機櫃、白板、柚木長椅、噴泉）
    ├── characters.js       # 角色步態雙向擺臂腿渲染、自定義色彩名牌膠囊與隨機對話狀態機
    └── world.js            # 主渲染管線、相機平滑平移縮放、多方向互動門與地圖景深排程器
```

---

## 2. 幾何投影與座標系轉換（Isometric Mathematics）

系統採用經典的 2:1 等軸測投影（Isometric Projection），其網格菱形寬高比為 $TW:TH = 64\text{px}:32\text{px}$，地圖擴展為 $28 \times 28$ 宏觀校園地圖。

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
為根本解決任何前後穿越破圖，Ludwigia 引入了基於地面軸對齊包圍盒（AABB $[x_{min}, x_{max}] \times [y_{min}, y_{max}]$）的拓撲遮擋圖排序：
1. **實體 AABB 定義**：
   - 每個動態角色定義微小包圍半徑：$[c.x - 0.25, c.x + 0.25] \times [c.y - 0.25, c.y + 0.25]$。
   - 每個家具、樹木基座、噴水池底座與隔斷牆段均定義精準的實體佔地範圍 $[x_{min}, x_{max}] \times [y_{min}, y_{max}]$。
2. **等軸測遮擋依賴判斷（`isBehind(B, A)`）**：
   當且僅當物體 $B$ 在幾何上位於物體 $A$ 的等軸視角後方（亦即 $A$ 會遮擋 $B$，$B$ 必須先於 $A$ 繪製）時成立：
   - **X 軸後方且 Y 投影重疊**：$B.x_{max} \le A.x_{min}$ 且 $(B.y_{max} > A.y_{min} \land B.y_{min} < A.y_{max})$。
   - **Y 軸後方且 X 投影重疊**：$B.y_{max} \le A.y_{min}$ 且 $(B.x_{max} > A.x_{min} \land B.x_{min} < A.x_{max})$。
   - **雙軸完全後方**：$B.x_{max} \le A.x_{min} \land B.y_{max} \le A.y_{min}$。
   - **角色與角色間**：直接比較地面接觸點基準深淺度 $\text{baseDepth} = (c.x + c.y)$。
3. **有向無環圖拓撲建構與 Kahn 演算法排程**：
   - 每影格在實體集（約 50~70 個物件）上構建有向圖 $B \to A$（$B$ 先畫）。
   - 初始化所有入度 $\text{inDegree}[i] = 0$ 之獨立物件進入優先就緒佇列。
   - 每次選取就緒佇列中 $\text{baseDepth}$ 最小的物件進行繪製，並遞減其鄰接節點的入度，當入度歸零時加入就緒隊列。
   - 演算法時間複雜度為 $O(V + E)$（百微秒以內完成，極其輕量），100% 杜絕任何家具與角色間的前後穿透穿牆破圖。

---

## 4. 三大核心分區與空間佈局（Tri-Zone Campus Layout）

地圖規格擴展至 $28 \times 28$ 瓦片，劃分為三大獨立建築群與中央社交綠意廣場：

```
[Zone 1: Ludwig's House] (NW)             [Zone 3: Ludwigia AI Studio] (NE)
(Ludwig, Mom, Dad, Luena, Mochi)          (Gemini, Ludwigia, Claude, ChatGPT)
- 正門雙扇門 (SE) / 側邊露台雙扇門 (SW)       - 雙排42U伺服器機櫃 / 曲面指令台
- 檯燈與鍵盤皮革桌墊 / 零浮空精裝書櫃        - 玻璃白板 DPO 公式 / 義式咖啡吧
                 \                               /
                  +-----------------------------+
                  |  中央廣場 Central Plaza     |
                  |  (Haolei Pei, Bo Han Wu)    |
                  |  雙層宏偉石造噴水池 (Fountain) |
                  |  鑄鐵柚木長椅 / 櫻花林蔭道  |
                  +-----------------------------+
                                 |
                  [Zone 2: 男11 211 宿舍] (SW)
                  (Happy, Kerry, Clark, Jerry, Billy)
                  - 4 座經典上床下桌 (Loft Bed/Desk)
                  - 寢室門牌 "男11 211" / 共享小冰箱吉他客廳
```

### 4.1 雙向開闔互動門系統（Multi-Directional Doorway System）
- **正門東南雙開實木門（SE Entrance Double Doors）**：設於 $x = 10, y = 4.5..6.8$，當角色靠近至 2.4 格以內時，向庭院外側平滑旋轉 77 度開啟。
- **側邊西南景觀露台雙開門（SW Side Terrace Doors）**：設於 $y = 10, x = 4.5..6.8$，連接客廳與南側戶外走廊，角色靠近時雙向平滑向外旋開，門外鋪設椰棕編織迎賓地墊。
- **男11 211 寢室門**：設於東南牆 $x = 10, y = 20.5..22.8$，上方懸掛經典藍底白字「男11 211」琺瑯金屬門牌。
- **AI 工作室滑動玻璃門**：設於西南牆 $x = 18, y = 4.5..6.8$，門頭發光霓虹標牌「AI STUDIO」，靠近時自動向兩側無聲平移滑動。

### 4.2 零錯位精準家具建模（Architectural Geometry Fixes）
- **開發工作桌與懸臂檯燈（Desk & Anglepoise Lamp）**：
  - 炭黑皮革桌墊（Charcoal Mat）精準置中於桌面（$z = 0.725$），上置 75% 背光機械鍵盤與人體工學滑鼠。
  - 開發筆電置中開屏，副螢幕穩固架設於右側金屬支架，螢幕朝向使用者。
  - 雙臂關節懸臂檯燈固定於桌子後左角落，圓形厚重黃銅底座扎實貼合桌面，懸臂往前傾斜延伸，燈罩朝下在鍵盤與桌墊投射柔和的黃金半徑徑向光圈。
- **四層北歐實木書櫃（Aligned Bookshelf）**：
  - 書櫃穩固貼合西北實牆（$x: 0.1, y: 3.8..6.4$），擁有四層水平實木隔板（$z = 0.15, 0.75, 1.35, 1.95$）。
  - 所有書籍底部高度嚴格吻合隔板頂部表面（$z_{book\_base} = z_{shelf}$），垂直站立成排，零錯位、零懸空；三層放置陶土多肉盆栽，頂層點綴英國常春藤垂蔓。
- **男11 211 四座上床下桌（Loft Bed / Desk Units）**：
  - 實木/黑鐵立柱（高 $2.25$ 格），下層配備完整大書桌、顯示器、書架與人體工學旋轉椅。
  - 上層為厚床墊、防摔安全護欄（雙橫桿）、床頭軟枕與各室友代表色之蓬鬆被褥。
  - 右前側固定金屬直爬梯，踏階清晰立體。
- **高質感鑄鐵柚木長椅（Refined Park Benches）**：
  - 弧形雕花深色鑄鐵側架與扶手（附金屬光澤倒角）。
  - 三根平行的弧面柚木座板與雙根人體工學靠背條，帶自然木紋，地面投射微縮柔和接觸陰影。

---

## 5. 動態角色系統與 JSON 資料解耦（Character System & Data Decoupling）

### 5.1 資料層單一真相來源（`characters.json`）
所有 16 位常駐角色的屬性均完整收斂於 `data/characters.json`：
- **基礎資訊**：`id`, `name`, `gender` (`male` / `female` / `ai` / `cat`), `role`, `avatar`, `zone`
- **外觀特徵**：`skin`, `hair`, `hairStyle`, `shirt`, `pants`, `nameColor`
- **多語系隨機對話池**：每位角色內建 5 套獨立且富有個性的對話情境（含 `zh-TW` 與 `en` 雙語），每次互動時由 `CharacterManager` 隨機抽選，徹底告別單一重複台詞。

### 5.2 步態動力學與雙向擺臂腿修復（Walk Animation Physics）
- 移動狀態由 `c.isWalking` 與 `c.walkTimer` 統轄，無論採用鍵盤 WASD、方向鍵、手機 D-Pad 或滑鼠 A* 尋路，均無差別驅動步態計時器。
- **下肢交替擺腿**：雙腿沿正弦曲線交替前後擺動（$\Delta leg = \pm \sin(walkTimer) \times 4.5\text{px}$）。
- **上肢反向擺臂**：雙手臂與對側雙腿維持物理反向擺動（$\Delta arm = \mp \Delta leg \times 0.4$），營造自然協調的走動節奏。
- **身體重心起伏**：軀幹與頭部伴隨步伐產生垂直微幅諧振（$\Delta bob = \sin(walkTimer) \times 2.5\text{px}$）。
- **停止靜止收步**：停止移動時立即重置 `walkTimer = 0`，雙腿平行筆直站立，手臂自然垂落，絕無卡死跨步現象。
  - **Luena**（妹妹 / 活潑幽默、分享校園與生活趣事）
  - **Mochi**（橘貓餅餅 / 蜷縮打盹、伸懶腰與巡視家裡）

### 4.2 戶外庭園與廣場（Courtyard & Plaza, $10 \le x < 22, 0 \le y < 22$）
- **環境地景**：鵝卵石大道、雙層宏偉石造噴泉（漣漪擴散動畫）、12 棵以上櫻花與綠蔭大樹、遮陽傘咖啡座與景觀長椅。
- **聚集好友**：
  - **Clark Wu**, **Billy Fang**, **Jerry Chung**, **Happy Wang**, **Kerry Chang**, **Haolei Pei**, **Bo Han Wu**。
- **科技角落（Tech Pavilion）**：
  - **Ludwigia**, **Gemini**, **Claude**, **ChatGPT**。

---

## 5. 實體狀態機、防群聚排斥力與斜向平滑尋路（Entity AI & Physics）

### 5.1 防人物穿越與防群聚排斥力（Social Distance Repulsion）
- 為消除人物重疊與穿牆感，系統實施雙層約束：
  - **靜態網格碰撞（Static Collision Matrix）**：嚴格標記牆體與家具邊界，禁止穿透。
  - **動態防群聚排斥力（Anti-Crowding Force）**：每影格檢測所有人物間距，若兩人間距 $< 1.6$ 瓦片，即施加反比於距離的排斥向量 $\vec{v}_{\text{repulse}}$，使所有人自然散開保持至少 $1 \sim 2$ 格的舒適社交距離。
  - **目標空曠驗證**：NPC 漫步選點時，若目標周圍 $1.8$ 格內已有其他人，自動重新隨機選點，杜絕扎堆聚集。

### 5.2 8 方向對角平滑尋路（Diagonal A* & Line-of-Sight Smoothing）
- 支援直向與斜向共 8 個移動方向（斜向代價 $\sqrt{2} \approx 1.414$）。
- 導入視線射線穿透（Line-of-Sight Raycasting）簡化中間鋸齒折點，玩家點選地面時能以自然流暢的直線/斜線直線抵達目的地。

### 5.3 智能室內外動態鏡頭縮放與穿透（Dynamic Camera & Opacity）
- **在房內時（Indoor Focus）**：
  - 鏡頭自動平滑 Zoom In（$1.35\times$），聚焦於室內精緻家具與家庭溫馨互動。
  - 室外世界自動半透明化（`outsideAlpha = 0.32`），降低外部視覺干擾。
- **走出房門後（Outdoor Expansion）**：
  - 鏡頭平滑 Zoom Out（$0.95\times$），宏觀展現整座噴水池、樹林與廣場好友。
  - 室外世界恢復 $100\%$ 不透明度。

### 5.4 簡約浮動名牌（Minimalist Clean Name Tags）
- 摒棄刺眼的亮色外框，改採低調精緻的半透明深灰磨砂膠囊（`rgba(15,23,42,0.78)`），搭配俐落純白字體，視覺乾淨且不遮蔽畫面。

---

## 6. 音訊合成管線（Web Audio Synthesizer）

完全不依賴外部音檔，於瀏覽器端即時合成：
1. **Rain Mode（雨聲）**：
   - 生成白噪音 Buffer。
   - 通過 `BiquadFilterNode`（Lowpass 800Hz, Q=1.2）模擬細密雨點。
2. **Vinyl Mode（黑膠唱片）**：
   - 60Hz 交流電底噪與微弱三角波。
   - 隨機週期觸發短暫 Delta 脈衝類比黑膠細微爆裂聲。
3. **Cafe Mode（暖調和弦）**：
   - F-Major 7th（$174.61\text{Hz}, 220.00\text{Hz}, 261.63\text{Hz}, 329.63\text{Hz}$）。
   - 搭配超低頻振盪器（LFO 0.15Hz）實現緩慢呼吸感的立體聲聲景。

---

## 7. 外部參考來源與授權聲明（Citations & Attributions）

本空間開發過程參考並借鑑下列優秀開源專案與設計概念：
1. **whatsmyagentdoing**（MIT License, Charonyuu）：
   - Source: `https://github.com/Charonyuu/whatsmyagentdoing`
   - 借鑑項目：純前端 Canvas 等軸深度排序演算法、微縮像素人物步態幾何與晝夜動態採光思路。
2. **Heart Island 政策心島**（Puma.taipei）：
   - Source: `https://puma.taipei/heart-island`
   - 借鑑項目：大地圖多區域漫步、浮動人物名牌、時段切換與沉浸式互動敘事。
3. **Kenney Mini Characters & Furniture**（CC0 License）：
   - 借鑑項目：等軸室內外家具與環境物件的配色語彙與比例尺度。
