<meta>
Title: Medusa：多預測頭、候選樹與驗證解碼
Summary: 整理 Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads 的研究定位、一手參考資料與後續補寫方向。
Slug: medusa-zh-tw
Output: notes/medusa/medusa-zh-tw.html
CanonicalId: medusa
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# Medusa：多預測頭、候選樹與驗證解碼

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

以多 heads 提出未來候選，利用 tree attention 同時驗證。Medusa-1 凍結 backbone，Medusa-2 共同更新。typical acceptance 放寬原採樣分布契約，不能把評測品質不下降視為 exact distribution preservation。

## 後續補寫方向

§2.1候選樹、§2.2兩種訓練、§2.3 typical acceptance與exact sampling差別。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Tianle Cai, Yuhong Li, Zhengyang Geng, Hongwu Peng, Jason D. Lee, Deming Chen, Tri Dao. (2024). *Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads*. ICML 2024. [Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://proceedings.mlr.press/v235/cai24b.html)。

    閱讀重點：§2.1候選樹、§2.2兩種訓練、§2.3 typical acceptance與exact sampling差別。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

### 開源程式碼（Open Source Code）

1. [FasterDecoding/Medusa](https://github.com/FasterDecoding/Medusa)。

    閱讀重點：查看 Medusa-1/2 訓練指令、tree attention 與公開 checkpoints。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>
