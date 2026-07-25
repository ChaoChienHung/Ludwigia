# Visual Sources

本文件集中記錄 Ludwigia 視覺效果的外部參考來源，方便後續維護、回溯與補充 attribution。

## 使用原則

- 優先採「概念借鑑 + 自行重寫」，避免直接搬運第三方完整程式碼。
- 若引用來源含素材檔（圖片、SVG、音效等），需先確認授權條件再納入 repo。
- 每次新增視覺效果時，請同步補上「來源連結 + 套用範圍 + 實作位置」。

## 目前來源

### Sky Theme 雲朵（Clouds）

- Source: https://css-tricks.com/drawing-realistic-clouds-with-svg-and-css/
- 套用範圍: `sky-theme` 背景雲層視覺語彙（雲形質感、位移噪聲概念）
- 實作位置:
  - `assets/css/site/shared.css`（`.sky-cloud*` 與 `@keyframes sky-cloud-*`）
  - `core/script.js`（`initSkyGardenAmbience()` 內雲層產生邏輯）
- 備註: 目前已依 Ludwigia 風格重寫為背景層動畫，並加入雙向漂移與隨機大小/速度。

### Deep Sea 魚群（Fish）

- Source: https://www.youtube.com/watch?v=PjpRTEFzsVg&t=31s
- 套用範圍: `deep-sea-theme` 的魚群動態與游動節奏參考
- 實作位置:
  - `assets/css/site/shared.css`（`.deep-sea-fish*` 與相關 keyframes）
  - `core/script.js`（`buildFishSvg()`、`initDeepSeaFish()`）
- 備註: 目前使用程式生成與站內樣式變數，不直接依賴外部託管素材。

### Garden Theme 日光背景（Sunlit Atmosphere）

- Source: https://forestapp.cc/
- 套用範圍: `garden-theme` 可參考的日光背景語彙，包括深淺漸層天空、上層光束、hero 錨定地面光暈。
- 預計實作位置:
  - `assets/css/site/shared.css`（`garden-theme` 背景 gradient tokens、日光 beam / bloom / spotlight layers）
  - `core/script.js`（沿用 `initSkyGardenAmbience()` 掛載點，必要時為 `garden-ambient` 補日光層）
- 備註: 僅借鑑「fixed background canvas + 上層 light beams + content-anchored spotlight」的分層概念與色彩節奏；實作需維持 Ludwigia 現有 `Theme` / `Effects` / `pointer-events:none` 契約，不直接搬運原站結構或素材。當前 Ludwigia 僅在首頁啟用這層較強的日光 ambience，避免干擾搜尋結果與長文閱讀頁。

## 借鑑來源（部分採用）

- Clouds（texture/motion cue）: https://codepen.io/ajv/pen/XKOEeX
- 採用方式: 僅借鑑雲團層次與紋理流動節奏，未直接搬運原始結構與完整程式碼。
- 套用範圍:
  - `assets/css/site/shared.css`（`.sky-cloud` texture layers、`sky-cloud-texture-drift*`）
- 備註: 保持既有「背景層 + pointer-events:none + 主內容在上層」契約不變。

### Timeline / About Me 視覺參考

- Sources:
  - https://codepen.io/TriVector/pen/EPJqqd/
  - https://codepen.io/Devcrud/pen/XWboGgL
  - https://codepen.io/htmlcodex/pen/LYGjPgV
  - https://codepen.io/blackellis/pen/bGVoXBr
  - https://codepen.io/MarkBoots/pen/OJOqNyB
  - https://codepen.io/darcyvoutt/pen/ogPrpK/
  - https://codepen.io/ritz078/pen/LGRWjE/
  - https://codepen.io/krishnab/pen/OPwqbW/
  - https://codepen.io/xander1820/pen/pbJRba/
  - https://codepen.io/jcoulterdesign/pen/zdwajv
  - https://codepen.io/cjl750/pen/mXbMyo
- 套用範圍: `About Me` 區塊下未來的 `Timeline` 視覺探索，包含 `desktop horizontal / mobile vertical` 的雙模版型、`point event / period event` 的視覺語法，以及 ruler-like 軸線、刻度、年份/區間 block 的設計方向。
- 預計實作位置:
  - `index.html`（`About Me` 區塊內的 timeline 掛載位置）
  - `assets/css/site/shared.css`（timeline layout、desktop/mobile responsive、event states）
  - `assets/js/`（若後續需要 timeline interaction script）
- 備註: 目前僅作為外部視覺參考池與 design synthesis 來源，尚未採用單一範本，也不直接搬運完整 HTML/CSS/JS。後續若正式落地，優先採混合式收斂：
  - `desktop` 以 horizontal ruler / timeline 為主
  - `mobile` 收斂成 vertical single-column timeline
  - `point event` 與 `period event` 使用不同視覺語法，而不是硬共用同一種 marker
