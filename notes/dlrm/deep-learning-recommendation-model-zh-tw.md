<meta>
Title: DLRM：從特徵表到候選商品打分
Summary: 從推薦排序的業務問題出發，理解 DLRM 如何處理稠密與稀疏特徵、計算交互並預測點擊，以及它為何成為序列式推薦模型的比較基準。
Slug: deep-learning-recommendation-model-zh-tw
Output: notes/dlrm/deep-learning-recommendation-model-zh-tw.html
CanonicalId: dlrm
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, DLRM, ranking, feature interaction
Status: drafting
LastModified: 2026-10-09
</meta>

<draft>
- TLDR：DLRM 為每個 user–item pair 組織特徵，經 embedding、交互與 MLP 輸出分數。
- MainFlow：候選打分問題 → 稠密／稀疏輸入 → 交互與預測 → 序列與系統成本 → 後繼方法。
- Scope：Naumov 等人的原始 DLRM；後世泛稱的 DLRM 家族另作區分。
- FollowUps：作者全盤 proofread；確認與現行工業 DLRM 的差異。
</draft>

# DLRM：從特徵表到候選商品打分

推薦系統先取得一批候選，再要判斷「這位使用者此刻會不會點這件商品？」一種直接做法，是把每個「使用者 × 候選商品」視為一筆樣本，整理出年齡、商品類別、價格、使用者 ID 等欄位，交給模型輸出機率。DLRM（Deep Learning Recommendation Model）是這條路線的代表。本文的 DLRM 特指 [Naumov 等人的原始模型](https://arxiv.org/abs/1906.00091)；工業文章也常把後來各種特徵式排序模型泛稱為 DLRM，不宜把兩者的細節完全畫等號。

## 1. 兩種輸入為何要分開處理？

價格、計數等稠密數值可以進入 **bottom MLP**，轉成固定寬度向量。使用者 ID、商品 ID、類別等稀疏欄位則先查各自的 **embedding table**。例如原始 ID `item_42` 本身沒有數值距離意義；查表後的向量才是模型可學的表示。

```text
稠密數值 ──→ bottom MLP ─────────────┐
使用者／商品／類別 ID ──→ embeddings ──┼→ 特徵交互 → top MLP → 點擊分數
```

## 2. 「交互」在原始 DLRM 是什麼？

原始模型讓這些等寬向量彼此做 **pairwise dot product**，再把交互結果與稠密向量送入 top MLP。點積是一種簡潔的配對訊號：若兩個向量在模型學出的空間中對齊，值會較高。它不表示模型手工寫死「某年齡一定喜歡某品牌」；權重仍由訓練資料學到。[原論文模型段落](https://arxiv.org/html/1906.00091)

這裡要分清兩件事：**輸入交叉特徵**是事先定義的組合欄位，例如「用戶偏好類別 × 候選類別」；**特徵交互模組**是模型內計算向量關係的運算。MTGR 等後繼方法強調保留工業 DLRM 的豐富交叉特徵，並不表示原始 DLRM 的唯一交互方式就是手工交叉欄位。

## 3. 它在推薦流水線中的位置

DLRM 本質上是**給定候選後打分**：輸入一件候選商品的特徵，輸出 CTR 等預測，再比較多個候選。商品不是由 DLRM 自迴歸生成。若有許多候選，候選相關的特徵交互和打分也要多次執行；大型 embedding table 還帶來記憶體與分散式訓練壓力。原論文因此特別討論 embedding 的模型並行與全連接層的資料並行。[原論文](https://arxiv.org/abs/1906.00091)

後來的序列式方法想更完整地利用長期行為，也想少重算共用的使用者歷史；但特徵式排序累積的候選側資訊仍很有用。<content-link canonical="hstu">HSTU</content-link> 由長行為序列出發，<content-link canonical="mtgr">MTGR</content-link> 嘗試在序列骨幹中保留交叉特徵，<content-link canonical="onetrans">OneTrans</content-link> 則把序列建模與特徵交互放進同一個 Transformer。這是三種不同的延伸，不是原始 DLRM 的內建功能。

## 參考資料（References）

1. Naumov, M., et al. (2019). Deep Learning Recommendation Model for Personalization and Recommendation Systems. *arXiv preprint*. [arXiv:1906.00091](https://arxiv.org/abs/1906.00091)。

<reviewkit>
<takeaways>
- DLRM 針對給定的 user–item pair 打分，並不負責生成候選商品。
- 稠密數值經 bottom MLP；稀疏類別與 ID 經 embedding table；交互後由 top MLP 預測。
- 原始 DLRM 的向量點積交互，與工業系統可能額外提供的輸入交叉欄位是不同層次。
</takeaways>
<qprompt/>
</reviewkit>
