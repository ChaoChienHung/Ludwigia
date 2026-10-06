<meta>
Title: Tensor Decomposition MTP：從獨立邊際到聯合預測
Summary: 整理 Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition 的研究定位、一手參考資料與後續補寫方向。
Slug: tensor-decomposition-mtp-zh-tw
Output: notes/tensor-decomposition-mtp/tensor-decomposition-mtp-zh-tw.html
CanonicalId: tensor-decomposition-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# Tensor Decomposition MTP：從獨立邊際到聯合預測

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

把獨立多頭預測連到 rank-1 機率分解，再以 rank-r canonical probability decomposition 表達未來 token 的聯合關係。更高 rank 的候選品質與預測頭成本須一起衡量。

## 後續補寫方向

rank-1直覺；rank-r CP分解、採樣與loss；rank/vocabulary/速度的權衡。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Artem Basharin, Andrei Chertkov, Ivan Oseledets. (2024). *Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition*. arXiv preprint arXiv:2410.17765. [Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition](https://arxiv.org/abs/2410.17765)。

    閱讀重點：rank-1直覺；rank-r CP分解、採樣與loss；rank/vocabulary/速度的權衡。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

