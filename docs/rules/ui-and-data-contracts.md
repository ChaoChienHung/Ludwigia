# UI, Theme, Settings & Homepage Data Contracts

本文件承接根目錄 `AGENTS.md`，集中首頁結構化資料區塊（`Timeline`、`Skills`、`Credentials`）以及主站樣式、Theme / Palette / Effects、Reading Mode、Settings、行動端導覽與 i18n 作用域的不可退化契約。修改相關前端程式、CSS、i18n 或 `data/` JSON 前請先查閱本文件。

## 1. 首頁結構化資料驅動區塊（SSOT）

### Timeline（`data/Timeline/timeline.json`）

- 作者只維護 timeline data，不得要求同步手改前端 JS event 陣列。
- runtime 只負責 load / validate / normalize / projection / render；projection 不得反過來成為新的手動真相來源。
- `scale` 語意固定為：`macro -> Macro + Meso + Micro`、`meso -> Meso + Micro`、`micro -> Micro only`。
- `period` 若支援 `start_*` / `end_*` 欄位，缺席時必須 fallback 到共用 `title / summary / detail`，不強迫作者永遠維護兩份 description。
- ongoing `period` 的穩定 authoring 寫法為 `end: "present"`；runtime 投影成「至今 / Present」顯示與可排序的當下時間點，不迫使作者反覆手改今天日期。
- 若同時存在多個 ongoing `period`，timeline UI 可把多個 `period-end` 收斂為單一尾端 `Present / 至今` cluster；source data 仍維持逐筆 event，cluster 本身不得成為新的手動資料層。
- `category` metadata（例如 `education` / `internship` / `work`）只作為輕量 facet 與 badge 顯示來源，不得長成第二套固定配色系統破壞 palette-driven 契約。
- `references` 延伸連結須支援 `{ title, url }` 與 `{ title, canonical }`（或 `canonical_id` / `canonicalId`）；前端 runtime 負責 resolve canonical link 與無標題時的 title fallback／退化處理；統一以 ordered list（`<ol>`）呈現，視覺樣式與 `notes/writings` 內 linked text 一致（預設收斂、hover 呈現 accent 亮彩與箭頭微動）。

### Skills 與 Credentials（`data/Skills/skills.json`、`data/Credentials/credentials.json`）

- 作者只維護 source JSON，前端 runtime（`assets/js/about-skills.js` / `assets/js/about-credentials.js`）負責載入、正規化、多語切換與 DOM 渲染，不得要求手動維護第二份 HTML 靜態資料。
- `Skills` 必須維持類別分組與頁籤／箭頭控制，確保多個技能面板共用顯示空間，隨技能成長仍維持空間精簡。
- `Credentials` 必須維持 `Type` 與 `Domain/Category` 雙維度篩選、主視覺展示區、縮圖導覽列與 Modal 燈箱放大檢視能力；視覺元件完全繼承全站 Theme 與 Palette Design Tokens。

## 2. 樣式層級、Theme、Ambience 與 Reading Mode

- **CSS 層疊順序與 opt-in 抬升**：主站樣式由 `assets/css/site/shared.css` 依序 `@import` 分檔 `shared-NN-*.css`（分檔順序即層疊順序）。Theme ambient 的內容抬升必須維持 opt-in（只抬升 `section` / `main` / `header` / `article` / `footer`），浮層不得依賴登記進排除清單。
- **Theme 動效可關閉與單一機制**：Theme 專屬視覺效果（例如 Galaxy 流星／星空）必須可關閉／限定，避免遮擋可讀性與互動；新增 theme（例如 `Sky` / `Garden`）的動效控制須收斂到同一個可關閉機制（`Effects` / `site_theme_motion_v1`），不各自長出平行設定開關；尊重 `prefers-reduced-motion`。
- **Sky 背景解耦**：`Sky` 雲朵背景（`sky-clouds`）屬 theme ambience，不應被 settings pills / active state 的局部樣式誤傷；調整視覺時應分開處理。
- **內容頁 Footer 完整性**：`notes / writing / canvas` 單篇頁底部的 footer 必須維持語意完整的 footer 區塊：`© 2025 Ludwig ...` 必須明確落在 footer 內，視覺上是單一、完整、theme-consistent 的底部 surface，不得在上方切出 theme ambient / body gradient 的帶狀過渡；此為共通版型約束，不可只針對單一 theme 例外修補。
- **Theme Ambience 成本分級**：首頁／landing 可保留較強 atmosphere；`notes / writing / canvas` 內容頁優先使用較省效能、較不搶注意力的版本。若某 ambient effect 在內容頁明顯卡頓，優先降級、靜態化或移除高成本子效果，而非只調 opacity 硬撐。
- **Reading Mode Hard-Off 契約**：一旦進入 Reading Mode，主站共用 theme runtime 的 ambience / motion layer 必須一律關閉，優先級高於 settings 的 `Effects` 開關。
- **主站 Theme Runtime 責任邊界**：預設只保證主站頁面與標準內容頁生效（首頁、Portfolio/More、Projects/Search/Settings、section landing、tag detail、`notes / writing / canvas` landing 與內容頁）。`portals/realms/garden/index.html` 等獨立 extension / prototype surface 可保留自有 theme/runtime，除非有顯式整合契約。
- **Note 頁補充元件獨立變數**：`block` / `callout` / `takeaways` 各自擁有明確的 theme surface variables（background / border / shadow / radius / icon）；即使暫時同值，命名與責任不可混用；新增／調整 theme 時必須同步檢查三類元件。
- **禁止連續疊 Override**：若視覺問題需連續疊多層 override 才壓得住，優先視為底層 variable pipeline / selector 分層失真，回頭修 token、共用元件層或主 selector，即使需要較大 refactor 也優先於累積 override 技術債。

## 3. Settings 互動與行動端分組卡片流

- **職責分明**：`Theme` 管大方向 surface / atmosphere / readability / ambient effect；`Palette` 管 accent 與互動特效（selected / hover / focus / ring）。
- **三類控件統一語意**：settings controls 分為 sidebar tabs（panel navigation）、status pills（`Language` / `Effects`）、preview pills（`Theme` / `Palette`）；所有 selected / hover 特效皆跟著目前 `Palette` 走。`Theme` / `Palette` 本身的 preview 色只當 preview dot 或身份提示，不反過來接管 selected 外框／背景。
- **單一狀態來源**：
  - `Copilot` 可見性收斂為單一偏好來源（`off / home / all`），由共用 settings runtime 與 localStorage 管理，不得讓 modal、`pages/settings.html` 與 `copilot.js` 各自長出平行判斷。
  - Settings 以 modal 為主；`pages/settings.html`（fallback / direct-link）必須與 modal 共用同一套 data attrs / JS API / i18n labels，不可各自長出平行邏輯。
- **行動端 iOS 分組卡片流（Mobile Inset Grouped Settings Architecture）**：
  - 手機端（`<= 767.98px`）取消 General / Style 標籤分頁切換，改為縱向連續滾動之圓角群組卡片（Inset Grouped Cards）。
  - 語言、動態效果、Copilot 等少項選擇採用滿版分段控制器（Segmented Control），色盤採用橫向流暢觸控滾動，主題採用 3x2 網格排版。
  - 桌面端維持分頁導航，行動端與桌面端完全共用同一套 `[data-settings-*]` 屬性與 `LudwigSettingsRuntime`，嚴禁產生狀態分歧。

## 4. 小螢幕導覽、響應式標籤與 i18n 隔離

- **小螢幕 Additional 入口（「單一角落、單一主入口」）**：
  - 首頁／section landing 的 misc/FAB，與 note / writing 單篇頁的 metadata 入口，優先收斂到同一個右下角主入口。
  - note / writing 的 page-level action（`Outline` / `Metadata`）若不走右下角主入口，優先收斂到內容頁頂部 navbar 左右兩側，不得另長互搶角落的 mobile FAB。
  - 全站浮動選單（Site FAB / Misc）預設收斂為 `Portals` 與 `Labs` 雙核心探索樞紐；`Garden` 與 `World` 由 `Portals` 承接，不應在 FAB 塞滿過多入口。
  - 不應拆成多顆各自漂浮、只靠位置微調硬避開的入口。
- **手機獨立 IA 邊界**：
  - 僅作用在真正手機螢幕；desktop 與一般 laptop / tablet 不應被連帶改成 mobile 導覽。
  - 手機上不應同時保留 desktop-style navbar dropdown、底部 tab bar 與多顆漂浮入口三套平行系統。
  - note / writing / canvas 單篇頁可在頂部 navbar 保留品牌 `Ludwig`，以左右按鈕承接 page-level sidebar action，不取代 bottom nav 的 site-level 導覽。
  - 所有依賴 hover 的 sidebar / reveal interaction，在手機上都必須有明確的 tap-first 入口。
- **響應式分層與標籤契約（Responsive Content & Label Contract）**：
  - **無損響應式雙態標籤（Non-Destructive Dual-Span Pattern）**：按鈕或操作文字在手機與桌機需長短文案分流（如 `Full Preview` vs `Preview`、`Download Document` vs `Download`）時，一律採宣告式雙態標籤（`<span class="*-text-desktop">...</span><span class="*-text-mobile">...</span>`）並由 CSS Media Query 控制顯隱；嚴禁依賴 resize 事件以 JS 暴力替換 `innerHTML` / `textContent`（避免抹除 `<i>` 圖示或觸發畫面抖動）。
  - **行動端資訊架構階層化與漸進揭露（Progressive Disclosure）**：手機端優先保證結構辨識度與空間精簡度，次要文案與裝飾性描述採語意化類別（如 `d-none d-md-block` 或 `skill-description`）優雅降級或折疊，禁止各元件引入 ad-hoc 破壞性刪減。
  - **資料層與呈現層嚴格解耦**：無論桌面或行動呈現如何精簡，底層永遠維持單一真相來源（`skills.json`、`credentials.json`、`timeline.json`、source `.md`），不得為行動端維護第二份資料。
- **全站 i18n 字典選擇器作用域強隔離契約（Scoped Namespace Isolation Contract）**：
  - 共用或導覽列語系字典（如 `i18n/navbar.json`）中的所有選擇器必須嚴格以所屬容器為前綴（如 `.custom-nav ...`），嚴禁使用無父層作用域的裸標籤／屬性選擇器（如 `a[href$="..."]`），防止跨元件污染獨立頁面的卡片（`.hub-card`）或行動底部導覽（`#mobile-bottom-nav`）。
  - 行動底部導覽（`#mobile-bottom-nav`）的多語切換必須僅針對專屬子元素（如 `.mobile-bottom-nav-item span`）更新文字，不得整體覆蓋父層 `<a>`，確保 FontAwesome 圖示（`<i>`）永不退化。

## 延伸閱讀

- Theme / Palette 擴充指南：`docs/guide/theme-palette-guide.md`
- 資料檔編寫與多語指南：`docs/guide/data-authoring-guide.md`、`docs/guide/language-guide.md`
- 規格參考：`docs/specs/timeline-design-spec.md`、`docs/specs/skills-credentials-spec.md`、`docs/specs/layout-spec.md`
