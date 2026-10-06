<meta>
Title: 後訓練 MTP：Masked Input、Gated LoRA 與一致性
Summary: 整理 Your LLM Knows the Future: Uncovering Its Multi-Token Prediction Potential 的研究定位、一手參考資料與後續補寫方向。
Slug: your-llm-knows-the-future-zh-tw
Output: notes/your-llm-knows-the-future/your-llm-knows-the-future-zh-tw.html
CanonicalId: your-llm-knows-the-future
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# 後訓練 MTP：Masked Input、Gated LoRA 與一致性

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

結合 masked-input MTP、gated LoRA、可學習 sampler 與 consistency losses，讓既有模型形成多 token 候選。標題的「知道未來」是研究命名；品質與分布保證仍以驗證規則為準。

## 後續補寫方向

masked visibility；gated LoRA保留原功能的方式；sampler與consistency；測速條件。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Mohammad Samragh, Arnav Kundu, David Harrison, Kumari Nishu, Devang Naik, Minsik Cho, Mehrdad Farajtabar. (2025). *Your LLM Knows the Future: Uncovering Its Multi-Token Prediction Potential*. arXiv preprint arXiv:2507.11851. [Your LLM Knows the Future: Uncovering Its Multi-Token Prediction Potential](https://arxiv.org/abs/2507.11851)。

    閱讀重點：masked visibility；gated LoRA保留原功能的方式；sampler與consistency；測速條件。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

