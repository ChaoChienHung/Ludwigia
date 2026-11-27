<meta>
Title: 從級聯架構到生成式推薦：轉型的動機與技術挑戰
Summary: 從多階段推薦系統的重複計算與目標斷層出發，比較端到端生成與保留級聯但共用 Transformer backbone 的兩條整合路線，說明各自能省下什麼、仍需承擔什麼。
Slug: from-cascade-to-generative-recommendation-paradigm-shift-zh-tw
Output: notes/from-cascade-to-generative-recommendation-paradigm-shift/from-cascade-to-generative-recommendation-paradigm-shift-zh-tw.html
CanonicalId: from-cascade-to-generative-recommendation-paradigm-shift
Style: default
Cover: ./from-cascade-to-generative-recommendation-paradigm-shift.png
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommendation systems, scaling law, deep learning
Status: published
Published: 2026-08-02
LastModified: 2026-11-27
</meta>
<draft>
- TLDR：級聯的問題是跨階段重複計算與孤立優化；端到端生成與共用 backbone 都是可行的整合方向，取捨在候選特徵、算力與服務預算。
- NarrativeArc：級聯為何存在 → 哪些重複與斷層值得消除 → 兩條整合路線 → 驗收時要量什麼。
- Scope：系統架構、跨階段計算與訓練分工。

- 引子｜級聯有工程理由：先交代海量商品與有限延遲，讓讀者理解多階段縮小候選為何成立。
    - 開頭：先讓讀者看見海量商品與延遲預算，理解級聯為何存在。
    - 啟後：分段計算的代價集中在哪些邊界？

- 跨階段斷層｜重算與孤立優化：指出重複編碼、特徵搬運與召回遺漏，分清階段數量和真正的系統瓶頸。
    - 承先：級聯守住預算，卻留下重算與候選遺漏。
    - 啟後：哪些架構路線能回應這種跨階段斷層？

- 路線一｜生成模型承擔更多鏈路工作：以 OneRec 的生成思路說明整合潛力，同時保留代碼合法性、覆蓋、特徵與解碼成本的問題。
    - 承先：瓶頸引出兩種整合方向，而非唯一替代方案。
    - 證據：OneRec 的生成式路線是公開比較案例；不能由此直接推定它在所有場景優於級聯。
    - 啟後：能否共用表示，同時保留階段分工？

- 路線二｜級聯共用 backbone：以 OneTrans-V2 說明使用者序列只編碼一次、不同任務仍保留自己的候選特徵與預算。
    - 承先：生成式路線有收益與成本，共用 backbone 提供另一個整合點。
    - 啟後：如何在同一種工作負載下比較兩條路線？

- 驗收｜固定場景比較完整鏈路：同時檢查候選品質、特徵可用性、訓練維護成本與端到端延遲，不以架構名稱直接宣判勝負。
    - 承先：架構差異要回到完整鏈路的共同驗收條件。
    - 結尾：回到完整鏈路的候選品質、特徵、成本與延遲，不預設某一路線勝出。
</draft>

# 從級聯架構到生成式推薦：轉型的動機與技術挑戰

<image>
src: ./from-cascade-to-generative-recommendation-paradigm-shift.png
alt: 生成式推薦系統的示意圖，顯示使用者輸入、生成模型與輸出。
caption: 生成式推薦是整合推薦鏈路的一條路線；另一條路線保留級聯，但共用模型計算。
</image>

如果商品庫很大，系統不可能對每件商品都執行最昂貴的排序模型。<content-link canonical="funnel-cascade-architecture-in-recommendation-systems">級聯架構</content-link>因此先讓召回挑出候選，粗排快速縮小範圍，精排再使用較完整的商品與使用者交互特徵。每一階段有自己的時間與算力預算。這種分工有明確的工程理由，問題在於：當階段越來越多，它們可能重複處理相同的使用者歷史，卻很難共同學到一個一致的表示。

近年的研究試圖整合整條鏈路。**整合不只等於撤掉級聯。** [OneRec](https://arxiv.org/abs/2502.18965) 探索以生成模型取代傳統召回與排序鏈路；[OneTrans-V2](https://arxiv.org/html/2609.28589v1) 則保留候選逐階段縮減，讓召回、粗排與精排共用 Transformer backbone。比較這兩條路，才能準確回答：真正值得消除的是什麼，哪些階段差異仍應保留？若想先看打分與生成的模型任務差異，可讀 <content-link canonical="discriminative-scoring-to-autoregressive-recommendation">從判別式打分到自迴歸生成</content-link>。

## 級聯解決了什麼，也留下了什麼

級聯把昂貴計算留給少量候選。召回重視覆蓋率，精排能使用更多商品側與交叉特徵；每一段只需符合自身延遲預算。它並非一個等待被淘汰的錯誤設計。

但獨立建模也付出代價。使用者的長期行為序列可能在不同階段各編碼一次；相似的特徵工程與部署流程要反覆維護。召回若漏掉精排偏好的商品，後者再精準也無法補救。粗排與精排若從不同表示與監督出發，候選順序可能不一致。這些問題的共同核心是 **跨階段重複計算與孤立優化**，不是「使用了好幾個階段」本身。

局部替換其中一段為 Transformer，可能改善該段的模型能力，卻不會自動省掉其他階段的序列編碼、服務呼叫或特徵搬運。若要讓整條鏈路受益，必須看跨階段究竟共享了哪些計算與監督。

## 路線一：讓生成模型承擔更多鏈路工作

OneRec 的做法是把推薦重寫為生成任務：從使用者行為形成情境，逐步產生推薦結果，並用偏好對齊改善整體輸出。它試圖讓候選選擇與結果品質在同一模型內靠近，減少多個獨立模型之間的邊界。若商品以 <content-link canonical="semantic-id-in-generative-recommendation">Semantic ID</content-link> 表示，模型可沿代碼序列產生候選，再將有效代碼映射回商品。

這條路的收益需要連同成本一起看。生成要處理代碼合法性、候選覆蓋、解碼延遲與多樣性；原本精排可用的豐富商品側和交叉特徵，也未必能無損搬進生成過程。抽樣溫度等解碼參數可改變候選分布，但**不等於自動解決探索、冷啟動或長期滿意度**；這些仍要各自定義目標與驗證方式。

因此，端到端生成是一個強力的架構選項，能否取代某條成熟級聯，要以相同業務場景、特徵可用性與服務預算比較，而不是由「端到端」這個名稱決定。

## 路線二：保留級聯，共用 backbone

OneTrans-V2 提供另一個切法：使用者歷史只編碼一次，召回、粗排、精排都讀同一份使用者情境；各階段仍保留自己的候選特徵、token 預算與任務目標。如此可以重用最昂貴的使用者側計算，同時不要求精排放棄它需要的交叉特徵。論文也讓階段聯合訓練，並以精排資訊監督粗排，減少兩者排序不一致。[原論文的架構說明](https://arxiv.org/html/2609.28589v1)

這種方式沒有消除候選逐段篩選，也沒有把所有推薦決策縮成同一種輸出。它針對的是**相同情境被重算、階段之間無法傳遞知識**。代價則是共享模型的任務平衡、階段隔離、快取生命週期與部署協調更複雜。若共用 backbone 的服務路徑需要大量額外搬運，紙面上的計算重用也可能無法轉化成端到端延遲收益。

## 如何比較兩條路

比較架構時，先固定場景與資源，再拆開量測：

| 問題 | 為何要看 |
| --- | --- |
| 候選覆蓋與最終品質 | 召回少撈的商品，後段無法補救；生成與級聯須比同一個業務目標。 |
| 使用者序列編碼次數與跨階段搬運 | 區分模型計算重用和真正的服務開銷改善。 |
| 商品側與交叉特徵的可用性 | 端到端生成若失去精排重要訊號，省下的計算可能抵不過品質損失。 |
| 端到端延遲、吞吐與硬體預算 | 單一 kernel 或單一階段加速，不代表整條鏈路變快。 |
| 訓練與維護成本 | 共用模型減少重複實作，也增加跨任務協調；兩者都要算。 |

結論是：推薦系統轉型的核心，不是先決定所有商品都要用自迴歸方式生成，而是找出**哪些計算和知識可共享、哪些候選特徵和時間預算必須分開**。OneRec 與 OneTrans-V2 分別對這個問題提出不同答案；各自是否划算，要由完整鏈路的品質與成本證明。

<reviewkit>
<takeaways>
- 級聯透過逐階段縮小候選控制成本；值得優先處理的是重複編碼與孤立優化。
- OneRec 以生成模型整合更多鏈路；OneTrans-V2 保留級聯並共用使用者情境與 backbone。
- 單段模型變快或變大，不足以證明整條推薦鏈路的品質與成本改善。
- 架構比較需固定場景與資源，並同時檢查候選覆蓋、特徵可用性和端到端服務指標。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料

- [OneRec: Unifying Retrieve and Rank with Generative Recommender and Iterative Preference Alignment](https://arxiv.org/abs/2502.18965)
- [OneTrans-V2: Unifying Retrieval, Pre-rank, and Fine-rank with One Transformer](https://arxiv.org/html/2609.28589v1)
