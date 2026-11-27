<meta>
Title: 從判別式打分到自迴歸生成：推薦模型換了什麼問題？
Summary: 比較候選打分與 Semantic ID 自迴歸生成的任務定義、物品表示、訓練訊號、解碼與評估，說明生成式推薦擴大了模型可選擇的空間，也引入合法性、成本和目標對齊問題。
Tags: Recommender Systems, Generative Retrieval, Semantic ID, Ranking, Machine Learning
CanonicalId: discriminative-scoring-to-autoregressive-recommendation
Slug: discriminative-scoring-to-autoregressive-recommendation-zh-tw
Output: notes/discriminative-scoring-to-autoregressive-recommendation/discriminative-scoring-to-autoregressive-recommendation-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: true
Status: published
Published: 2026-11-27
LastModified: 2026-11-27
</meta>
<draft>
- TLDR：判別式排序在給定候選上打分，生成式召回學習可輸出的商品序列；兩者的任務與可選空間不同，但不必互斥。
- NarrativeArc：一次請求的兩種問題 → 物品如何變成 token → 訓練與解碼 → 成本和評估 → 可組合的系統。
- Scope：模型任務與表示，不重講跨階段架構整合。

- 引子｜同一次請求的兩種考題：先讓讀者分清「已有候選怎麼選」與「下一個候選從哪裡來」，把可選空間作為全文比較軸。
    - 開頭：用同一次推薦請求裡「選現有候選」和「找新候選」的差異破題。
    - 啟後：候選集合固定時，模型究竟在解哪一道題？

- 候選打分｜判別式模型的能力邊界：用 $P(\text{click}\mid h,i)$ 說明條件打分、特徵使用與候選遺漏；不要把 Transformer 名稱當分界。
    - 承先：先看判別式打分能處理已入場候選的範圍。
    - 證據：條件打分式 $P(\text{click}\mid h,i)$ 明確要求先給定商品 $i$，可用來界定「已入場候選」的範圍。
    - 啟後：若商品根本沒有被召回，如何讓模型提出新候選？

- 商品代碼｜讓召回成為可生成的序列：從原子 ID 的詞表負擔引入 Semantic ID、自迴歸分解與合法路徑檢查。
    - 承先：候選缺口引出可生成的商品代碼。
    - 啟後：生成商品代碼會改變哪些訓練與服務問題？

- 訓練與解碼｜新任務交換了哪些難題：區分已曝光商品的行為預測與後續商品生成，接著檢查日誌偏差、列表品質、beam 剪枝及服務成本。
    - 承先：代碼序列帶來新的學習目標與解碼成本。
    - 啟後：生成召回與判別式排序該如何分工？

- 收束｜按瓶頸組合模型：以候選覆蓋、即時特徵、延遲和最終業務指標決定生成召回與判別式精排的分工。
    - 承先：新的代價使選型回到系統真正的瓶頸。
    - 結尾：回到候選覆蓋與排序能力的分工，按實際瓶頸而非模型名稱選架構。
</draft>

# 從判別式打分到自迴歸生成：推薦模型換了什麼問題？

同一位使用者打開首頁時，推薦系統可以面對兩種不同的考題。第一種是：「候選商品已經在桌上，哪件更值得展示？」第二種是：「商品庫很大，下一件值得拿上桌的是什麼？」前者是候選打分與排序，後者是召回或生成。兩者可以組成同一條服務鏈；差別在於**模型被要求選擇的空間**。

<content-link canonical="from-cascade-to-generative-recommendation-paradigm-shift">級聯到生成式推薦的架構篇</content-link>討論跨階段怎麼共享計算。這篇只看模型任務：判別式打分與自迴歸生成各學什麼、在什麼地方交換了難題。

## 已有候選：對商品逐一打分

傳統排序器接收使用者情境 $h$ 與候選商品 $i$，預測點擊、購買或其他行為的分數，例如 $P(\text{click}\mid h,i)$。模型可使用商品價格、類別、即時特徵及使用者與商品的交叉訊號，再按分數排列候選。

這種模型擅長比較已拿到手的商品。它不需要知道如何「寫出」一個商品 ID；但它也無法替**未進候選集**的商品打分。若召回遺漏高潛力商品，精排模型再強也無法補回。打分與生成的分水嶺，首先是這個候選集邊界，而不是模型名稱是否含 Transformer。

## 沒有完整候選：把商品變成可生成的代碼

生成式召回從情境 $h$ 出發，直接學習下一件商品的分布 $P(i\mid h)$。但商品庫可能很大；若把每件商品當成互不相關的原子 token，輸出詞表與長尾資料都會成為負擔。一條研究路線是先把商品映射為較短的 <content-link canonical="semantic-id-in-generative-recommendation">Semantic ID</content-link>，例如由多層代碼組成的 $(c_1,c_2,c_3)$，再預測：

$$P(c_1,c_2,c_3\mid h)=P(c_1\mid h)P(c_2\mid h,c_1)P(c_3\mid h,c_1,c_2).$$

[TIGER](https://arxiv.org/abs/2305.05065) 以語意代碼表示商品，再用序列模型生成下一個商品的代碼。前一步的代碼成為後一步的條件，模型因而可以在較小的代碼空間裡組合商品。這不表示任何代碼組合都對應真實、可售商品；解碼後還要檢查合法性、目錄映射與服務時的庫存狀態。

## 訓練目標從「給定商品後預測行為」轉向「給定情境後預測商品」

候選打分模型通常以已曝光或採樣的商品為訓練單位，學在給定商品時的行為風險。生成式模型以觀察到的後續商品或商品序列為目標，逐個代碼學條件機率。兩者都依賴日誌，因此都會受到曝光偏差、負樣本或觀測策略影響；換成生成目標不會自動消除資料偏差。

單件商品生成與**整張推薦列表生成**也不是一回事。學 $P(i\mid h)$ 可以反覆抽樣或用 beam search 產生候選，但列表的多樣性、重複商品、位置效應與整體使用者體驗仍需另外處理。[OneRec](https://arxiv.org/abs/2502.18965) 進一步研究 session 層級生成與偏好對齊，正是因為逐件預測還不足以代表整個展示結果。

## 解碼把搜尋成本帶回模型內部

候選排序器的主要成本與候選數、特徵取得及每件商品的打分有關。自迴歸生成免去了枚舉整個商品庫的直接打分，但每生成一層代碼都要選擇分支；beam 越寬，覆蓋可能越好，計算也越多。第一層若把正確路徑剪掉，後面再精確也無法恢復。生成還需維護商品代碼版本、有效路徑與去重規則。

這也解釋了為何「更像 LLM」不等於自然享有 LLM 的所有工程紅利。Transformer 的大矩陣運算、注意力與快取技術可借用，但商品代碼的約束解碼、候選有效性與排序階段的豐富特徵仍是推薦特有的成本。評估應分開看**候選覆蓋、生成品質、端到端延遲與最終業務結果**，不能只拿離線 next-token loss 判斷整條鏈路。

## 兩種模型仍可以一起工作

生成模型可負責找候選，判別式排序器再使用即時商品特徵精排；也可以讓多階段任務共用使用者表示。[OneTrans-V2](https://arxiv.org/html/2609.28589v1) 就保留召回、粗排與精排三個任務，同時共享 backbone。這說明「判別式到生成式」更適合作為**任務與表示的轉變**來理解，不應被寫成所有舊任務都必須消失的單一路線。

如果現在面對的是候選覆蓋不足，值得研究生成式召回能否在合理解碼成本下找到不同商品；如果問題是已有候選的價值判斷，先改善特徵、標註與排序目標可能更直接。先判定問題發生在哪個邊界，再選模型，是比追逐範式名稱更可靠的起點。

<reviewkit>
<takeaways>
- 判別式排序回答「給定候選，誰更值得展示」；生成式召回回答「從商品庫中，下一個候選是誰」。
- Semantic ID 讓商品可以被逐步生成，也引入代碼合法性、路徑剪枝與版本維護問題。
- 單件商品的生成品質不等於整張列表的體驗；候選覆蓋與最終指標須分開驗證。
- 生成與打分可以共存，架構選擇應從實際瓶頸與完整服務成本出發。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料

- [TIGER: Recommender Systems with Generative Retrieval](https://arxiv.org/abs/2305.05065)
- [OneRec: Unifying Retrieve and Rank with Generative Recommender and Iterative Preference Alignment](https://arxiv.org/abs/2502.18965)
- [OneTrans-V2: Unifying Retrieval, Pre-rank, and Fine-rank with One Transformer](https://arxiv.org/html/2609.28589v1)
