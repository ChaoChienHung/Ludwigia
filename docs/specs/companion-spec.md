# Companion Spec

這份文件定義站內 `Companion` 的最小可驗證契約，目標不是規定美術長相，而是先固定它和 `Copilot` 的責任邊界、位置、尺寸與 fallback 行為，讓之後要重新打開 companion 時不必重新猜整套 runtime 應該長什麼樣。

## 目前狀態

- `Companion` 目前是 placeholder：runtime 邏輯保留，但 UI 預設隱藏
- 站上目前只保留 `Copilot` 入口
- 之後若重新開啟 `Companion`，應沿用本文件的 baseline，而不是重新發明另一套入口機制

## 角色邊界

- `Copilot`：固定位置、靜態 avatar、點開極簡 chat shell、負責站內導覽 fallback
- `Companion`：繼承 `Copilot` 的基礎入口能力，但可以額外加入互動效果，例如 gaze、drag、motion、future animated model
- `Companion` 不是獨立第二套聊天產品；它是 `Base Copilot` 的 enhanced form
- 若 `Companion` 開啟，它可以取代 `Copilot` 的固定入口；若 `Companion` 關閉，`Copilot` 必須穩定回退顯示

## Placement Contract

- 預設錨點沿用 `Base Copilot` 的 shared anchor position
- companion 的 reset position 必須回到同一個 shared anchor，而不是各 runtime 自己定義不同預設點
- route guard 與 viewport guard 應與 `Copilot` 共用同一層策略，不應一個出現、一個消失卻沒有共同規則
- 內容閱讀情境若會干擾閱讀，例如 Reading Mode、page-level overlays、modal open，`Companion` 必須能被抑制或隱藏

## Size Contract

- companion avatar baseline 尺寸目前固定為 `88 x 88`
- 若未來因 model / canvas / live2d 載體需要放大，應先定義新的 shared size token，而不是只在單一 theme 或單一路由硬寫例外
- 命中區域、視覺外框與 pointer hit area 應一起考慮；不能只有圖變大、可點擊區域仍停在舊尺寸

## Basic Requirements

- 必須以 `Base Copilot` 為基底，沿用：
  - shared anchor / mount / unmount
  - shared sheet open/close 行為
  - shared suppression context
  - shared local preference storage key family
- Companion-specific 功能只能加在 enhancement 層，例如：
  - draggable position
  - eye tracking / gaze
  - future canvas/live2d animation
  - future variant switching
- companion 若載入失敗，不能讓整個頁面失去 copilot entry
- companion 目前即使被隱藏，runtime contract 與 settings API 名稱應保留，避免未來 reopen 時又換一套公開介面

## Placeholder Contract

- placeholder 階段不顯示 companion avatar variant picker
- placeholder 階段 settings 不應允許把 companion 真正打開
- placeholder 階段可以保留文案或文件說明，告知此功能暫時隱藏、待 avatar redesign

## Future Extension

- 允許未來切換不同視覺載體：
  - static svg
  - canvas animation
  - live2d / model runtime
- 無論視覺載體如何變，下面幾條不應變：
  - 入口語意仍是 `Companion extends Copilot`
  - reset / suppress / route guard / viewport guard 仍走 shared contract
  - settings 的 companion state 仍由單一偏好來源驅動
  - 若功能暫停，copilot fallback 必須立即回來
