<meta>
Title: 既有 NTP 模型加上 MTP：表示適配與推論限制
Summary: 整理 On multi-token prediction for efficient LLM inference 的研究定位、一手參考資料與後續補寫方向。
Slug: efficient-llm-inference-mtp-zh-tw
Output: notes/efficient-llm-inference-mtp/efficient-llm-inference-mtp-zh-tw.html
CanonicalId: efficient-llm-inference-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# 既有 NTP 模型加上 MTP：表示適配與推論限制

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

研究既有 next-token 模型的未來預測與 MTP 適配問題。hidden representations 對 NTP 的專門化意味新增 heads 並非自動成功；凍結與共同微調的結果需分開看。

## 後續補寫方向

未來距離實驗；frozen head與joint adaptation；表示專門化的證據與限制。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Somesh Mehra, Javier Alonso Garcia, Lukas Mauch. (2025). *On multi-token prediction for efficient LLM inference*. arXiv preprint arXiv:2502.09419. [On multi-token prediction for efficient LLM inference](https://arxiv.org/abs/2502.09419)。

    閱讀重點：未來距離實驗；frozen head與joint adaptation；表示專門化的證據與限制。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

