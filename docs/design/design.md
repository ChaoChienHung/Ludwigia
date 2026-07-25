# Design

這份文件收斂 Ludwigia 的設計理由與重大決策脈絡（偏「為什麼」與「最後怎麼定」），不放操作教學與不可退化契約。

- 使用教學：`README.md`（repo root）
- 不可退化契約：`AGENTS.md`（repo root）
- 系統規格/架構：`docs/specs/system-spec.md`
- 這裡保留的是：設計理念、取捨理由、重大決策與後果

## 入口分層：Core vs Additional

我的目標是讓主站看起來乾淨、專業、可長期維護，但同時保留「實驗性入口」的成長空間：

- Core navigation：只保留少數穩定入口（例如 Home / Projects / Notes / Writing / Search / Settings）
- Additional surface：把實驗性、會持續增加、或風格較強烈的入口放在 FAB（避免 navbar 隨時間膨脹）

Garden 就是典型的 Additional surface：它是探索介面，不應反過來定義主站的結構。

## 小螢幕的 Additional 入口：單一角落、單一主入口

我不希望手機上的附加功能各自長一顆漂浮按鈕，再靠微調位置硬避開彼此。那種做法短期看起來像有解，長期只會讓使用者記很多顆小圓鈕各自代表什麼。

- 首頁 / section landing 的 misc 行為，與 note / writing 單篇頁的附加入口，本質上都屬於「附加入口」
- 首頁 / section landing 仍優先收斂到同一個右下角主入口，再用 action sheet / menu 分流
- 內容單篇頁的 `Outline` / `Metadata` 若屬於高頻閱讀控制，直接放進頂部 navbar 左右兩側會比再長一條工具列更乾淨
- 桌機仍可保留 hover zone / sidebar 這類較寬螢幕專屬 affordance；真正要避免的是手機上同時出現多顆互搶角落的 FAB

這樣比較好，因為：

- 使用者只要先理解「site-level 的附加功能從右下角進；內容頁的閱讀控制從頂部左右鍵進」
- metadata 不會再和 misc/FAB 搶同一個注意力層級
- 未來如果 note / writing 還有額外 page-level action，也能沿著同一個 page-level 入口心智模型擴充

## 手機導覽：獨立 IA，不是縮小版 desktop navbar

我現在更傾向把手機導覽視為一套獨立的資訊架構，而不是把 desktop navbar 縮小、塞成 hamburger 或 dropdown 後繼續使用。

- 頂部保留品牌 `Ludwig`，把它當成返回首頁的穩定中心點
- 內容單篇頁可在頂部左右兩側放 page-level sidebar button，讓閱讀控制停留在 thumb-friendly 的第一層
- 真正的一級功能收斂到底部導覽
- `Home` 不必強行佔一個 tab；更值得給高頻入口的是 `Portfolio`、`Search`、`More`
- `Portfolio` 與 `More` 不只是打開一個臨時 menu，而是進入各自的 hub page，讓第二層導覽有穩定落點

這樣比較好，因為：

- 手機上操作底部高頻入口比頂部 dropdown 穩定很多
- 首頁在 Ludwigia 裡不是高頻工具面板，不值得搶一個 tab
- `Search` 是高頻能力，應該保留一級入口；`Settings` / `Garden` / `Labs` 則更適合歸到 `More`

## 手機互動：Tap-first，不能假設 hover

我也不想在手機上延續「靠 hover 才自然」的互動。mobile 的基本前提應該是 tap-first：

- hover sidebar 要改成可點的 toolbar / button + drawer
- desktop dropdown 不應直接搬到手機；要依內容量改成 drawer / sheet / menu / inline expand
- 如果一個互動在手機上沒有明確 affordance，只能靠猜，那它就還沒完成 mobile 設計

## Settings：更像控制面板，不像獨立頁

我現在更傾向把 settings 做成一個隨時可打開的輕量介面，而不是獨立頁。

- 使用者改 language / theme / palette 時，通常不是在做一個「需要離開當前內容」的任務
- 特別是在 note / writing 閱讀途中，若還要先跳去 settings 再跳回來，體驗很容易斷掉

所以我偏向：

- settings 應該是 modal / popup / drawer 類型的控制面板
- 關閉後留在原頁，變更即時生效
- navbar 的 gear icon 直接開 modal；`pages/settings.html` 只保留給 fallback / direct-link，不再是主要心智模型
- 雖然 settings 裡有 sidebar tabs 與右側 pills 兩種控制外觀，但它們的顏色特效（selected / hover / focus）應統一由目前 palette 驅動，避免使用者切 palette 卻看到一半元件沒跟著變

## i18n 的 UX：先誠實，再方便

我不希望語言切換長成一個看似存在、實際上沒有內容對應的假 affordance。

- 基礎 page 多語言是合理的，因為那是站點入口與自我介紹
- 文章不該預設全部雙語，否則會直接拖慢寫作節奏
- 因此 UI 必須誠實表達「哪些地方真的可切語言、哪些地方沒有翻譯」

對使用者比較自然的體驗是：

- settings 管全站偏好語言
- 文章只有在有翻譯版本時，才顯示頁內語言切換
- 列表頁可以先用一個小標記告知「這篇有多語言版本」

對我來說，這背後其實是兩種不同的 UI 問題：

- 基礎 page 比較像產品介面（UI shell），適合用 runtime i18n 直接切字串
- 文章比較像內容資產，適合讓不同語言各自是一份內容頁，再用語言切換跳到對應版本

我偏好這種混合做法，因為：

- 它避免把整篇文章塞進前端字典
- 它保留內容頁的乾淨連結與 metadata 結構
- 它讓「切語言」在文章層看起來更像切到另一個內容版本，而不是整頁 UI 魔術

基礎 page 若使用 runtime i18n，還有一個 UX 底線：

- 不應先讓使用者看到英文，再在 1 個 frame 後跳回中文
- 因此語言偏好必須在 `<head>` 儘早恢復，再由 runtime i18n 補完整個 page bundle
- 如果需要暫時隱藏 body 才能避免明顯閃動，這個隱藏應只存在於 i18n pending 的極短時間，而不是常態布局技巧

## 多語言文章的可見提示

如果一篇 note / writing 有多語言版本，我希望使用者在點進去前就能知道，而不是進頁後才偶然發現。

- 最輕量的方式是在列表卡片上加一個小標記
- hover 後再顯示實際支援的語言種類
- 這樣可以保留列表的乾淨度，同時讓多語言成為「可被發現」的能力

我偏好這種做法，因為：

- 它不會要求每篇文章都展示完整語言切換 UI
- 它允許不同文章支援不同語言組合，不必硬綁成全站固定集合

現在我更傾向把這個提示做得再穩一點：

- 列表頁統一用地球 icon 表示「這篇支援多語言」
- 不再用 `bilingual` / `multilingual` 這種會跟語言數量耦合的文案
- 真正支援哪些語言，交給 hover popover 顯示

這樣比較好，因為：

- 讀者第一眼只需要知道「能不能切語言」，不需要先知道總共有幾種
- 我不必隨著語言數量改 badge 文案
- UI 在未來擴到三語、四語、五語時仍然穩定

## Tag 的語言不必統一，但概念必須統一

我現在更偏好把 tag 的責任拆成兩層：

- `concept_id` 是內部穩定識別
- `label` 是目前語系下給使用者看的文字

這樣比較自然，因為：

- 中文 UI 不需要硬顯示英文 tag
- 英文 UI 也不需要反過來顯示中文 tag
- 同一個概念仍可在 search filter / related tags / tag detail 裡被視為同一組內容

## 單篇頁的語言切換應該是 dropdown，不是平鋪連結

當文章只有兩種語言時，直接把 `中文 / English` 橫排出來還勉強可以接受；但一旦語言變多，這種做法很快就不 scale。

所以我更偏好：

- 用一個地球 icon + 目前語言的觸發器
- 點開後顯示 dropdown / popover
- 清單內用高亮 / checkmark 標示目前語言，而不是 underline

這種做法比較像一個真正可擴展的控制元件，而不是暫時性的兩語 special case。

## Draft 不應意外出現在公開入口

我希望草稿可以很容易被保留、被繼續寫、被本機預覽，但不希望它們因為「檔案已存在」就自動出現在公開入口。

- 作者工作流需要保留 drafting 狀態
- 讀者入口則應只看到準備好公開的內容

所以我比較偏好的體驗是：

- `drafting` 內容不出現在 search、section landing 與公開列表
- 作者仍可直接開啟檔案或本機預覽
- 等內容準備好，再把 status 切成 `published`

## ReviewKit 應該是容器，不是硬綁的固定組合

我比較偏好把 `reviewkit` 視為一個「把附加學習元件收在一起」的 parent container，而不是預設就硬等於 `Quick Quiz + Quiz Generator Prompt`。

- 如果裡面同時有 `qquiz` 與 `qprompt`，tabs 很合理
- 如果裡面還有 `<takeaways>`，更自然的做法是讓它和 `Quick Quiz` / `Quiz Generator Prompt` 一樣成為同層 pane，而不是再切成上下兩個半區
- 如果只有其中一個，就只顯示那一個，不要做出空 tab 或假結構
- `qprompt` 若被獨立放在正文後，也應該能直接存在，而不是只能等某個固定的 summary 區塊去接它

## 日期資訊應該是上下文，不是噪音

我希望內容頁的日期資訊能幫助讀者理解內容的新舊，但不該搶走正文焦點。

- 比較適合放在 Meta sidebar，和 reading time / tags 同層
- `Published` 幫讀者理解這篇內容大概是什麼時期的產物
- `LastModified` 幫讀者快速判斷內容是否近期有整理過
- sidebar 預設只露一個主日期 `Updated`，避免首屏堆兩個幾乎同層級的日期
- 若讀者想看完整脈絡，再由 `Updated` 展開 `Last Modified` + `Published`
- 如果作者沒提供 `Published`，寧可不顯示，也不要硬造一個不可靠的日期

## Garden 的設計理念

Garden 是內容層之上的探索介面：提供「可逛、可回憶、可漫遊」的視角，而不是替代內容本身的編排。

- Search（search page）偏精準查找
- Garden 偏探索與漫遊（從 tag/patch 的視角開始）
- `tag/index.html` 應是 tag detail 的穩定入口；它比掛在 `garden/` 下面更像一個獨立頁，也比較符合「tag detail 不等於 Garden patch」的心智模型

對我來說，Patch 比較像 Garden 內部的「探索視角」，不是整站所有 tag click 的預設落點。

- tag detail 需要一個穩定、可分享、`file://` / nested path 也不容易壞掉的入口
- 如果 Search 或 section landing 內的 tag 主要責任是 local filter，那就讓它繼續做 filter；但應補一個明確的 `Open tag page` / detail 入口，而不是把 detail route 藏成另一套隱性規則

我也希望 Search page 的結果列表與 Notes/Writing 的 section landing 保持相近的閱讀節奏：

- 搜尋結果不應長成過度裝飾的膠囊 chip 清單
- 更適合的形式是 medium-style 的列表卡：清楚 title、簡短 metadata、保留一小段可掃讀 preview
- 這樣 Search 是「精準查找」，但視覺密度仍與內容入口一致，不會像換了一個完全不同的產品
- 若某篇 writing 需要被優先看見，我偏好用 pinned / priority 這種輕量排序訊號，而不是另外手維護一份 featured list；前提仍是它先符合搜尋或 tag filter

對 Search page 的 sort，我也傾向把它理解成「同一批搜尋結果上的第二層控制」，而不是另一套平行搜尋系統：

- `Default` 可以是 UI 上的名字，但底層應明確代表 relevance / search engine ranking
- 使用者切到 `Published` / `Modified` / `Reading` 時，是在覆寫目前結果集合的排序，不是改變召回邏輯
- 這樣使用者心智才會穩定：先決定「找什麼」，再決定「怎麼排」
- 介面上也不需要一直把目前 sort 寫成長句；打開 menu 能辨識 selected option，trigger 在非 default 時做 highlight 就夠了

對正文裡的術語補充，我也偏好 inline explanation，而不是動不動就把閱讀節奏打斷成獨立 block。像 `<information context="...">term</information>` 或 `<information concept="concept.eda">EDA</information>` 這類語法，應該維持「看起來只是正文的一部分」，只有在使用者想知道更多時才用 hover/focus 顯示補充說明；而且當游標已經移到 tooltip 本體上時，說明不應突然消失，否則讀者反而更難讀完那句補充。

如果術語定義其實是跨文章重複使用的，我更偏好把 definition 收斂進 shared ontology，而不是每篇 HTML 都重複硬貼一次長文字。也就是說，source 仍由作者決定在哪裡標註術語，但內容頁輸出可以只保留 concept placeholder，再由共用 runtime 依語系補上 tooltip。這樣既保留作者對閱讀節奏的控制，也避免 definition 大量重複。

如果作者擔心漏標 `<information>`，比較理想的輔助方式也不是「自動把所有命中 ontology 的詞塞進文章」，而是提供候選詞掃描。像 `cli.py scan-information <source.md>` 這種工具，可以先告訴作者哪些詞已命中 ontology、哪些地方已經標過、哪些第一次出現還沒標，最後還是由作者自己決定要不要加，這樣比較不會破壞正文節奏。

跨文章導讀我也偏好語意化 cross-reference，而不是在正文裡手刻 HTML path。像 `<content-link canonical="k-means-clustering-around-centers">K-Means</content-link>` 這種寫法，作者只需要表達「我要連到哪篇內容」，真正的 `href` 則交給 build 階段依 `CanonicalId` 與語言去 resolve。這樣 source 不會被路徑命名綁死，也比較符合 source-driven content 的維護邏輯。

在視覺上，`content-link` 也不該像另外插進一顆按鈕或 chip。它應該盡量維持正文原本的文字節奏，只用較輕的 underline 提示這是一個可展開的 cross-reference；而 hover / focus 時再顯示 compact preview card，語氣與資訊密度接近 search 裡的小卡片，讓讀者能快速預覽 small cover image、title、tags、summary，再決定要不要跳走。這個 preview 應該明顯比真正 search result card 更小，不應把正文閱讀硬切成半個搜尋頁；而在 touch device 上，若沒有設計穩定的 tap-preview，寧可退回直接導頁，也不要做出半可用的假 hover。

對方法比較，我也偏好直接用表格，而不是把比較硬塞成巢狀清單。像 `K-Means vs. DBSCAN` 這類內容，本來就是在讓讀者快速掃欄對照；若 parser 已經支援標準 markdown table，閱讀節奏會比長串 nested list 自然很多。

對結尾的收束方式，我也更偏好把「作者自己的總結」留在正文段落裡，例如用 `## Summary` 收尾；若還需要額外整理一批 bullet points，再交給 `<takeaways>`。這樣段落總結與條列重點的語意不會混在一起，也比較符合「正文主線優先、extras 補充回收」的節奏。

對文章主題的收斂，我也越來越偏好「一篇文章專心回答一個主問題」。如果一篇稿同時在做：

- 一個技術家族的 overview
- 其中某個方法的完整機制拆解
- 該方法的 limitation / tuning / comparison

那通常代表它已經 overloaded 了。更自然的做法通常是：

- overview 頁只負責建立地圖：這個主題在解什麼問題、主要分支有哪些、差異軸是什麼
- 單一方法頁再各自承接：例如 `K-Means`、`DBSCAN`、`Hierarchical Clustering`、`HDBSCAN`

如果某篇明明定位成 overview，卻花大量篇幅停留在 `K-Means` 的直覺、step-by-step 流程或細部 limitation，我會把它視為 flow 開始偏移。那代表讀者原本想拿到的是一張方法地圖，最後卻被迫先讀完半篇 `K-Means` 教學。這不只會讓主線變鬆，也會讓 overview 很難 scale 到更多相關技術。

`TL;DR`、`MainFlow`、`Scope` 這類欄位對我來說也不是要變成讀者 UI，而更像作者寫作前的 scaffolding。現在我更偏好把它們放在 source 的 `<draft>...</draft>`，而不是混在 `<meta>`；因為它們不是公開 metadata，而是作者自己的 drafting rails。它們的價值在於讓我在還沒正式寫滿之前，就先檢查：

- 這篇真的在講少數幾件事嗎
- limitation / comparison 是不是還 stick to the main flow
- 哪些段落其實更適合挪到 follow-up page

如果文章前段真的要有一個可見 block，我現在也更偏好它長成 `TL;DR / Focus`，而不是再開一個 `Guiding Questions` 區塊。因為對我現在的寫作節奏來說，guiding questions 比較像每一段本來就會自然出現的導讀方式；前面那個 block 更應該負責的是把全文主題先釘住，而不是重複一遍分散在段落裡的問題。

## Typography 與 Responsiveness

我把可讀性當作第一優先：font size 不是絕對值，而是相對於裝置與觀看距離的比例。

- Typography 與 spacing 需要隨 breakpoint 調整
- Layout 要先定 slot 與容器，再讓 widget 對齊

共用 responsive layout（breakpoints/container/grid）規範見 `docs/specs/layout-spec.md`。

## Theme vs Palette（氛圍 vs Accent）

我把視覺偏好拆成兩層：

- Theme：背景/文字/對比與整體情緒（Dark / Light / Deep Sea / Galaxy / Sky / Garden）
- Palette：accent（連結、tag active、重點色）
  - 例：default / galaxy / garden / red / yellow / ash
-  - Deep Sea 的背景泡泡與魚群屬於 theme effect（氣氛向），不應干擾內容閱讀（魚群以 SVG 生成，可用 CSS 變數調整透明度/配色，並在 Reading Mode 停止）
-  - Sky / Garden 的雲層與自然氛圍也屬於 theme effect；核心內容容器要維持可讀、可點擊、層級清楚
-  - 這套主站 theme effect 的預設責任邊界只落在主站頁面與標準內容頁；像 `garden/index.html` 這類獨立 extension / prototype surface，不必被動繼承同一套 runtime

對 theme 擴充來說，我現在更偏好先把底層 variable pipeline 建好，而不是看到局部色差就立刻補一條 override。像 note 頁的 `callout`、`block`、`takeaways`，目前可以先用同一套 theme 顏色，但三者仍應各自有明確的 variables。這樣之後若要把其中一個元件做得更亮、或更沈穩，不需要回頭在整份 CSS 裡考古 scattered override。

所以 override 不是完全不能用，而是應該保持少量且能說清楚的例外；一旦出現 override 疊 override 才能修的情況，通常代表真正該整理的是底層 token、selector 分層或主元件責任邊界。即使那代表要做比較大範圍的 refactor，我也傾向先把底層邏輯拉直，避免每次 expand theme 都再長一層技術債。

這樣 Garden 或其他 extension surface 未來就算有自己的視覺語言，也不會把整站 token 綁死；反過來，主站 theme contract 也不會誤傷這些獨立子系統。

## 可讀性優先：Theme 效果必須可被關閉/限定

像 Galaxy 的流星/星空屬於「氣氛向」效果，但內容可讀性更重要：

- 視覺效果必須可關閉/限制（尊重使用者偏好）
- 必要時在內容卡片、toolbar、title block 增加遮罩/底色，避免動畫干擾閱讀
- Theme 動效應走同一個開關（`Effects`），而不是每個 theme 各長一個獨立控制
- 但進入 Reading Mode 時，主站共用 theme effect 應直接視為 hard-off；Reading Mode 的責任是降低干擾，不再優先尊重先前的動效設定

## Image Viewer（一致互動）

我不希望 `canvas` / `notes` / `writing` 的圖片放大各做一套。對讀者來說，圖片點了就應該有一致預期。

- 單張圖片放大是預設核心能力，先求輕量、穩定
- 若圖片外層本身是連結，預設先放大，避免誤觸跳頁打斷閱讀
- 真要跳轉時可用 modifier key，或顯式標註 `link-only`

## Notes Extras：把「附加」收斂成一個區塊

我希望內容頁永遠忠於原文，互動與輔助資訊只能是 optional enhancement：

- Summary / Key Takeaways / Quick Quiz / Quiz Generator Prompt 都屬於「附加」，可以不存在
- 附加區塊缺席時，不該讓版面出現空洞、或讓讀者覺得「少了什麼才不完整」
- Key Takeaways 是「讀完後的重點條列」，不一定是原文段落，因此更適合收斂在附加區塊，而不是混進正文
- 如果它們被收進同一個 `reviewkit`，更好的心智模型是把它視為一個 `Review Kit`，裡面不同 pane 對應不同複習方式，而不是把其中一種附加內容視為主體、其餘當下層附屬

## Reading Mode = 正文視圖

我希望 Reading Mode 做的事很單純：把雜訊拿掉，讓正文成為唯一主角。

- 它關心的是正文與必要 metadata，不關心附加互動
- 如果某段內容不靠 extras 仍然成立，它就應該在 Reading Mode 存活
- 如果某段內容只有在 `<qquiz>` / `<reviewkit>` / `<qprompt>` 這類 block 裡才存在，那它就不應被視為正文主體
- 這也是為什麼 Reading Mode 一旦站到 `.md` source 這層，應優先讀 core markdown，而不是完整理解所有自訂 block

## Standard Page First

我希望 `tools/create_content.py` 生成的頁面，首先是一個穩定、可讀、吃全站 theme 的標準內容頁，而不是萬用 page builder。

- style 可以擴，但 parser 不應為了 presentation 無限制膨脹
- 旅遊寫作、essay、一般 note 若需要不同排版，優先用不同 style 解，而不是加一堆 styling gadget
- 真正高度客製的頁面可以自定義；標準生成器不需要承擔所有視覺實驗

## Tags 的呈現策略（增長友善）

tags 會增長，所以我避免讓它常駐佔用版面：

- Search page 用 tag modal 做 multi-select filter
- Section landing（Notes/Writing/Canvas；UI 中文目前為「筆記 / 文章 / 視界」）用 icon 觸發 tag filter panel，維持閱讀入口的簡潔

## Question Bank 的方向 facet

我傾向讓題庫同時容納不同方向的題目，而不是把題型意圖拆成多份 bank：

- 同一篇 note 的題庫可以同時有 `concept_understanding` 與 `algorithm_recognition`
- 題目方向應作為 per-question metadata，而不是靠檔名、資料夾或另一份 UI 設定推導
- Labs 題庫頁可以用 `question_focus` 做 filter，但不應要求作者為了方向分類再維護第二份結構

## Cluster / Patch 隱喻

我偏向用「可控的隱喻」而不是一開始就上 force graph：

- tag = 一個小 garden（花叢/patch）
- note = 一朵花

card/patch 視圖更容易維持可讀性、互動與效能，也更容易逐步演進。

## Garden Markdown 呈現

Garden 既然承擔「漫遊式全文閱讀」的一部分，我不希望它維持一套偏脆弱的手寫 markdown parser。

- preview 可以是較輕量的 markdown subset
- 但全文閱讀視圖應盡量貼近標準 markdown 語意
- 特別是 list hierarchy、table 與 LaTeX，不應因為進到 Garden 就退化

## 重大決策脈絡

下面這些條目偏向「背景 → 選項 → 取捨 → 決定 → 後果」；和前面的設計理由放在一起，目的是避免 Why 與定案脫節。

### 1. Tag 允許空白，但維持精準比對

我選擇「寫起來/讀起來舒服」優先，因此 tag 允許空白（例如 `system design`）。

- 好處：更像在寫詞彙，不像在寫程式
- 成本：URL 會有 `%20`，而且必須維持寫法一致（因為 filter 是精準比對）

硬規則仍以 `AGENTS.md` 為準；這裡只留動機與取捨。

### 2. Search 是抽象，Garden 是 consumer

我不希望任何入口 UI 變成規格來源，所以依賴方向必須反過來：

- 演算法/語意（query/filter/href/related）要抽成可重用能力
- Garden/Search/Section landing 都只是 consumer

因此我們把搜尋核心抽成 SearchCore，避免跨頁規則漂移，也避免「所有東西都叫 garden」造成理解錯覺。

### 3. Assets / Subsystems：能共用的集中，其餘子系統自帶

我希望「共用」的東西越清楚越好，這樣未來要改規則或抽象，才不會變 big ball of mud。

- 共用（core contract）進共用區（例如 Theme/Palette、SearchCore）
- 標準內容頁的 compile-time template / renderer 進 `tools/content_styles/`，runtime CSS 進 `assets/css/content-page/`
- 像 Garden 這種子系統可以自帶資產與 build 產物，但不應反向影響 core

### 4. `core/` 的目標邊界

我希望未來把「可重用、跨入口依賴」的東西收斂到 `core/`，但它必須有清楚邊界：

- `core/` 放：跨入口共用、應該穩定的 contract
  - SearchCore（query/filter/href/related 的語意層）
  - 共用 schema/type（例如 index item 的最小語意欄位）
  - Theme/Palette 的 token 與偏好狀態
  - Theme effect 的最小行為約定
  - 跨頁共用的小工具（例如路徑解析、render helper、shared UI primitives）
- `core/` 不放：
  - 任何生成物（例如 `search/search-index.*`）
  - 任何子系統的 build output（例如 `garden/floral-assets/*`）
  - 只服務單一入口頁的 UI

我希望它是一個「可被多個入口依賴」的薄層，而不是把所有東西都塞進去的萬能資料夾。

### 5. `articles/blogs` 收斂成 `writing/canvas`

我決定把原本語意模糊的 `articles/` / `blogs/` 收斂成更直接的兩類：

- `writing/`：文字內容入口，裝完整文章、反思、review、ideas 與長文
- `canvas/`：視覺內容入口，裝照片、畫作、視覺實驗，以及「一張圖 + 可選 caption + tags + date」這類 item

我不再把 `blog` 當成主分類，因為它更像 genre 或時間流 view，不值得變成底層 section。

- 好處：`writing` 比 `article/blog` 更少分類焦慮，`canvas` 也明確對應不同媒介與瀏覽方式
- 好處：這個命名更符合「底層要簡單，表層再長出複雜 view」的原則
- 成本：需要一次性更新路徑、index section、landing page、生成腳本與文件

Canvas 目前的最小單位先定成：

- `item = 一張圖 + 可選 caption + tags + date`

之後若內容長出系列關係，再往上加：

- `gallery set`：一組圖片的集合
- 同一張圖可以被多個 gallery set 重用

### 6. Reading Mode / Garden：讀正文，不讀 extras

我後來把 `.md` 的心智模型想得更清楚了：Ludwigia 的 `.md` 其實是 extended markdown，但這不代表每個 view 都需要理解整份 extended markdown。

- `Full page`：可以讀完整 extended markdown，包含 `<meta>` 與各種自訂 block
- `Reading Mode` / `Garden`：只需要必要 metadata + core markdown

我這裡說的 `core markdown`，是指去掉自訂 block 後仍然存在的純 markdown 正文（heading / paragraph / list / quote / code 等）。

我選擇這個方向，是因為：

- 好處：把「真正有價值的內容」壓回正文本身，而不是散落在 extras
- 好處：Reading Mode 的定義更清楚，就是正文視圖 / 去雜訊模式
- 好處：Garden 若未來直接讀 `.md`，也不必學會整套自訂 tag parser
- 成本：作者不能把關鍵內容只寫在 `<qquiz>` / `<reviewkit>` / `<qprompt>` 等 extras 裡，否則它不會出現在正文視圖

我仍然保留一個例外：

- `<meta>` 仍有價值，但由另一層 metadata parser 處理；markdown extractor 本身不必順便理解 `<meta>`

所以真正的規則不是「忽略所有自訂 tag」，而是：

- 讀必要 metadata
- 讀 core markdown
- 其餘 extras 一律視為可忽略附加層

### 7. i18n：基礎 page 多語言，文章預設單語

我不想讓多語言策略反過來壓垮寫作工作流，所以我不採「所有內容預設雙語」。

- 基礎 page 值得做多語言，因為它們是站點入口、面向外部讀者、而且更新頻率相對低
- `notes/` / `writing/` 預設維持單語，只有少數核心文章才 opt-in 提供多語言版本
- 不強制每篇文章都翻成固定幾種語言；是否翻譯、翻成哪些語言，由文章本身決定

我選這個方向，是因為：

- 好處：保留對外可讀性與站點基本國際化能力
- 好處：不會把每次寫新文章都變成翻譯與同步工程
- 好處：讓多語言成為加分項，而不是內容產出的門檻
- 成本：站點會處於「基礎 page 多語言、文章部分多語言」的混合狀態，需要清楚的 UI 提示避免使用者誤會

### 8. Timeline：人生時間線，不只是履歷時間線

我希望未來的 `Timeline`，不只是把學歷與工作經歷照年份列出來，而是用時間順序解釋「現在的我怎麼長出來」。

- `About Me` 偏現在的自我介紹與整體人物感
- `Timeline` 偏時間序列裡的經歷、轉折、環境變化與長期影響，並且應作為首頁上的獨立 section，而不是只當 `About Me` 的附屬區塊
- 因此國小 / 國中這類早期經歷，若它們真的能解釋今天的性格、學習方式或世界觀，就值得放進 timeline，而不該因為不像履歷而被排除

我現在也更確定，timeline 資料不該再直接寫死在前端 JS。原因不是「這樣比較工程化」而已，而是 authoring 體驗會差很多：每次想補一個節點，都得先進 JS 理解 runtime 結構，這會讓內容維護和 UI 邏輯綁死。

所以我更偏好的方向是：

- source of truth 用獨立 timeline data file（例如 `data/Timeline/timeline.json`）
- runtime 只負責 parse / normalize / projection / render
- period event 的 `start / end` 差異由資料欄位表達，不再假設一定共用同一份 description
- 若某段 phase 還在持續，作者應可直接寫 `end: "present"`，而不是為了顯示 ongoing 狀態反覆手改今天日期

但這也代表 Timeline 不能把所有事件一次攤開。真正困難的不是「畫一條時間線」，而是先定義不同 scale 下，哪些事件值得被看見、又要看到多細。

我目前選擇的方向是：

- 第一版不做真正的自由縮放（full zoom）
- 先收斂成 `Macro / Meso / Micro` 這種固定資訊尺度
- 使用者在固定 scale 下沿 timeline 左右移動，而不是先把人生硬切成固定年齡區間

我這樣選，是因為：

- 好處：對手機更友善，不必承擔地圖式縮放的操作成本
- 好處：不需要一開始就替人生定過於僵硬的分水嶺
- 好處：可以把重點放在「不同 scale 該看到哪些事件」而不是執著於視覺縮放本身
- 好處：scale contract 可以直接寫在 data 上，作者心智比 view 層硬編碼的過濾規則清楚很多
- 成本：必須先定一套更清楚的 scale inheritance contract，否則 scale 只會變成視覺切換，而不是資訊層級切換

我目前喜歡的規則是：

- `macro` 事件會出現在 `Macro / Meso / Micro`
- `meso` 事件會出現在 `Meso / Micro`
- `micro` 事件只出現在 `Micro`

另外，ongoing phase 的尾端我也不想讓它們各自長成一排重複的 `Present / 至今`。比較乾淨的做法是：source data 還是各自保留自己的 `period`，runtime 先照原本規則投影成 `period-end`，但在 render 時如果發現有多個 ongoing phase，就把這些尾端收斂成 timeline 最後的一個 `Present / 至今` cluster。這樣既不會破壞時間軸的時間感，也能把「現在同時正在進行哪些事」更清楚地聚在一起。

至於 `Education / Internship / Work` 這種分類，我後來反而不想讓它接管顏色。timeline 現在會跟著 palette 變化，這種乾淨感其實很好；如果再為 category 疊一套固定色彩，兩套語意很容易打架。比較合理的做法是把 category 降成輕量 facet：只在 event meta 右上角放一個小 badge，讓類型可讀，但不破壞整體 palette-driven 的視覺一致性。

Copilot 也是類似的取捨：我不想把功能直接砍掉，但它常駐時的確會讓首頁和閱讀頁顯得更擠。比較好的做法不是「全站強制存在」或「完全移除」，而是讓它變成 settings 裡可控的偏好，先收斂成 `Off / Home only / All pages`。這樣功能還在，但視覺密度的決定權回到使用者手上。

### 9. 語言切換：全站偏好與單篇內容分開

我後來也更確定，navbar 這種東西其實不該繼續藏在 `tools/content_styles/_shared/`。那裡比較像內容生成器自己的 shared partial 區，而 navbar 的責任其實是 page-level site chrome。比較乾淨的分法應該是：`pages/_shared/` 負責全站 shell 的單一來源，例如 navbar；`tools/content_styles/_shared/` 則留給內容頁生成流程自己的骨架與 partial。這樣一來，內容頁如果需要 navbar，也只是「在生成時讀 site-level shared source」，而不是自己再平行維護一份 navbar 模板。

我不希望使用者切了一個語言，卻發現眼前頁面根本沒有對應內容，所以語言切換不應該是一個「全站都長一樣的假 affordance」。

- settings 內的 language 是全站偏好：影響基礎 page
- 單篇文章若有翻譯版本，才在文章內顯示頁內語言切換入口
- 沒有翻譯版本的文章，不應顯示可切換語言的控件

我選這個分工，是因為：

- 好處：站點級偏好與內容可用性不再混在一起
- 好處：讀文章時可就地切換，不必先離開內容去 settings 頁
- 成本：需要在 metadata / index / UI 層都明確表示「這篇支援哪些語言」

### 10. 多語言搜尋：先以語言分流，再談跨語言混排

目前搜尋核心偏向關鍵字相關度（TF‑IDF + token matching）。如果未來直接把不同語言版本混在同一個 ranking 裡，會很容易出現語意失衡。

所以我傾向先採這個方向：

- 搜尋與 recommendation 優先同語言
- 同語言結果不足時，再考慮跨語言補充或顯示其它語言版本
- 不急著一開始就做「所有語言混排」的單一 ranking

這個決策的好處是先控制複雜度，避免搜尋品質因為 i18n 一次變得不可預期；成本則是搜尋策略需要帶有 language awareness，而不能只看原始 token。

### 11. Settings：做成 modal，不做獨立頁

我現在更傾向把 settings 視為一個「隨時打開的小控制面板」，而不是一個必須跳轉過去的完整頁面。

- 讀文章途中若要改 language / theme / palette，不應打斷閱讀 flow
- 關掉 settings 後應該留在原頁，而不是讓使用者再自己找回剛剛看的內容

我選 modal / popup / drawer 類型的解法，是因為：

- 好處：更符合一般網站的偏好設定心智模型
- 好處：讓 theme / palette / language 這些偏好變成「隨手可調整」而不是「切頁任務」
- 成本：需要處理任何頁面都可喚起、focus / escape / overlay 等互動細節

### 12. Content Status：用 `drafting` / `published` 分開草稿與公開內容

我希望草稿可以很容易被保留、被繼續寫、被本機預覽，但不希望它們因為「檔案已存在」就自動出現在公開入口。

- 作者工作流需要保留 drafting 狀態
- 讀者入口則應只看到準備好公開的內容

所以我比較偏好的體驗是：

- `drafting` 內容不出現在 search、section landing 與公開列表
- 作者仍可直接開啟檔案或本機預覽
- 等內容準備好，再把 status 切成 `published`
