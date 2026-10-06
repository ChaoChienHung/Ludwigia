<meta>
Title: Speculative Decoding：如何精確驗證草稿 token
Summary: 整理 Fast Inference from Transformers via Speculative Decoding 的研究定位、一手參考資料與後續補寫方向。
Slug: speculative-decoding-leviathan-2023-zh-tw
Output: notes/speculative-decoding-leviathan-2023/speculative-decoding-leviathan-2023-zh-tw.html
CanonicalId: speculative-decoding-leviathan-2023
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# Speculative Decoding：如何精確驗證草稿 token

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

便宜 draft model 提出序列，昂貴 target 平行 scoring，再用修正 rejection sampling 保留 target sampling distribution。這是驗證框架的基礎，draft 不必是 MTP；論文不能當成 backbone 採用 MTP 的證據。

## 後續補寫方向

接受機率與拒絕後修正分布；預期接受長度；draft/verify成本與數值精度。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Yaniv Leviathan, Matan Kalman, Yossi Matias. (2023). *Fast Inference from Transformers via Speculative Decoding*. ICML 2023. [Fast Inference from Transformers via Speculative Decoding](https://proceedings.mlr.press/v202/leviathan23a.html)。

    閱讀重點：接受機率與拒絕後修正分布；預期接受長度；draft/verify成本與數值精度。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

