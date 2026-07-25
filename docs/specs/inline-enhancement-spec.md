# Inline Enhancement Spec

本文件定義正文內「看起來仍屬於 paragraph flow，但帶有額外語意與互動」的 shared contract。

目前收斂的成員：

- `<information ...>...</information>`
- `<content-link ...>...</content-link>`

它不取代：

- `docs/specs/system-spec.md`：系統層責任邊界、cross-view downgrade 與總綱
- `docs/specs/parser-spec.md`：source authoring syntax 與 parse / render 規則

## 1. 目標

這類 inline enhancement 的目標是：

- 讓作者能在正文內加上補充語意，而不必把閱讀節奏打斷成獨立 block
- 讓讀者在需要時取得額外上下文，但不預設把每個 enhancement 都放大成強干擾 UI
- 讓內容在不同 surface 間可穩定退化，而不要求 Garden / Reading Mode / markdown export 完整理解所有 enhancement

## 2. Shared Contract

### 2.1 Paragraph Flow

- enhancement 必須維持 inline flow，不可破壞 paragraph 的正常換行與字距節奏
- enhancement 不應長成 button、chip 或獨立 block
- enhancement 的預設狀態應盡量維持與正文一致的字體、字重、字色

### 2.2 Visual Cue

- enhancement 應使用輕量 cue 提示「這裡有額外語意」
- cue 可以是 underline、dashed underline、微弱背景或其組合
- cue 的強度應低於一般 CTA / button / nav link

### 2.3 Shared Surface Tokens

`information` 與 `content-link` 應共用同一組 inline enhancement 視覺語彙，而不是各自長出平行樣式系統。至少應共享：

- underline thickness / offset
- hover background 的強度級別
- tooltip / preview card 的 surface、border、radius、shadow
- light / dark theme 下的對應 surface 規則

允許兩者存在局部差異：

- `information` 預設可使用 dashed underline
- `content-link` 預設可使用實線 underline
- `information` 偏短說明 tooltip
- `content-link` 偏 compact preview card

但這些差異應建立在 shared token pipeline 上，而不是兩套完全分離的實作。

## 3. Information Contract

`information` 的責任是詞彙 / 片語補充說明：

- 本體仍是正文的一部分
- hover / focus 時顯示短說明 tooltip
- tooltip 可在 pointer / focus 停留於本體或 tooltip 本體期間維持可見
- tooltip 不應膨脹成萬用 rich panel 或可塞複雜互動的浮層

## 4. Content-Link Contract

`content-link` 的責任是正文內的跨內容導讀：

- 本體仍是正文的一部分
- target resolution 應依 `CanonicalId`
- hover / focus 時可顯示 compact preview card

preview card 的資訊層級：

- 可包含 small cover image、title、tags、summary、content kind
- 它的資訊密度應接近 search 裡的小卡片
- 但尺寸應明顯小於真正的 search result card，不應把正文閱讀切成半個搜尋頁

## 5. Default Cover Contract

若 `content-link` preview card 需要 small cover image，應遵循 shared default cover contract：

- target 有 `Cover`：使用 target 自己的 cover
- target 無 `Cover`：退回 shared default cover
- shared default cover 應由內容類型決定最基本的 fallback 氣質

目前收斂的內容類型：

- `notes`
- `writing`
- `canvas`

這條 contract 應在至少以下 surface 維持一致：

- Search result card
- Section landing card
- `content-link` preview card

## 6. Desktop Interaction

在支援 hover 的裝置上：

- `information` 可用 hover / focus 顯示 tooltip
- `content-link` 可用 hover / focus 顯示 preview card
- 當 pointer 已移入 tooltip / preview card 本體時，浮層不應立刻消失

## 7. Touch / Coarse Pointer

在 touch 或 coarse-pointer 裝置上，不應把 hover preview 當成主要互動前提。

目前可接受的預設：

- `information` 若沒有穩定 tap interaction，可退回僅保留 inline cue
- `content-link` 若沒有穩定 tap-preview 設計，可退回直接導頁

原則：

- 寧可明確退回較簡單的互動
- 也不要做出半可用、會讓使用者分不清「預覽」與「跳轉」的假 hover

## 8. Downgrade Contract

在以下 surface，inline enhancement 不應被視為 core markdown：

- Copy Markdown
- Download Markdown
- Reading Mode
- Garden/Search surfaces

降級規則：

- `<information>`：退化成純文字 term / phrase
- `<content-link>`：退化成純文字 label / inner text

這些 surface 的責任是保證可讀核心內容，而不是重建完整 enhancement UI。

## 9. Accessibility

- enhancement 本體至少應支援 keyboard focus
- hover-only 資訊不應成為理解正文的唯一前提
- preview / tooltip 內容應在視覺上可讀，不依賴過低對比或過度透明
- 若浮層只是補充資訊，可標記為不干擾主要朗讀流程的輔助內容

## 10. Current Implementation Notes

目前 shared contract 對應的主要實作位置：

- `tools/create_content.py`
- `tools/content_contract.py`
- `core/search-core.js`
- `assets/js/search-page.js`
- `assets/js/section-landing.js`
- `assets/css/content-page/default/style.css`

若未來新增新的 inline enhancement 成員，也應先判斷它是否真的屬於這個 shared contract；若不是，應避免硬塞進同一層。
