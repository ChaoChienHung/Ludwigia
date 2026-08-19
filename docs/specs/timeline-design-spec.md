# Timeline Design Spec

這份文件把目前收斂出的 timeline 方向整理成「可實作規格」。

它的責任不是直接決定最終文案，而是先固定：

- IA 放在哪裡
- desktop / mobile 各自採什麼骨架
- `point event` / `period event` 的資料語意與視覺語法
- MVP 互動先做到哪裡、哪些先不要做

如果未來真的落地實作，這份 spec 應優先和下列文件一起看：

- `AGENTS.md`
- `docs/specs/system-spec.md`
- `docs/design/design.md`
- `docs/miscellaneous/visual-sources.md`

## 1. 目標

timeline 應先作為首頁上的獨立 section，而不是 `About Me` 底下的一塊附屬延伸面。

它要回答的不是：

- 我現在是誰

而是：

- 我是怎麼一路長成現在這個樣子的
- 哪些是單點轉折，哪些是一整段 phase
- 這條路徑在桌機與手機上，怎麼都能被清楚讀成「時間」

## 2. 非目標

MVP 不處理以下事情：

- 不做自由縮放 timeline
- 不做拖曳式水平平移
- 不做很重的 showcase 動畫
- 不先把 page reference 自動綁進每個 event
- 不做 dashboard 式 filter/control panel
- 不追求把視覺比例尺精確做成月 / 日等級；若 authoring 需要更細排序，資料層可保留月 / 日精度

## 3. IA 與頁面位置

### 3.1 第一階段位置

- timeline 掛在首頁 `index.html`，但應作為獨立 section 存在
- 它可以和 `About Me` 鄰接，但不應只是 `About Me` 裡的一個 subsection
- 視覺上可以維持首頁整體閱讀流的一致性，但資訊架構上要有清楚的 section 邊界

### 3.2 About 與 Timeline 的分工

- `About Me`
  - 回答現在的自我介紹
  - 現在在意什麼、正在做什麼、整體人物感是什麼
- `Timeline`
  - 回答時間序列上的演化
  - 哪些是單點事件、哪些是持續一段時間的 phase
  - 補足「現在這個我」背後的形成路徑

重點不是把 `Timeline` 做成另一份履歷，而是讓它作為一個可以獨立理解、獨立瀏覽的 section，和 `About Me` 並列而非附屬。

### 3.3 未來升格條件

只有在以下情況才考慮升格成獨立頁面：

- timeline 事件量超出首頁可承受密度
- event detail 開始需要獨立 deep dive
- 需要 search / filter / grouping / reference linking 等較重互動

## 4. 資訊模型

timeline 的重點不只是在 UI 上畫一條線，而是先把 authoring contract 固定下來。

這裡先收斂成兩層：

- `source model`
  - 作者實際維護的資料檔
- `timeline projection`
  - runtime parse 後，真正 render 到 timeline 上的事件點

### 4.1 Source of Truth

timeline event 不應再直接手寫在前端 JS 常數裡。

第一版正式收斂為：

- source of truth：`data/Timeline/timeline.json`
- runtime 責任：load -> validate -> normalize -> project -> render
- authoring 責任：只維護 event data，不直接碰 projection 細節

若未來需要兼容 `file://`，可再加一層 generated JS preload / inline preload；但 source of truth 仍應是 JSON data file，而不是回退成手改 JS 陣列。

### 4.2 Common Fields

timeline event 先共用這些欄位：

```ts
type TimelineScale = "macro" | "meso" | "micro";

type TimelineLocalizedText =
  | string
  | {
      en?: string;
      "zh-Hant"?: string;
      "zh-Hans"?: string;
    };

type TimelineReference = {
  label: TimelineLocalizedText;
  href: string;
  kind?: "note" | "writing" | "project" | "external";
};

type TimelineBaseEvent = {
  id: string;
  type: "point" | "period";
  scale: TimelineScale;
  title: TimelineLocalizedText;
  summary: TimelineLocalizedText;
  detail?: TimelineLocalizedText;
  references?: Array<{
    label?: TimelineLocalizedText | string;
    title?: TimelineLocalizedText | string;
    href?: string;
    url?: string;
    kind?: string;
  }>;
  category?: "education" | "internship" | "work";
};
```

日期欄位第一版先允許這些 sortable string：

- `YYYY`
- `YYYY-MM`
- `YYYY-MM-DD`
- `present`（僅用於 `period.end`，代表 ongoing phase）

這裡的責任是「穩定排序」，不是要求視覺上真的按月份 / 天數畫成精準比例尺。

若啟用 `category`：

- 第一版允許值先收斂為 `education` / `internship` / `work`
- 它屬於 event facet，不是新的 event type
- UI 可用它顯示輕量 badge 或 filter，但不應再長出一套固定 category 配色去覆蓋 palette/theme

### 4.3 Point Event

適合表達：

- 某一年或某個更細日期發生的單點轉折
- 一次 milestone / release / 決策 / 入學 / 畢業 / 搬遷

```ts
type TimelinePointEvent = TimelineBaseEvent & {
  type: "point";
  at: string; // e.g. "2024" | "2025-08" | "2025-08-11"
};
```

### 4.4 Period Event（Source Model）

適合表達：

- 一整段 phase / era / 任期 / 求學階段
- 某個主題持續醞釀、成形、深化的區段

```ts
type TimelinePeriodEvent = TimelineBaseEvent & {
  type: "period";
  start: string; // e.g. "2020-09"
  end: string;   // e.g. "2024-06" | "present"
  label?: TimelineLocalizedText;
  start_title?: TimelineLocalizedText;
  start_summary?: TimelineLocalizedText;
  start_detail?: TimelineLocalizedText;
  end_title?: TimelineLocalizedText;
  end_summary?: TimelineLocalizedText;
  end_detail?: TimelineLocalizedText;
};
```

這裡刻意允許 `start_*` / `end_*` 欄位，因為 period 的開始與結束不一定該共用同一份敘述。

若 `end = "present"`，代表這段 phase 仍在持續：

- 作者只需要維護穩定的 ongoing 寫法，不需要反覆手改今天日期
- runtime 應把它轉成可排序的「當下時間點」
- UI 顯示應收斂成 `Present` / `至今`，而不是把內部排序值直接暴露給使用者
- 若同時存在多個 ongoing phase，UI 可把它們的尾端收斂成單一 `Present / 至今` cluster；但這仍屬於 runtime projection / render，不新增新的 source event type

### 4.5 Scale Contract

timeline 的 scale 不再用模糊的 `magnitude` 過濾，而是改成明確的 authoring contract：

- `macro`
  - 代表足以定義人生主線 / 大階段切換的事件
  - 會出現在 `Macro`、`Meso`、`Micro`
- `meso`
  - 代表中尺度階段或關鍵轉折
  - 會出現在 `Meso`、`Micro`
- `micro`
  - 代表細節事件
  - 只出現在 `Micro`

可視為：

```ts
const scaleVisibility = {
  macro: [1, 2, 3],
  meso: [2, 3],
  micro: [3],
} as const;
```

也就是說，越高層級的事件，往更細尺度看時應保留；而不是每個 scale 各自長一份平行資料。

### 4.6 Timeline Projection

第一版 timeline 仍不直接把 `period event` 畫成跨年份 span / range block。

原因：

- 它會讓 timeline 幾何、年份刻度、card 排版一起變複雜
- 獨立 section 的第一版仍更適合先維持單一 event card 模型，不急著引入 span 幾何
- 真正麻煩的不是資料有沒有 `start / end`，而是 span 跟年份 divider 的幾何關係很容易失真

因此 projection 規則固定採：

- `point event` -> 投影成 `point`
- `period event` -> 投影成兩個 `point`
  - `period-start`
  - `period-end`

```ts
type TimelineProjectedEvent =
  | (TimelinePointEvent & {
      timeline_type: "point";
      year: string;
    })
  | {
      id: string;
      source_event_id: string;
      timeline_type: "period-start" | "period-end";
      year: string;
      scale: TimelineScale;
      title: TimelineLocalizedText;
      summary: TimelineLocalizedText;
      detail?: TimelineLocalizedText;
      references?: TimelineReference[];
    };
```

規則：

- `point` 的 `year` 由 `at` 直接映射
- `period-start` 使用 `start`
- `period-end` 使用 `end`
- 若 `period.end = "present"`，`period-end` 的排序鍵由 runtime 以當下日期投影；顯示文案則固定為 `Present` / `至今`
- 若同時存在多個 ongoing `period-end`，render 層可把它們合併成時間軸尾端單一 `Present / 至今` cluster；cluster detail 再展開各自的 title / summary / detail
- `category` 由 source event 繼承到 projected event，供 event card / detail card 顯示 badge
- `period-start` 的 `title / summary / detail` 優先讀 `start_*`，缺席時 fallback 到共用欄位
- `period-end` 的 `title / summary / detail` 優先讀 `end_*`，缺席時 fallback 到共用欄位
- `scale` 由 source event 繼承，不在 projection 階段重寫
- label 由 timeline UI 額外標記為 `Start` / `End`
- 不在第一版要求額外 span layer、range capsule、background band

### 4.7 Validation Rules

第一版 schema 應明確收斂，不把 timeline data 養成萬用 page builder：

- `type` 只允許 `point` / `period`
- `scale` 只允許 `macro` / `meso` / `micro`
- `category` 若存在，只允許 `education` / `internship` / `work`
- `point` 必須有 `at`
- `period` 必須有 `start` / `end`，其中 `end` 可為 sortable date string 或 `present`
- `id` 必須唯一且穩定
- localized text 若使用 object，至少應有一個語言值；runtime 可 fallback 到 `en`
- unknown field 預設視為 schema error，而不是默默吞掉

### 4.8 Load Strategy

timeline data 雖然由 JSON authoring，但載入策略仍需考慮靜態站限制：

- 在本機靜態伺服器 / 一般部署下，可直接 fetch `data/Timeline/timeline.json`
- 若需支援 `file://`，應提供 JS preload / inline preload fallback
- 無論載入策略如何，runtime 最後都只應吃 normalize 後的 timeline data，不直接要求作者同步維護第二份資料

## 5. 桌機版骨架

### 5.1 整體方向

desktop 採 `horizontal timeline`。

它應作為首頁中的獨立 section 存在，但視覺上仍可與首頁其它 section 保持一致，不需要長成 dashboard 式獨立系統。

### 5.2 核心骨架

- 一條 `horizontal ruler-like axis`
- 軸上有 `major ticks` 與 `minor ticks`
- 第一版不另外顯示獨立的年份 layer；年份資訊收斂在 event card 內
- 事件層與軸分離

結構上可拆成：

- `timeline header`
  - kicker
  - title
  - intro
  - scale switcher
- `timeline viewport`
  - 左右導覽按鈕
  - 可水平移動的 rail
- `axis layer`
  - 主線
- `event layer`
  - event marker
  - connector
  - event card
- `detail layer`
  - 顯示目前 active event 的 detail

### 5.3 Point Event 視覺語法

- 在軸上有一個小型節點
- 由節點往上或往下接一條細線
- 接到一張簡短 event card
- 卡片只放：
  - `year`
  - `title`
  - `one-line summary`

### 5.4 Period Event 視覺語法

第一版桌機不做獨立的 `period span layer`。

period event 以兩個 projected point 呈現：

- `period-start`
- `period-end`

視覺上仍共用 point card 骨架，但 metadata 需能區分：

- `2018 · Start`
- `2020 · End`

這樣可以保留 period 的時間語意，又不必引入另一套跨度幾何。

### 5.5 Detail 區

桌機建議保留一個 `active detail panel`。

理由：

- 讓主軸維持乾淨
- 避免每個 event 卡都寫太長
- 讓 point / period 都能共享同一個 detail surface

detail panel 內容建議為：

- `year` 或 `year range`
- `title`
- `summary`
- `detail`
- optional references

## 6. 手機版骨架

### 6.1 整體方向

mobile 一律切成 `vertical timeline`。

不保留桌機式 horizontal overflow 當主要模式。

原因：

- 橫向 timeline 在手機上會讓閱讀與操作負擔變重
- 真正好用的手機版，應該讀起來像單欄時間流，而不是 demo 式的橫向滑動

### 6.2 核心骨架

- 一條 `vertical rail`
- event 按時間往下排列
- point event 與 period event 仍使用不同語法

### 6.3 Point Event 視覺語法

- 一顆 dot / marker 貼在線旁
- 右側單欄卡片
- 卡片內包含：
  - `year`
  - `title`
  - `summary`

### 6.4 Period Event 視覺語法

mobile 第一版與 desktop 對齊，不做獨立 period section。

period event 同樣投影成：

- `period-start`
- `period-end`

若未來真的需要更強的 phase 感，再考慮在 mobile 增加：

- `period header`
- `section/chapter block`

### 6.5 Detail 行為

mobile 可採兩種策略擇一：

- `inline expand`
- `單一 detail panel 放在 timeline 下方`

MVP 建議優先：

- 點擊 event -> 更新區塊下方 detail panel

理由：

- 跟桌機行為一致
- 狀態管理比較單純
- 不需要先處理 inline accordion 的高度跳動

## 7. 互動範圍

### 7.1 MVP 要做

- 點擊 / tap event 後切換 active state
- active event 更新 detail panel
- desktop / mobile 依 breakpoint 切換 horizontal / vertical
- timeline 支援固定 scale stage 切換
- `period event` 先投影成 `start / end` 兩個點
- active / inactive 狀態清楚可辨

### 7.2 MVP 不做

- drag / pan
- zoom
- hover-only reveal
- timeline 內建搜尋
- event filtering
- 自動 sticky sync / scroll spy
- event 與 page reference 的自動雙向連動

## 8. Responsive 規則

### 8.1 Desktop

- 使用 horizontal timeline
- 可容納 axis、event layer、detail panel
- 允許上下交錯配置 point cards

### 8.2 Tablet

- 若寬度足夠，可維持 horizontal，但應降低 event 密度
- 若寬度開始擁擠，優先提早切成 vertical，而不是硬撐縮小版 horizontal

### 8.3 Mobile

- 一律 vertical
- 取消桌機的上下交錯
- 收斂成單欄閱讀順序

## 9. HTML / 元件分層建議

### 9.1 容器層

```html
<section class="about-timeline">
  <div class="about-timeline-intro"></div>
  <div class="timeline-shell">
    <div class="timeline-axis"></div>
    <div class="timeline-events"></div>
    <div class="timeline-detail"></div>
  </div>
</section>
```

### 9.2 Event 元件

- `timeline-event`
- `timeline-event-card`
- `timeline-event-axis-slot`
- `timeline-event-connector`
- `timeline-event-marker`

事件 type 以 `data-timeline-type` 區分：

- `point`
- `period-start`
- `period-end`

### 9.3 狀態

- `is-active`
- `is-inactive`
- optional `is-visited`

## 10. 視覺原則

- timeline 所在區塊要有明確 section identity，但仍維持首頁整體閱讀節奏，不要像 dashboard
- 線與刻度應明確，但不應比 event card 更搶眼
- 年份應是可快速掃描的 metadata，而不是唯一視覺焦點
- 第一版不追求把 period 強行畫成跨度；比起 fake span，更重要的是時間語意清楚
- 第一版不顯示獨立的年份虛線與年份標籤，避免 timeline 主軸出現意義不明的輔助線
- 手機版不追求保留桌機的排法，而追求閱讀穩定

## 11. 參考來源收斂

目前視覺參考池記在：

- `docs/miscellaneous/visual-sources.md`

收斂出的主要借鑑方向：

- `TriVector`
  - period / phase-first 思路
- `ritz078`
  - horizontal axis + active detail pane
- `cjl750`
  - 高密 milestones 與 responsive 重排思路
- `krishnab`
  - vertical editorial timeline 的單欄 fallback

## 12. 建議實作順序

1. 先定 `data/Timeline/timeline.json` 的 schema 與 validation rules
2. 在 runtime 補一層 loader / normalize / projection，讓 UI 不再直接依賴手寫 JS event 陣列
3. 把既有 hard-coded timeline events 從前端 JS 遷到 JSON source
4. 保留目前 desktop / mobile 骨架與 detail panel，先只替換資料來源，不急著重做 UI
5. 再決定是否需要 `file://` preload fallback、references 與更細的 authoring helper

## 13. 開放決策

以下事情仍未定案：

- `data/Timeline/timeline.json` 是否需要同步生成一份 `timeline.js` 作為 `file://` fallback
- 未來是否真的要把 `period event` 升格成獨立 span layer
- period event 是否允許 children point events 在 mobile 內展開
- detail panel 是否需要顯示 references
- timeline 是否要在未來升格成獨立頁面

## 14. 一句話總結

這份 spec 的核心決策是：

- `desktop` 用 horizontal ruler-like timeline
- `mobile` 用 vertical single-column timeline
- `period event` 先以 `start / end` 兩點投影到 timeline
- authoring 以 `data/Timeline/timeline.json` 為 source of truth，由 runtime parse / normalize / project 後再 render
- 整體作為首頁上的獨立 section，而不是 `About Me` 的附屬區塊、dashboard 或另一份履歷頁
