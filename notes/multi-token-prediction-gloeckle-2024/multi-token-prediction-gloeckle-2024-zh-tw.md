<meta>
Title: MTP 預訓練：共享表示與獨立未來預測頭
Summary: 整理 Better & Faster Large Language Models via Multi-token Prediction 的研究定位、一手參考資料與後續補寫方向。
Slug: multi-token-prediction-gloeckle-2024-zh-tw
Output: notes/multi-token-prediction-gloeckle-2024/multi-token-prediction-gloeckle-2024-zh-tw.html
CanonicalId: multi-token-prediction-gloeckle-2024
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# MTP 預訓練：共享表示與獨立未來預測頭

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

共享 trunk 由多個未來位置 loss 共同監督，各個 heads 獨立預測。此文同時研究學習效果與 self-speculative decoding；作者對 choice points 的機制解釋屬假說，不能寫成通用規劃能力證明。

## 後續補寫方向

§2 loss 與架構、§3 程式與自然語言差異、§5機制假說、Appendix C 額外訓練成本。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Fabian Gloeckle, Badr Youbi Idrissi, Baptiste Rozière, David Lopez-Paz, Gabriel Synnaeve. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 loss 與架構、§3 程式與自然語言差異、§5機制假說、Appendix C 額外訓練成本。

2. Leviathan, Y., Kalman, M., & Matias, Y. (2023). *Fast Inference from Transformers via Speculative Decoding*. ICML 2023. [Fast Inference from Transformers via Speculative Decoding](https://proceedings.mlr.press/v202/leviathan23a.html)。

    閱讀重點：修正 rejection sampling 如何保留 target 分布；區分候選預測與驗證程序。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

