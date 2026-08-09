# DevNotes

這份文件用第一視角記錄我在做 Ludwigia 時的想法：設計動機、取捨、以及我希望這個系統長期演進成什麼樣子。

它不是使用手冊，也不是不可退化契約。

## Docs（文件分工）

- `AGENTS.md`：不可退化契約（non-negotiables；repo root）
- `README.md`：使用入口（怎麼跑站、怎麼新增/修改內容；repo root）
- `TODO.md`：任務追蹤（只留可驗收的待辦；完成後移除避免噪音；repo root）
- `docs/README.md`：文檔索引（docs 內所有文件的功能與路徑）
- `docs/specs/system-spec.md`：系統設計與可驗證約定（schema / data flow / guardrails）
- `docs/design/design.md`：設計理由、UI/UX 取捨與重大決策脈絡
- `docs/author/dev-notes.md`：心得、雜談與演進方向（偏「我在想什麼」）
- `docs/specs/layout-spec.md`：共用 responsive layout baseline（breakpoints/container/grid）
- `docs/rules/checklist.md`：feature 完成後的交付/檢查清單
- `docs/rules/guardrails.md`：把不可退化精神轉成可勾選的守門清單

原則：

- 任何「必須永遠成立」的規則只寫在 `AGENTS.md`
- 其餘文件以引用與對齊為主，避免同一件事寫成多份規格

## 我想把它做成什麼（高層視角）

我把 Ludwigia 想成三層：

- 內容層：`notes/` / `writing/` / `canvas/` 是內容本體（可攜帶、可長期保存）
- 索引層：`search/` 只負責把內容轉成一份全站索引（讓檢索很便宜）
- 入口層：Search page / Section landing / Garden 是不同入口視角，但依賴同一份索引與同一套搜尋語意

核心原則是：不做兩份內容。卡片/列表/預覽/全文，都只是同一份內容的不同呈現方式。

最近另一個很實際的教訓是：GitHub Pages 上「看起來像 regression」的問題，有時其實只是快取。像 section landing、tag page、search page 或單篇頁 recommendation，如果 runtime 先吃到舊的 `search-index.js`，畫面就會像功能沒上線，甚至像某幾篇文章突然神隱。這類入口之後應優先抓 `search-index.json`（`no-store`）再退回 JS 版本；驗證部署時也要先養成 hard refresh 的習慣，不然很容易把快取問題誤認成資料流或推薦邏輯 bug。

## 我在意的目標

- 長期累積：這是一個可以一直長大的知識庫，而不是一次性的 demo
- 檢索很便宜：不用後端、不用 DB、工具鏈越小越好
- 單一真相來源：改一篇內容不應該需要同步維護多個地方
- UI 可擴展：tags 與內容量長大時，入口仍然維持低噪音與可讀性

## 我目前對 i18n 的直覺

我現在越來越確定，多語言不能用「理想上全部都支援」的方式想，因為那會直接把內容系統拖進維護泥沼。

- 基礎 page 做多語言，值得
- 文章預設不多語言，也合理
- 少數核心文章有翻譯版本，才把它當加分能力做出來

真正麻煩的不是翻譯速度，而是：

- 後續同步
- 版面與 metadata 對齊
- 搜尋與 recommendation 的語意穩定

所以我現在更在意的是：不要讓 i18n 反過來壓垮寫作節奏。

我現在也更確定，基礎 page 跟文章不需要用同一種技術路線處理：

- 基礎 page 比較像站點 UI，本質上是一些固定文案與導覽結構
- 文章比較像內容資產，本體是正文、metadata、索引與連結關係

所以我比較喜歡這種混合策略：

- 基礎 page 用 runtime i18n，直接跟著全站語言偏好切字串
- 文章若有翻譯版本，就讓不同語言各自是一份 HTML，再用 `CanonicalId` 串起來

最近我也更確定，tag 不該再把「英文顯示字串」當唯一真相。

- 同一概念的 tag 可以在不同語系下顯示成不同 label
- 但內部還是要有穩定的 `concept_id`
- 這樣 search / tag detail / related tags 才不會因為 `Machine Learning` / `機器學習` 分裂成兩套規則

這樣做很實際，因為我不想連首頁/設定頁都維護兩三份 HTML；但我也不想把整篇文章的翻譯系統塞進同一份前端 DOM 裡。

不過 runtime i18n 一旦真的上線，很快就會遇到一個很現實的 UX 問題：如果頁面先畫出英文，再切回中文，整體質感會立刻掉下來。

所以我現在也更確定，base pages 需要一層很薄的 preload：

- 在 `<head>` 先恢復語言偏好
- 必要時短暫標記 `i18n-pending`
- 等 runtime i18n 套完字串再解除

同樣的心態也適用在 settings 上：它比較像全站控制面板，而不是一個值得專門切去的完整頁面；gear icon 直接開 modal，整個 flow 自然很多。

後來我又踩到一個很典型的 settings 樣式坑：`theme`、`palette`、`Effects`、sidebar active 看起來都只是「一個被選中的 button」，但要先分清楚「被選中特效」和「選項預覽色」是兩件不同的事。最後收斂成更簡單的規則：所有 selected / hover 特效都跟著目前 accent；`theme` / `palette` 自身顏色只放在 preview dot 做識別，不直接接管 selected 外框/背景。這樣既符合「Theme 管大方向、Palette 管細節」的心智模型，也能避免 selector 互蓋。

日期 metadata 這件事，我最後也偏向一個很實際的折衷：

- `Published` 交給作者決定，因為它比較接近內容語意
- `LastModified` 如果作者沒填，就退回 source 檔案的 last modified date
- sidebar 預設只顯示 `Updated`，讓首屏先回答「這篇最近有沒有更新」
- 若真的要看完整時間脈絡，再點開 `Updated` 看 `Last Modified` + `Published`

我不想碰 file created/birthtime，因為那東西一跨平台、跨同步工具、跨搬檔流程就很容易失真。

多語言檔名 suffix 也是同樣的心態：我越來越希望所有內容頁最後都長成 `-zh-tw` / `-en` 這種顯式命名，哪怕它目前只有單語。這樣之後站點變複雜時，就不用再回頭補一輪命名遷移；如果真的決定做 repo-wide 重整，我反而寧可一次完整 refactor，把站內引用與索引一起改乾淨，不再拖著舊無 suffix URL。

最近我對寫作 workflow 的想法也更明確了：前面的結構整理、raw info 分類、Agent 補第一版、再把內容映回 outline 這些步驟，其實都可以被大幅簡化或半自動化。真正不能省的是最後那輪 full proofread。因為那一步不是在「補字」，而是在確認整篇文章的意圖、語氣、邏輯和判斷都還是我真正要的。

另一個我越來越偏好的方向，是把某些「入口層想突出某篇內容」的需求壓成輕量 metadata，而不是長出新的 curated 清單。例如 pinned writing 這種需求，如果能用 `Pinned` / `Priority` 這類 source metadata 直接表達，search 與 writing landing 就只是在既有結果裡做排序 boost，整體結構會乾淨很多。

手機上的附加入口也是同一個道理。我後來越來越確定，`misc/FAB` 跟 note / writing 的 metadata 問號如果各自獨立漂浮，遲早會開始搶角落、搶注意力，最後變成只能靠一堆 offset 微調硬撐。比較乾淨的做法其實是先承認它們都屬於「附加入口」，但也要承認內容單篇頁有一部分其實不是 site-level additional，而是高頻的閱讀控制。對首頁 / section landing 來說，把附加功能收斂到同一個右下角主入口仍然最穩；但對 note / writing 單篇頁來說，`Outline` / `Metadata` 若真的很常用，直接進到頂部 navbar 左右兩側，反而比在標題下再長一條 toolbar 更乾淨。

最近我也更確定了一件事：手機導覽不能再被當成 desktop navbar 的縮小版。Ludwigia 的首頁在手機上並不是那種「高頻功能首頁」，所以我不再覺得它值得硬佔一個底部 tab。比較合理的分法反而是：上方保留 `Ludwig` 當品牌返回點，真正高頻的一級入口收斂到底部 `Portfolio / Search / More`；如果是在 note / writing 這種內容單篇頁，再把頁內 sidebar action 放到頂部左右兩側即可。這樣手機的資訊架構會比「上面 dropdown + 下面再補幾個入口」乾淨很多，也更符合 thumb-friendly 的使用方式。

同樣地，我也不想再假設 mobile 有 hover。凡是現在靠 hover 才自然的 sidebar / reveal interaction，到了手機都應該先問一句：使用者到底要點哪裡？如果答案不夠明確，那就代表這個互動還停留在 desktop 心智裡。對我來說，更穩的做法是把閱讀控制顯性化成 navbar button / toolbar，再用 drawer 承接內容；dropdown 也不該一刀切照搬，而是依內容量分流成 sheet、menu 或 inline expand。

最近在整理 tag 入口時，我也重新確認了一件小事：`garden/index.html#patch/...` 很適合當 Garden 內部的探索視角，但它不適合變成全站所有 tag click 的預設落點。真正穩定的 tag detail route 還是應該落在 `tag/index.html?tag=...` 這種直白、可分享、在 nested path / `file://` 也比較不脆弱的網址；Patch 則保留成從 tag detail 再往前走一步的第二視角。

我也愈來愈喜歡把某些補充說明做成 inline explanation，而不是每次都開一個 block。很多時候作者只是想幫某個術語或 phrase 補一句話，這種需求如果要靠 `<block>` 或括號硬塞在正文裡都很醜。像 `<information context="...">term</information>` 或 `<information concept="concept.eda">EDA</information>` 這種小語法就比較剛好：正文節奏不被打斷，但讀者又能在需要時多看一眼。這種 tooltip 也最好是可真正讀完的，所以游標若已經移到 tooltip 本體上，說明應該先維持可見，而不是立刻閃掉。

如果某些定義本來就會在很多篇文章裡重複出現，那我更想把它們收斂成 ontology，而不是每篇 HTML 都硬貼同一段說明。比較乾淨的方式是：source 還是顯式標註哪個詞需要補充，但輸出的 HTML 只放 concept placeholder；真正的 definition 由 shared ontology runtime 去 resolve。這樣作者不用反覆 copy/paste，HTML 也不會一直膨脹。

不過，我也不想把這件事走成「只要命中 ontology 的詞就自動插 `<information>`」。比較合理的是先有一個候選詞掃描：像 `python3 cli.py scan-information <source.md>` 這樣，先告訴我哪些詞命中 ontology、哪些已經標過、哪些第一次出現還沒標，最後再由我自己決定要不要加。這樣既不會破壞寫作節奏，也比較不容易漏掉值得補充的術語。

最近另一個也變得很明確的需求，是正文裡的跨文章導讀不要再手刻 html path。對我來說，比較乾淨的寫法會是像 `<content-link canonical="k-means-clustering-around-centers">K-Means</content-link>` 這樣：source 只表達「我要連到哪篇內容」，真正的 `href` 由 build 階段依 `CanonicalId` 跟語言去 resolve。這樣 rename slug、調整 output path，甚至補多語版本時，source 都不需要跟著大範圍回改。

後來我也覺得，`information` 跟 `content-link` 不應該各長一套平行樣式與互動。它們本質上都屬於正文內的 inline enhancement，所以更合理的做法是收斂成 shared contract：共用 underline / hover 背景 / surface / shadow / touch fallback 的思路，然後再允許各自保留少量語意差異。連 default cover fallback 也一樣，應該先在 contract 上講清楚，再讓 search、section landing、content-link preview 共同遵守。

另一個很實際的需求是 markdown table。像 `K-Means vs. DBSCAN` 這種比較，如果只能用 nested list 寫，資訊其實是能懂，但不夠一眼看完。這類內容本來就屬於 core markdown，不應逼作者繞去 raw HTML 或自訂 block，否則 parser 邊界反而變得更奇怪。

我目前很明確的一個寫作偏好是：先直覺、再抽象、再正式定義。尤其在知識型文章裡，我不喜歡一上來就丟術語或數學目標；我比較偏好先用一個生活場景或具體例子把讀者帶進問題，再把問題抽象成「我們到底在定義什麼」，最後才收束到正式定義、metric、公式或演算法假設。之後如果要幫我潤文章、拆結構或代寫，這個節奏應該優先被保留。

Timeline 這件事最近也更明確了：我不想再每次補事件都去改前端 JS。比較乾淨的方式應該是把 timeline 當成一個 page-scoped 的 source-driven data surface，像 `data/Timeline/timeline.json` 這樣，作者只維護 event data；runtime 再去做 normalize、`period -> start/end` projection、排序與 render。這樣 timeline 的內容維護才比較像寫內容，而不是每次都得碰 UI 程式。連 ongoing phase 也應該只要寫 `end: "present"`，不需要因為「今天又變成新的一天」而回頭手改結束日。

但 ongoing phase 一多，我也不想讓 timeline 尾端長出一排重複的 `Present / 至今`。比較乾淨的做法是：source data 仍維持逐筆 `period`，runtime 照舊投影成多個 `period-end`，只是 render 時如果看到多個 ongoing 終點，就把它們收斂成最後一個 `Present / 至今` cluster；點進去再展開目前並行中的幾段經歷。這樣既不需要作者手做 cluster，也不會破壞 timeline 的時間感。

另一個後來想通的點是 category 不該再接管顏色。timeline event 現在會跟著 palette 走，這種乾淨感其實很好；如果再為 `Education / Internship / Work` 疊一套固定配色，整體就很容易變得髒。比較順的做法是只把 category 當成輕量 facet：資料層放一個 `category`，UI 在 event meta 右上角補一個小 badge；這樣類別可讀，但不會搶走 palette 本來該負責的氣氛。

Copilot 那條線最近也很像是在解同一題：功能本身我其實不想拿掉，但它常駐在每一頁時，畫面確實會開始有點擠。與其在 layout 上一直硬躲，不如直接把它收斂成 settings 偏好，讓使用者決定是 `Off`、`Home only` 還是 `All pages`。這樣網站主視覺可以維持乾淨，Copilot 也不用整個消失。

我也更偏好把 timeline 的資訊層級明確寫成 data contract，而不是讓 view 層自己猜。也就是：`macro` 事件天然會出現在 `Macro / Meso / Micro`，`meso` 會進 `Meso / Micro`，`micro` 則只留在 `Micro`。這比過去那種比較模糊的 `magnitude` 心智更適合 authoring，因為作者在寫資料時就能直接知道一個事件會在哪些尺度被看到。

另外，我現在也希望把內容頁的責任邊界講清楚：Garden 就留給 Garden 自己的入口與資產；標準內容頁的 compile-time template / renderer 放 `tools/content_styles/`，真正給瀏覽器吃的內容頁 CSS 則放 `assets/css/content-page/`。這樣未來我要改 note / writing / canvas 的 render shell，就不會再誤進 `garden/` 裡找東西。

navbar 這件事最近也想清楚了：`tools/content_styles/_shared/` 不該再承擔全站 navbar 的單一來源。它比較像內容生成器自己的 shared 區，而 navbar 本質上屬於 page-level shell。比較乾淨的方式是把 SSOT 升格到 `pages/_shared/navbar.html`，讓內容頁在生成階段去讀它；這樣改 `Timeline`、改 `Home` dropdown、改 site-level 入口時，就不會再出現首頁有改到、其它頁還停在舊版本的 drift。

我現在也越來越確定，正式寫文章前最好先把 `main flow` 訂出來。也就是先回答：這篇文章要用哪一條理解路徑把讀者帶到最後的結論？有了這條主 flow，之後在審視每一段時就能更明確地判斷自己是不是 off the flow；很多看起來「資訊有價值」但其實打斷節奏的內容，也會更容易被辨認出來。

最近我又更明確了一點：光有 `main flow` 還不夠，最好連 `TL;DR`、`Scope`、`OutOfScope` 都先寫出來。這樣在文章還沒長大之前，就能先知道它到底是在做 overview、single-method deep dive，還是 comparison。對我來說，這幾個欄位更像作者自己的 drafting rails，而不是給讀者看的正式 UI；也因此它們更適合放在 source 的 `<draft>...</draft>`，不要混進 `<meta>`。

像 clustering 那篇就是一個很典型的提醒：如果一篇文章一邊在講「clustering 這個家族在解什麼問題」、一邊又完整展開 `K-Means` 和 `DBSCAN`，再一路寫到各自 limitation，後半段的 flow 很容易開始鬆掉。更自然的切法通常是把 overview 與單一方法頁解耦：overview 留在地圖層，`K-Means` / `DBSCAN` / `Hierarchical Clustering` / `AGNES` / `DIANA` / `HDBSCAN` 這些再各自承接出去。這樣 limitation 也比較不會像突然插進來的附錄，而是回到各方法自己的主線裡。

我現在也更明確覺得：overview 頁如果把太多篇幅停在某一個代表方法的直覺上，其實很容易失焦。像 `clustering overview` 若一路講到 `K-Means` 的 intuition 幾乎吃掉半篇，表面上看起來還在講 clustering，實際上主 flow 已經悄悄轉成 `K-Means` 導讀了。這對之後想再把更多 clustering 技術放進來也不利，因為整篇會很快失去 scale。

另一個對我來說也逐漸明確的偏好是：不要再把文章前段硬做成一個 `Guiding Questions` 特殊區塊。因為我本來就很常在每一段的開頭用問題、直覺或 tension 帶讀者進去，所以如果前面再放一個同類型 block，常常只會重複。前段那個 block 若真的要存在，我更希望它是 `TL;DR` 或 `Focus`，用途是先釘住「這篇最重要的主題是什麼」，而不是把所有 guiding questions 先集中列一遍。

另一個我目前很喜歡的語意區分是：`block` 比較像摘要卡，適合放 quick insight、quick notes、核心小結；`callout` 則更像「先停一下，補一個很重要的理解方式」，適合放直覺、比喻、偏作者導讀式的補充。之後如果要幫我選用哪個元件，應優先按照這個語意來判斷，而不是只看外觀。

我也很在意正文主線的完整性。對我來說，`block` 跟 `callout` 本質上都是補充說明或提醒，它們比較像從主文章 flow 暫時分出去的一個 branch，而不是文章真正的主幹。所以正文本身還是要能獨立成立，必須有自己的敘事與推理流；大部分真正重要的內容應該盡量 stick to the main flow，而不是把關鍵論證都丟進側邊元件裡。

更具體一點說，之後如果我要判斷某一段內容該不該留在正文，還是改寫成 `block` / `callout`，優先判準應該是它與文章主 flow 是否相容。若這段本來就推進主線理解、推理或轉場，那就應該留在正文；若它有價值，但會打斷主線節奏、比較像旁白、提醒、直覺補充或額外說明，才考慮抽成 `block` 或 `callout`。

若只是想先用一個更快的 heuristic，我目前也接受這樣的判斷：疑問句導向的補充，通常更適合用 `callout`；重點整理、摘要、結論式的小卡，通常更適合用 `block`。不過這終究只是快捷規則，不是最高原則；真正要不要抽出去，還是要回到它跟主 flow 是否相容來判斷。

另一個最近變得更明確的工程偏好，是 theme 相關的視覺不要再靠 scattered override 慢慢補。像 note 頁的 `callout` / `block` / `takeaways`，就算暫時先用同一套顏色，也應該先把各自的 theme variables 立起來。這樣未來如果只想微調 `takeaways` 的 icon 或 `callout` 的陰影，不需要再回頭猜它是不是剛好吃到別人的 fallback。

我現在也更傾向把「override 疊 override 才修得動」視為一種技術債訊號。通常那代表 selector 分層、共用 token 或元件責任已經歪掉了。碰到這種情況，我寧可回去修底層邏輯，甚至接受比較大範圍的 refactor，也不想讓 repo 因為每次 expand theme 都多一層補丁而慢慢失控。

另一個我最近更明確的偏好，是把條列式的 bullet takeaways 跟正文總結拆開。若只是想把讀完後的重點壓成幾條 bullet，我會傾向用 `<takeaways>`；但文章本身的收尾，我還是比較喜歡用 `## Summary` 接一小段段落式總結，因為那比較像真正的收束，而不是單純列點。

estimated reading time 這件事我也開始覺得不能太天真。一般網頁文章的閱讀速度，跟技術筆記、方法比較、數學公式、dense explanation 的實際速度其實差很多。如果 estimator 太樂觀，就會讓我誤以為一篇還在合理篇幅內，結果實際讀感早就開始過重。對我來說，它比較適合當「大致篇幅提醒」而不是 hard truth；真正感覺文章 overloaded 時，應該優先拆篇，而不是拿 estimator 當藉口撐著不拆。

`reviewkit` 這件事也有點像。我不再想把它理解成「固定長一樣的一坨 tabs」，而更想把它當成一個容器：裡面可以有 quiz、可以有 prompt、也可以只有其中一個。這樣 parser 與 UI 的耦合會小很多，作者寫 source 時也比較符合語意。

題庫也是類似的感覺。我不想因為有「概念理解題」與「演算法辨識題」兩種方向，就把它們拆成兩份 bank 或兩套檔名規則。比較乾淨的做法，是讓 `questions.<lang>.json` 的每一題自己帶 `question_focus`，這樣同一篇 note 可以自然混放不同方向的題目，前端若要做 filter 也只是讀既有 metadata，而不是額外再維護一層設定。

## Search 一旦碰到多語言，就不能再假設 token 完全中立

我原本把搜尋想成「同一份內容語料上的 ranking 問題」，但多語言一進來，事情就開始變得沒那麼單純。

- 中文文章裡會混英文術語
- 同一篇內容的不同語言版本會共享一些關鍵 token
- 如果還是直接用單一 ranking 混排，很容易出現重複取重

像 `TF-IDF` 這種詞就是典型例子：

- 它在英文文章裡會出現
- 在中文文章裡也很可能直接用英文縮寫
- 如果搜尋層不先有 language awareness，排名很容易失衡

所以我目前的直覺是：

- 先把搜尋與 recommendation 做成同語言優先
- 不急著一開始就做漂亮但複雜的跨語言混排

## 我也想把「正在長出來的內容」跟「準備公開的內容」分開

我很常在 repo 裡先放草稿或半成品，但那不代表我想讓它立刻出現在公開入口。

- 有些內容只是先記下來，之後再回來補
- 有些內容還在找角度、找結構，還不適合被當成成品展示

所以我其實很需要一個很輕量的狀態欄位：

- `drafting`：讓內容先存在、先被照顧、先能本機預覽
- `published`：等真的準備好，再讓它進搜尋、進列表、進入口

這件事對我來說，不只是技術欄位；它比較像是在保護寫作節奏。

## Task Framing

我想把 task 的「重要性」跟「協作成本」拆開看，避免兩件事被混在一起。

- `P0..P3` 回答的是：這件事有多重要、影響多大
- `Agent-friendly` 回答的是：這件事能不能在少量確認下委派出去
- `Author-driven` 回答的是：這件事是不是強依賴作者本人的判斷、品味、方向或寫作意圖
- 所以一個 task 可以同時是 `P0`，但不是 `Agent-friendly`
- 我現在會用一個更快的判斷：
  - 如果 task 的核心是「把東西做出來」，偏 `Agent-friendly`
  - 如果 task 的核心是「決定要做成什麼樣子 / 想表達什麼」，偏 `Author-driven`

## 底層與表層

我越來越覺得，Ludwigia 的底層資料結構應該盡量簡單，因為真正的複雜度比較適合長在表層入口與呈現方式，而不是一開始就塞進內容分類。

- 底層規則少而硬，表層說明短而有用
- 底層要簡單：先把 content type、metadata、index schema 壓到最少，避免每新增一篇內容都要先解一道分類題
- 表層可以豐富：同一份簡單的底層資料，可以長出 tags、collections、series、featured views、theme、不同 landing page 與互動方式
- 如果某個「複雜分類」主要只是讓首頁或入口看起來比較不單調，那它通常更適合做成表層 view，而不是新增一個底層 section

## Standard Generator，不是 Page Builder

我希望 `tools/create_content.py` 做的事很單純：生成一個穩定、theme-aware 的標準內容頁。

- 我不想把 parser 慢慢養成什麼都能吃的萬用造頁器
- 允許有少量不同排版 style，但 style 是排版層，不是 presentation gadget 無限擴張的理由
- 想玩特殊視覺或超客製 layout，就自己 customize；不要把這種需求反推回標準生成器
- 插圖這類常見需求，優先支援有語意的 component（像 `<image>`），不要鼓勵直接手刻 raw HTML

## Core Markdown

我現在更傾向把 `.md` 想成 extended markdown，但把真正重要的東西壓在其中的 core markdown 正文。

- `<meta>` 仍然要讀，因為 title / tags / summary 對入口與索引有用
- 但 Reading Mode / Garden 這種正文視圖，不需要理解整份 extended markdown
- 它們應該只依賴必要 metadata + 純 markdown 正文；其中 markdown extractor 本身不必去 parse `<meta>`

最近一個很明顯的例子，就是我不想再讓 Garden 的全文閱讀視圖維護一份手寫 markdown parser。

- preview subset 還能接受手寫 renderer
- 但只要碰到 ordered list continuation、nested list、table、LaTeX，手寫 parser 很快就會變脆
- 所以 Garden 的全文視圖改成直接走標準 markdown pipeline，反而更符合「不要在 UI 層偷偷長出第二份規則」這個方向

另一個順手清掉的歷史殘留是 `<section>...</section>` source block。

- 它已經不再是作者真正會用的語法
- 留著只會讓人誤會它是正式 contract，還可能漏進 preview / Garden 正文
- 與其繼續容忍舊殘留，不如直接刪掉，讓 source 規則更乾淨

## 重大決策

- 重大決策的背景/選項/取捨/後果，集中在 `docs/design/design.md`，避免 `docs/author/dev-notes.md` 變成規格來源或決策散落。

## Canvas vs Writing（我希望怎麼分）

這件事比我原本想的更容易膨脹成分類辯論，所以我現在更在意一個原則：不要讓底層 content type 承擔太多入口層的複雜度。

- 如果某種差異只是 genre、mood、閱讀脈絡或首頁呈現方式的差異，優先交給 tags / collections / views
- 真正的重大決策與命名取捨，集中寫在 `docs/design/design.md`，避免在這裡重複展開

## 我用來自我檢查的提醒

- 內容是可攜帶的檔案（不綁 UI）
- 入口是可替換的 UI（不綁內容）
- 如果系統開始變成「大雜燴」或「哪裡都改得到但也哪裡都必須改」，通常代表抽象不清楚，需要重構或切分子系統

## 最近的收斂（2026-06）

- Theme 現在我更明確拆成「語意外觀」與「可關閉的動效」兩層：`Sky/Garden` 可以有自己的氛圍，但動效控制不應碎成多個開關
- Note 的 CSS/JS 我也希望維持責任邊界：typography 是 core、reading-mode 是 extras、preview renderer 是卡片層，不要互相滲透
- 圖片放大互動應該是全站共用 runtime，不要讓每個入口自己造 lightbox
- 我最近也把另一條邊界想得更清楚：主站 `Theme / Palette / Effects` runtime 預設只保證主站頁面與標準內容頁。像 `garden/index.html` 這種獨立 extension surface，應該允許保有自己的視覺/runtime，而不是被默認綁進主站 ambient effect contract。否則之後每次有人說「某頁怎麼沒吃到 Garden theme」，很容易把其實不同子系統的東西誤判成 regression。
- 翻譯工作流我決定走 source-driven：`tools/translate_content.py` 只翻必要自然語言，metadata/tag/path/骨架不應被重寫
- 首頁 `Skills` 與 `Credentials & Honors` 區塊我維持了資料與渲染分離：`data/Skills/skills.json` 與 `data/Credentials/credentials.json` 作為單一真相來源，前端以類別切換與 Modal 燈箱處理展示，兼顧資料可維護性與畫面精簡度。
