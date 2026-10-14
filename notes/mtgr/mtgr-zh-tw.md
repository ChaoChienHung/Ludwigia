<meta>
Title: MTGR：在序列骨幹中保留工業排序的交叉特徵
Summary: 理解美團 MTGR 為何將 HSTU 類序列建模與 DLRM 特徵結合，以及 user-level 聚合、動態 mask 和判別式目標的角色。
Slug: mtgr-zh-tw
Output: notes/mtgr/mtgr-zh-tw.html
CanonicalId: mtgr
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, MTGR, Meituan, ranking, HSTU
Status: drafting
LastModified: 2026-10-09
</meta>

<draft>
- TLDR：MTGR 借用序列模型的擴展能力，仍保留候選側交叉特徵與判別式打分。
- MainFlow：序列與交叉特徵的兩難 → U/S/R/Target 組織 → mask／GLN → user-level 效率 → MTFM。
- Scope：原始 MTGR，不把 MTFM 多場景特性倒灌。
- FollowUps：作者全盤 proofread；確認生成式命名與判別式 loss 的敘述。
</draft>

# MTGR：在序列骨幹中保留工業排序的交叉特徵

長行為序列能幫模型理解使用者，但工業排序還仰賴大量已驗證有用的特徵，例如「使用者過去對這類候選的點擊率」。若為了改用生成式序列模型而把這些候選相關交叉特徵全部丟掉，擴大模型也未必補得回來。MTGR（Meituan Generative Recommendation）就是美團針對這個落差提出的排序框架。[原論文](https://arxiv.org/abs/2505.18654)

## 1. 資料先分成共用與候選專屬

使用者基本資料與較早的歷史、近期即時行為，大多能讓同一請求的多個候選共用；候選商品特徵與 user–item 交叉特徵則會隨候選而變。MTGR 把這些來源整理為 token 序列，讓 HSTU 類骨幹共同建模，同時保留傳統 <content-link canonical="dlrm">DLRM</content-link> 的豐富候選特徵。[原論文 §3–4](https://arxiv.org/html/2505.18654)

```text
使用者與歷史 ─┐
即時行為 ────┼→ HSTU 類骨幹 → 候選分數
候選＋交叉特徵 ┘
```

這裡名稱中的「Generative」描述它承襲的**序列建模範式與可擴展訓練方式**；本篇論文的候選排序仍使用**判別式 loss 來預測標籤**，不能直接理解成線上逐 token 生成商品 SID。[原論文引言](https://arxiv.org/html/2505.18654)

## 2. Mask 為何需要按時間變化？

一個 user-level 樣本可收納同一使用者在一段時間內的多次曝光，而即時行為可能發生在兩次曝光之間。若較早的候選看見較晚才發生的點擊，就是資料洩漏。MTGR 讓舊的靜態歷史可共用、即時行為依時間因果可見、不同候選彼此隔離。這也是為什麼不能只說「把所有 token 接起來送入 HSTU」。[原論文 §4.2](https://arxiv.org/html/2505.18654)

不同來源的表示分布也不同，作者加入 **Group-Layer Normalization**，分組處理異質 token 的正規化。其目的不是把所有特徵壓成同一種語意，而是讓共用骨幹較穩定地同時處理它們。

## 3. 為何能提高計算量卻控制資源？

關鍵是以使用者為粒度聚合樣本，讓多個候選和曝光共用歷史計算；再配合 embedding 查詢、負載平衡與算子方面的優化。論文報告大型版本單樣本前向 FLOPs 約為基線的 65 倍，但訓練成本相近、線上推理資源較低；這些是其特定系統與基線下的結果，不能把 FLOPs 當成實際延遲的同義詞。[原論文實驗](https://arxiv.org/html/2505.18654)

<content-link canonical="mtfm">MTFM</content-link> 進一步把問題擴展到多個外賣業務場景，並擴大 target token 的表示；它不是 MTGR 的別名。

## 參考資料（References）

1. Han, R., et al. (2025). MTGR: Industrial-Scale Generative Recommendation Framework in Meituan. *Proceedings of the 34th ACM International Conference on Information and Knowledge Management (CIKM 2025)*. [DOI](https://doi.org/10.1145/3746252.3761565)；[arXiv:2505.18654](https://arxiv.org/abs/2505.18654)。

<reviewkit>
<takeaways>
- MTGR 將長行為序列與工業排序的候選、交叉特徵放進同一骨幹。
- 即時行為需依曝光時間遮罩，候選之間也要隔離，避免資訊洩漏。
- 論文的排序目標是判別式預測，不等於生成式召回逐步輸出 SID。
</takeaways>
<qprompt/>
</reviewkit>
