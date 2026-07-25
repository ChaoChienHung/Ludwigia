# Layout Spec（Responsive Baseline）

目的：提供一套「共用 responsive layout」的最小規範（breakpoints + container/grid + 版面行為），讓後續新增 widget/頁面時，不需要每次重新發明 responsive 規則。

## 原則

- 以閱讀為中心：主要內容維持穩定的欄寬與每行字數（避免 desktop 太寬、mobile 太擠）
- 先定 layout，再定 widget：widget 只要對齊 layout 的 slot（content/meta/nav）就能自然 responsive
- 少量 token 化：用少數「可重用」的寬度/間距/欄位策略，避免每頁自己長一套

## Breakpoints（沿用 Bootstrap 心智模型）

- xs：< 576px（手機）
- sm：≥ 576px
- md：≥ 768px（平板）
- lg：≥ 992px（桌機）
- xl：≥ 1200px（大桌機）

## Containers（建議）

- `container`：全站基本容器（可沿用 bootstrap `.container`）
- `reading container`：偏文章/閱讀入口頁（Notes/Writing/Canvas landing；UI 中文目前為「筆記 / 文章 / 視界」；以及文章 detail）
  - max-width：920px（目前 section landing 已採用 920px 的對齊邊界）

## Grids（頁面槽位）

### A) Section Landing（notes/writing/canvas）

- 結構：hero（kicker/title/subtitle）→ toolbar（search + filter）→ feed（list）
- Desktop（lg+）
  - toolbar：search 置左，count 置右
  - feed：左文字右縮圖（固定縮圖寬度），entry 間距偏鬆（更像 Medium）
- Mobile（xs）
  - toolbar：垂直堆疊（search 全寬）
  - feed：縮圖移到下方（cover 100% 寬）
  - misc/additional actions：收斂到右下角單一主入口（不另外長第二顆漂浮按鈕）
  - site navigation：改走手機專用 bottom nav；desktop navbar dropdown 不直接照搬
- Filter：用 icon 觸發 tag panel（避免把 Search page 的完整 UI 搬過來）

### B) Content Detail（notes/writing/canvas single page）

- 槽位：
  - `nav`：頂部固定導覽
  - `content`：文章正文（reading container）
  - `meta/toc`：可選 sidebar（桌機顯示，手機折疊/改 modal）
- Mobile（xs）
  - sidebar 不常駐：閱讀控制可收斂到頂部 navbar 左右兩側的 page-level action，或由單一附加入口分流到 `Metadata` / `Outline`
  - bottom nav 維持 site-level IA；內容頁的 `Outline` / `Metadata` 不應再各自長成漂浮按鈕去搶角落
  - hover affordance 必須顯性化：閱讀控制優先改成可點的 navbar button / toolbar，再開 drawer
  - 互動元件（quiz/prompt）要避免擠壓正文可讀性

### C) Search（pages/search.html）

- Search bar 作為主互動：維持「一行」可用（icon + input + quick actions）
- Tag filter 走 modal（可增長、避免常駐污染視覺）

### D) Garden（garden/index.html）

- Garden UI 可獨立於主站 layout token，但資料仍只讀 `window.SITE_SEARCH_INDEX`
- 若 Garden 需要 responsive：優先對齊同一套 breakpoints（xs/sm/md/lg/xl），避免另一套心智模型

## Spacing / Typography（最小建議）

- 行高：正文 1.65–1.8（mobile 稍高）
- 段落間距：以「可掃讀」為主（mobile 稍縮）
- 卡片/列表間距：desktop 比 mobile 更鬆（提升呼吸感）
- 13 吋筆電 baseline（目前先以 MacBook Air 13" 體感校準）：
  - `index.html#about` 的 `.page-text` `1.2rem` 可作為「舒適但不鬆散」的 desktop 內文基準
  - 英文內容頁可先沿用 default note sans stack，並以 `1.2rem` 當第一輪桌機字級參考
  - 中文內容可暫時維持較大的 note baseline；若後續再收斂，應把英文 / 中文的差異明確寫成 token，而不是散落 override

## 驗收（每次改 layout 都要過）

- xs / md / lg 三個檔位至少各看一次：
  - `notes/index.html`、`writing/index.html`、`canvas/index.html`
  - 任選一篇 detail page（notes/writing/canvas 各一）
  - `pages/search.html`、`garden/index.html`
