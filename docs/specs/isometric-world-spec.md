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

## 3. 深度排序與渲染管線（Painter's Algorithm Pipeline）

為了在 2D 平面上正確表現 3D 物體的遮擋與層次，每影格執行以下管線：
1. **背景環境層**：繪製戶外草地與室內木地板。
2. **固定建築幾何**：牆體、門窗與日光/月光投射多邊形。
3. **動態深度排序**：
   - 收集所有動態實體（主角、NPC、家具、盆栽、噴泉、街燈）。
   - 排序鍵：$\text{Depth} = g_x + g_y + \epsilon$（物體在等軸平面越靠前，繪製優先級越高）。
4. **覆蓋渲染**：粒子系統（落葉、蒸氣、光斑）、頭頂名牌與對話氣泡。

---

## 4. 地圖分區與空間布局（Multi-Zone Map Layout）

地圖劃分為「溫馨家屋（The House）」與「戶外庭園廣場（The Courtyard & Plaza）」兩大無縫連貫區域：

```
[戶外科技廣場 Tech Pavilion] (AI Agents)   [戶外花園與咖啡座 Courtyard] (Friends)
          \                                      /
           +------------------------------------+
           |             戶外廣場               |
           |   (Clark, Billy, Jerry, Happy...)  |
           +-----------------+------------------+
                             | 玄關門廊 Porch
           +-----------------+------------------+
           |             溫馨家屋               |
           | (Ludwig, Yully, Wu Yen Chao, Luena)|
           +------------------------------------+
```

### 4.1 溫馨家屋（The House, $0 \le x < 8, 0 \le y < 8$）
- 包含玄關、客廳沙發、餐桌茶具、書櫃與鋼琴陽台。
- 居住成員：
  - **Ludwig**（站長本尊 / 思考與編碼）
  - **Yully**（媽媽 / 溫柔照顧、關心作息）
  - **Wu Yen Chao**（爸爸 / 泡茶品茗、給予智慧指引）
  - **Luena**（妹妹 / 活潑幽默、分享校園與生活趣事）
  - **Mochi**（橘貓餅餅 / 打滾、伸懶腰與討摸摸）

### 4.2 戶外庭園與廣場（Courtyard & Plaza, $8 \le x < 18, 0 \le y < 18$）
- 包含鵝卵石林蔭大道、櫻花樹、噴水池、戶外休閒椅與街燈。
- 聚集好友：
  - **Clark Wu**, **Billy Fang**, **Jerry Chung**, **Happy Wang**, **Kerry Chang**, **Haolei Pei**, **Bo Han Wu**。
- 科技角落（Tech Pavilion）：
  - **Ludwigia Agent (Antigravity)**
  - **Gemini**
  - **Claude**
  - **ChatGPT**

---

## 5. 實體狀態機與自治尋路（Entity AI & Steering Behaviors）

### 5.1 NPC 自治巡邏與行為
所有 NPC 均有獨立的思考迴圈：
- **Wander（自由漫步）**：定時在所屬空間選取可行走的目標節點，以 A* 規劃路徑平滑移動。
- **Idle / Socialize（交談停頓）**：當兩名 NPC 靠近時，會面向彼此觸發交談氣泡（`💬`、`☕`）。
- **Special Action（專屬動作）**：
  - 媽媽端茶、爸爸品茗、妹妹看書、工程師敲鍵盤、AI Agents 發出運算光點。

### 5.2 訪客參訪模式（Visitor Player）
- 初次進入時跳出「名牌註冊」彈窗，輸入自訂暱稱。
- 控制方式：
  - **桌機**：支援鍵盤 `WASD` 與方向鍵 `↑ ↓ ← →` 即時四向移動。
  - **行動端**：螢幕左下方呈現直覺式虛擬十字鍵（Virtual D-Pad）。
  - **指標/觸控**：點選地圖任意空地，即可由 A* 演算法自動尋路抵達。
- **靠近對話（Proximity Dialogue）**：
  - 當玩家接近任何人物 $\le 1.8$ 瓦片距離時，人物頭頂浮現互動提示 `[Space / 點擊對話]`。
  - 觸發後開啟專屬立繪 RPG 風格對話框。

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
