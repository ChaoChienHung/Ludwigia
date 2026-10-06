<meta>
Title: P-EAGLE：平行草稿與長序列訓練
Summary: 整理 P-EAGLE: Parallel-Drafting EAGLE with Scalable Training 的研究定位、一手參考資料與後續補寫方向。
Slug: p-eagle-zh-tw
Output: notes/p-eagle/p-eagle-zh-tw.html
CanonicalId: p-eagle
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# P-EAGLE：平行草稿與長序列訓練

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

以可學習共享 hidden state 將 EAGLE 的自迴歸 drafter 改為 parallel MTP；attention-mask預計算與sequence partitioning支援長序列訓練。這是 drafter 方法研究，不代表測試的 backbone 原生採用 MTP。

## 後續補寫方向

parallel positions的conditioning；mask與partitioning；vLLM相對EAGLE-3的基準。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Mude Hui, Xin Huang, Jaime Campos Salas, Yue Sun, Nathan Pemberton, Xiang Song, Ashish Khetan, George Karypis. (2026). *P-EAGLE: Parallel-Drafting EAGLE with Scalable Training*. arXiv preprint arXiv:2602.01469. [P-EAGLE: Parallel-Drafting EAGLE with Scalable Training](https://arxiv.org/abs/2602.01469)。

    閱讀重點：parallel positions的conditioning；mask與partitioning；vLLM相對EAGLE-3的基準。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

