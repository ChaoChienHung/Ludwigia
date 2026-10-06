<meta>
Title: Blockwise Parallel Decoding：猜測多步，再驗證最長前綴
Summary: 整理 Blockwise Parallel Decoding for Deep Autoregressive Models 的研究定位、一手參考資料與後續補寫方向。
Slug: blockwise-parallel-decoding-zh-tw
Output: notes/blockwise-parallel-decoding/blockwise-parallel-decoding-zh-tw.html
CanonicalId: blockwise-parallel-decoding
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# Blockwise Parallel Decoding：猜測多步，再驗證最長前綴

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

多步候選由 scoring model 驗證最長有效前綴，是 MTP 解碼的重要前史。exact 模式對齊 greedy 輸出；approximate 模式交換速度與品質。原始研究任務為翻譯與影像，不是現代聊天 LLM。

## 後續補寫方向

proposal／scoring／accept流程；exact greedy的保證；approximate容許條件。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Mitchell Stern, Noam Shazeer, Jakob Uszkoreit. (2018). *Blockwise Parallel Decoding for Deep Autoregressive Models*. NeurIPS 2018. [Blockwise Parallel Decoding for Deep Autoregressive Models](https://arxiv.org/abs/1811.03115)。

    閱讀重點：proposal／scoring／accept流程；exact greedy的保證；approximate容許條件。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

