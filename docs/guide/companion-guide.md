# Companion Guide

這份 guide 不是正式 spec，而是給未來擴充 `Companion` 時的 impact map。目標是回答兩件事：

- 要改 `Companion`，通常會動到哪些檔
- 哪些地方可以換，哪些地方不要亂換

正式契約請以 `docs/specs/companion-spec.md` 為準。

## 先判斷你在改哪一層

### 1. 只改美術 / 視覺載體

適用情境：

- 換新的 SVG avatar
- 換成另一套 placeholder 美術
- 微調五官、配色、描邊、hover glow

通常會碰：

- `assets/vendor/avatar/dicebear-pixel-art-neutral-ludwig.js`
- `assets/css/site/shared.css`
- `core/script.js` 的 runtime version 常數（若需要 cache bust）

不該碰：

- `Copilot` / `Companion` 的角色邏輯
- shared anchor 與 fallback contract

### 2. 改互動效果

適用情境：

- 加 / 改 gaze
- 加拖曳阻尼、慣性、浮動 motion
- 改進 suppression / reading-mode 隱藏邏輯

通常會碰：

- `assets/js/companion.js`
- `assets/js/copilot-base.js`
- `assets/css/site/shared.css`

注意：

- 互動效果是 enhancement，不應讓 companion 成為唯一入口
- 載入失敗時仍要能回退到 copilot entry

### 3. 改 settings / feature flag

適用情境：

- 重新開啟 companion 開關
- 加回 variant picker
- 加 placeholder 說明或 beta 標記

通常會碰：

- `core/script.js`
- `pages/settings.html`
- 若新增文件，記得同步 `docs/README.md`、`AGENTS.md`、`README.md`

### 4. 改成新 runtime 載體

適用情境：

- svg -> canvas
- svg -> live2d
- 加 model loader / animation runtime

通常會碰：

- `assets/js/companion.js`
- `assets/js/copilot-base.js`
- `assets/vendor/` 或 `assets/live2d/`
- `assets/css/site/shared.css`
- `docs/specs/companion-spec.md`

先確認：

- 有沒有新依賴
- 授權是否可長期使用
- 靜態站是否仍可工作
- 失敗時怎麼回退

## 擴充 Companion 的推薦流程

1. 先看 `docs/specs/companion-spec.md`
2. 判斷這次是改美術、互動、settings，還是換 runtime 載體
3. 先保住 `Copilot` fallback
4. 再改 companion enhancement
5. 最後補文件、cache bust、手動驗證

## 最低驗證清單

- `Companion` 關閉時，`Copilot` 一定可見
- `Companion` 開啟時，不會冒出第二套獨立入口
- reset position 仍回到 shared anchor
- reading-mode / overlay / modal 情境下不會干擾閱讀
- settings 顯示與實際 runtime state 一致
- asset version 有更新，瀏覽器不會一直吃舊檔

## 什麼時候需要補 spec

以下情況不要只改 code，請同步更新 `docs/specs/companion-spec.md`：

- 改預設位置或 reset anchor
- 改基準尺寸
- 改 `Companion` 與 `Copilot` 的取代關係
- 改 settings 對 companion 的公開語意
- 改 placeholder / hidden / reopen contract
