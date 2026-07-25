# Theme / Palette Expansion Guide

這份文件是 Ludwigia 的 theme / palette 擴充 playbook / impact map：當你要新增 `theme` 或 `palette`、調整 settings controls、或擴充 `Effects` / `Language` / sidebar tabs 時，用它來盤點會牽動哪些檔案、哪些 UI surface、哪些最低驗收要補。

它不負責重寫完整視覺規格；原則與長期約束請回 canonical 文件：

- 不可退化底線：`AGENTS.md`
- 系統 contract / state / fallback 策略：`docs/specs/system-spec.md`
- Theme vs Palette 的 UX 分工：`docs/design/design.md`
- 驗收與手動檢查：`docs/rules/checklist.md`
- 守門原則：`docs/rules/guardrails.md`
- 外部視覺來源與 attribution：`docs/miscellaneous/visual-sources.md`

目標不是把所有視覺一次講死，而是避免之後新增一個 theme / palette 時漏改一半，造成：

- settings 有新選項，但頁面沒吃到
- 首頁 / 單篇頁 / fallback settings 頁表現不一致
- active / hover / focus 的責任混亂
- preload 不完整，首次載入閃錯 theme
- theme effect 太重，影響效能或閱讀

## 先對照的原則

- `Theme` 管整體氛圍；`Palette` 管 accent 與互動特效
- settings 內所有 interactive highlight 都應由目前 `Palette` 驅動
- `Theme` / `Palette` 自身的顏色只放在 preview dot，不直接接手 selected 外框 / 背景
- 所有 theme effect 都要服從 `Effects` 開關與可讀性優先原則
- `notes / writing / canvas` 內容頁的 footer 是獨立、完整的 theme surface
- theme ambience 應區分 landing 與 content page 成本等級
- modal settings 與 `pages/settings.html` fallback 必須共用同一套 data attrs / JS API / labels

更完整的原則與契約，請回看 `AGENTS.md`、`docs/specs/system-spec.md`、`docs/design/design.md`、`docs/rules/guardrails.md`。

## 什麼時候需要打開這份

- 新增一個 theme
- 新增一個 palette
- 調整 settings modal / fallback settings page 的控制元件
- 修改 theme ambience / effects 開關 / preload 邏輯
- 調整 note surface、footer、navbar、FAB 或 mobile chrome 的 theme 相容行為

## Impact Map

### 1. 全站 tokens

- 檔案：`assets/css/site/shared.css`
- 至少補齊：
  - `--bg`
  - `--bg-alt`
  - `--text`
  - `--accent`
  - `--site-accent`
  - `--navbar-bg`
  - `--navbar-bg-scrolled`
  - `--navbar-reading-bg`
  - `--navbar-reading-bg-scrolled`
  - `--navbar-reading-text`
  - `--navbar-reading-brand`
  - `--brand-color`
  - `--project-card-bg`
  - `--hero-gradient-start`
  - `--hero-gradient-end`
  - `--footer-bg`
  - `--border-color`
  - `--entry-hover-*`
- 若調整 note 的 Reading Mode：同步盤點 `assets/css/content-page/default/style.css` 內的 `--note-reading-page-bg`

### 2. Theme class 掛載與持久化

- 檔案：`core/script.js`
- 檢查：
  - `THEME_LABELS`
  - `THEME_CLASSES`
  - `setTheme()`
  - `getCurrentTheme()`
  - `initialTheme` 判斷
  - `colorScheme` 是否合理

### 3. 首次載入 preload

- 檔案：`tools/content_styles/_shared/partials/head_links.html`
- 檢查：
  - `<head>` preload script 是否會在首屏前掛上新 theme class
  - 若有對應 palette，也要同步 preload

### 4. Settings 選項與標籤

- 檔案：
  - `core/script.js`
  - `core/i18n.js`
  - `pages/settings.html`
- 檢查：
  - settings modal 是否有新 theme 選項
  - fallback settings page 是否同步
  - i18n label 是否同步
  - modal 與 fallback 是否仍共用同一套 data attrs（例如 `data-settings-theme` / `data-settings-palette` / `data-settings-motion` / `data-settings-lang`）

### 5. Settings sidebar / pills

- 檔案：`assets/css/site/shared.css`
- 檢查：
  - `.settings-nav`
  - `.settings-nav .nav-link`
  - `.settings-pill`
  - `.settings-pill--status`
  - `.settings-pill--preview`
  - active / hover / focus 狀態
- 守門：
  - settings 專用元件用 `settings-pill`
  - 不要再共用 `garden-tag`
  - sidebar tabs 屬 navigation、`Language` / `Effects` 屬 status pills、`Theme` / `Palette` 屬 preview pills；用途可以不同，但顏色特效要同樣吃目前 palette

### 6. 主內容容器

- 檔案：
  - `assets/css/site/shared.css`
  - `assets/css/content-page/default/style.css`
- 檢查：
  - `.project-card`
  - `.section-entry`
  - `.garden-result`
  - `note` 頁的 `callout / block / takeaways / blockquote / code block`
  - `note` 頁左右側欄：`TOC / metadata` overlays、FAB、panel items、actions
- 守門：
  - `callout / block / takeaways` 要各自有明確的 theme variables（至少 `bg / border / shadow / radius / icon`）
  - 現階段可以先填同值，但不要把三者偷綁成「靠 override 剛好看起來一致」
  - 若只改其中一個元件就能讓畫面暫時看起來對，先回頭檢查是不是另外兩個還在吃 generic fallback
  - `notes / writing / canvas` 單篇頁底部需檢查 footer 是否仍為單一、完整的底部 surface；copyright 不應看起來像漂浮在 theme 背景上
  - 單篇頁最底部不應出現 theme ambient / body gradient 在 footer 上方額外切出的帶狀區塊

### 7. 導航與全站 chrome

- 檔案：`assets/css/site/shared.css`
- 檢查：
  - `.custom-nav`
  - `.custom-brand`
  - `.site-fab`
  - `.site-fab-panel`
  - mobile bottom nav / sheet

### 8. 主題特效

- 檔案：
  - `core/script.js`
  - `assets/css/site/shared.css`
  - `docs/miscellaneous/visual-sources.md`
- 目前結構：
  - `Sky` 與 `Garden` 共享 `initSkyGardenAmbience()` 這類共用掛載點，避免每個 theme 各長一套平行的開關與掛載邏輯
  - `Garden` ambient 若存在，應優先收斂成低對比 bloom / pollen / stem silhouette 這類背景語彙，而不是直接複製完整場景式作品
  - theme ambience 需要預留 content page 降級策略；不要預設首頁可接受的 animation / blur 成本也適合長文閱讀頁
- 檢查：
  - 是否真的需要 ambient effect
  - 是否可用 `Effects` 關閉
  - 是否會遮內容
  - 是否導致卡頓
  - 在 `notes / writing / canvas` 是否需要靜態化、減量或關閉部分子效果
  - 外部參考來源是否已記錄

## 新增 Palette 時要檢查的地方

### 1. Palette tokens

- 檔案：`assets/css/site/shared.css`
- 至少補：
  - `.palette-<name>`
  - `--palette-accent-dark`
  - `--palette-accent-light`

### 2. Palette class 掛載與持久化

- 檔案：`core/script.js`
- 檢查：
  - `PALETTE_CLASSES`
  - `setPalette()`
  - `getSavedPalette()`

### 3. Palette labels 與順序

- 檔案：
  - `core/script.js`
  - `core/i18n.js`
  - `pages/settings.html`
- 檢查：
  - modal / fallback settings page 順序一致
  - label 一致

### 4. Palette preview 與 active state

- 檔案：`assets/css/site/shared.css`
- 檢查：
  - `[data-settings-palette]`
  - `[data-settings-theme]`
  - `--ui-control-preview`
  - active / hover / focus
- 守門：
  - preview dot 可用 preview color，但 selected / hover / focus 不應由 preview color 接管
  - 所有 interactive highlight 仍要跟著目前 palette accent

### 5. 首次載入 preload

- 檔案：`tools/content_styles/_shared/partials/head_links.html`
- 檢查：
  - `<head>` preload script 是否包含新 palette class

## 每次新增 Theme / Palette 的最低驗收

- `首頁`：hero、card、navbar、FAB 正常
- `notes / writing 單篇頁`：文字可讀、容器層級清楚
- `notes / writing` 的 Reading Mode：navbar 改吃 reading-specific token，且 theme effect 不論 `Effects` 是否開啟都必須停用
- `notes / writing 單篇頁底部`：footer 為完整底部區塊，沒有額外 theme 帶狀過渡，copyright 明確位於 footer 內
- `settings modal`：sidebar / pills / active state 正常
- `pages/settings.html` fallback 頁：與 modal 一致
- `settings controls`：sidebar tabs、status pills、preview pills 都維持同一套 palette-driven 特效
- `mobile`：沒有因 theme/palette 讓 nav 或 layout 壞掉
- `preload`：不閃錯 theme / palette
- `effects`：開 / 關都正常
- `performance`：切 theme 不應明顯卡頓

## 常見漏點

- 忘了更新 `head_links.html`，結果首屏先閃成舊 theme
- modal 有新選項，但 `pages/settings.html` 沒同步
- 把 `Theme` / `Palette` 的 preview 色直接拿去控制 selected 外框/背景，結果違反「Theme 管大方向、Palette 管細節」的原則
- settings controls 的 active 狀態若要做 theme-specific style，需先確認是不是其實該回到 palette-driven 規則；只有 surface / atmosphere / text contrast 才應主要由 theme 接手
- `Sky` 的雲朵背景（`sky-clouds`）屬 theme ambience；它的質感、漂移方向與材質要與 settings pills 分開調整，避免修 pills 時連背景雲層一起退化
- 只在某一個 theme 修掉內容頁底部問題，卻沒有回頭確認 `Sky` / `Garden` / 其他 theme 是否共享同一個版型 bug
- 內容頁直接沿用首頁等級的 ambient，導致底部 banding 或長文閱讀掉幀
- `core/i18n.js` label 沒補，導致靜態頁顯示不全
- settings 專用 pills 跟站內 tag 共用 class，最後互相污染
- theme effect 視覺很好看，但蓋到內容或造成掉幀
- 文章頁左右側欄仍停留在「light / not-light」二分法，導致新 theme 看起來都像同一款
- `callout / block / takeaways` 其中一個元件靠局部 override 修好了，但另外兩個仍吃舊 fallback，最後 theme 色系分裂
- 發現 override 越補越多時沒有回頭整理 token / selector pipeline，最後把 theme 擴充變成到處打補丁
