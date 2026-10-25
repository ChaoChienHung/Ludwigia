# Ludwigia Isometric World Specification (等軸 2.5D 虛擬生活空間與社交世界技術規格)

本文件詳細記載 Ludwigia 虛擬生活空間（`space/`）的完整技術架構、數學模型、渲染管線、狀態機與互動機制，作為全站等軸世界的單一真相來源（SSOT）。

---

## 1. 系統架構與技術棧（Architecture & Tech Stack）

本系統為**零外部肥大依賴（Zero Heavy Dependencies）**的純前端純 Canvas 引擎：
- **核心渲染**：HTML5 Canvas 2D Context（Retina 視網膜高解析度適配 `devicePixelRatio`）
- **造型與介面**：Vanilla CSS3（CSS 變數、Glassmorphism 磨砂玻璃、全響應式版型）
- **音訊引擎**：Web Audio API 原生音訊合成器（白噪音雨聲濾波、雙極低通黑膠爆音、諧波合成）
- **尋路與網格**：自研 A* (A-Star) 空間圖尋路演算法（含動態障礙物碰撞體）
- **互動層**：多模式輸入整合（鍵盤 WASD/方向鍵、行動端虛擬十字鍵 D-Pad、滑鼠點擊尋路與觸控拖曳視角）

---

## 2. 幾何投影與座標系轉換（Isometric Mathematics）

系統採用經典的 2:1 等軸測投影（Isometric Projection），其網格菱形寬高比為 $TW:TH = 64\text{px}:32\text{px}$。

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

### 3.1 傳統純純量深度排序的局限與穿越破圖成因
在等軸 2.5D 投影中，若僅依賴單一純量 $\text{Depth} = x + y$ 對多瓦片長條或矩形障礙物（如雙人床 $2.0 \times 2.4$、電腦桌 $2.5 \times 1.2$、沙發、噴水池及側向分隔牆）進行排序：
- **前側穿越**：當角色站立在物體正前方（$y > y_{max}$ 但 $x < x_{max}$）時，角色的 $x_c + y_c$ 可能小於物體遠端角落的 $x_{max} + y_{max}$，導致物體被繪製在角色上方，產生角色被後方家具遮蔽或切斷下半身的毛病。
- **後側浮空**：反之若物體採用後角落 $x_{min} + y_{min}$，則站在物體後方的角色其 $x_c + y_c > x_{min} + y_{min}$，角色會突兀浮現在家具頂部。
- **隔斷牆體穿透**：若東南隔斷牆在實體前過早繪製，房內角色會漂浮於牆體之外；若過晚繪製，室外角色又會被不當遮蔽。

### 3.2 2.5D 幾何包圍盒拓撲排序演算法（Topological Sort with Kahn's Algorithm）
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
   - 每影格在實體集（約 40~50 個物件）上構建有向圖 $B \to A$（$B$ 先畫）。
   - 初始化所有入度 $\text{inDegree}[i] = 0$ 之獨立物件進入優先就緒佇列。
   - 每次選取就緒佇列中 $\text{baseDepth}$ 最小的物件進行繪製，並遞減其鄰接節點的入度，當入度歸零時加入就緒隊列。
   - 演算法時間複雜度為 $O(V + E)$（百微秒以內完成，極其輕量），100% 杜絕任何家具與角色間的前後穿透穿牆破圖。

### 3.3 影格分層繪製管線（Frame Pipeline）
1. **背景地面與地毯層**：繪製房間橡木地板、客廳編織地毯、鵝卵石大道與戶外草地。
2. **後側建築高牆**：繪製位於最深處背景的西北牆（$y=0$）、東北牆（$x=0$）與拱形景觀窗、家庭裝飾畫。
3. **拓撲排序實體層**：執行 `sortIsometricEntities` 依序繪製家具、盆栽、樹木、噴泉、東南隔斷牆、南側景觀護欄及所有家族與朋友角色。
4. **粒子動態層**：飄落櫻花花瓣與水氣光斑。
5. **環境光影與 HUD 層**：時間色彩濾鏡、名牌、近距互動提示與 RPG 對話視窗。

---

## 4. 地圖分區與空間布局（Multi-Zone Map Layout）

地圖整體規格擴展至 $22 \times 22$ 瓦片，並劃分為「大型溫馨家屋（The House）」與「綠意庭園廣場（The Courtyard & Plaza）」兩大無縫連貫區域：

```
[科技涼亭 Tech Pavilion] (AI Agents)   [戶外櫻花林蔭與咖啡座 Courtyard] (Friends)
          \                                      /
           +------------------------------------+
           |             戶外廣場               |
           |   (Clark, Billy, Jerry, Happy...)  |
           |       雙層宏偉石造噴泉 (Fountain)   |
           +-----------------+------------------+
                             | 拱門玄關 (Doorway Arch)
           +-----------------+------------------+
           |           10x10 溫馨家屋           |
           | (Ludwig, Yully, Wu Yen Chao, Luena)|
           | 雙人床 / 電腦工作桌 / 書櫃 / 沙發   |
           +------------------------------------+
```

### 4.1 溫馨家屋（The House, $0 \le x \le 9, 0 \le y \le 9$）
- **高質感實木與裝潢**：立體 3D 雙側高牆、踢腳板、大面積採光窗與油畫掛畫。
- **豐富家具配置**：
  - 實木大床（床頭板、蓬鬆枕頭與雙色被褥）。
  - 雙曲面螢幕開發工作桌（程式碼高亮發光、暖光檯燈）。
  - 四層大書櫃（多彩精裝書、垂墜常春藤）。
  - 現代 L 型舒適沙發、實木茶几與茶具。
  - 六人家庭餐桌與幾何桌旗。
- **居住成員**：
  - **Ludwig**（站長本尊 / 思考與編碼）
  - **Yully**（媽媽 / 溫柔照顧、關心作息）
  - **Wu Yen Chao**（爸爸 / 泡茶品茗、給予智慧指引）
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
