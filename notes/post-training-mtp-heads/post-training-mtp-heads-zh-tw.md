<meta>
Title: 後訓練 MTP Heads：分布對齊與動態草稿深度
Summary: 整理 Match the Distribution, Not the Compute: Post-Training Multi-Token Prediction Heads 的研究定位、一手參考資料與後續補寫方向。
Slug: post-training-mtp-heads-zh-tw
Output: notes/post-training-mtp-heads/post-training-mtp-heads-zh-tw.html
CanonicalId: post-training-mtp-heads
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# 後訓練 MTP Heads：分布對齊與動態草稿深度

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

2026-10-01 新稿：固定 Qwen3-8B，使用 target-generated CoT 訓練 chained heads，另研究 relaxed verification 與動態 head 數。放寬驗證容許 bounded distribution drift，不能聲稱 exact；這是新近研究，尚不是主流採用證據。

## 後續補寫方向

head-only後訓練與資料預算；expected對realized speed；bounded drift與adaptive controller。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Prachi Badarayani, Aidan Jay, Chenghui Zhou, Dayquan Julienne, Yuan Gao, Tianwei Chen, George Zerveas, Ishmam Zabir, Xiren Zhou, Chris Quirk, Xia Song. (2026). *Match the Distribution, Not the Compute: Post-Training Multi-Token Prediction Heads*. arXiv preprint arXiv:2610.00888. [Match the Distribution, Not the Compute: Post-Training Multi-Token Prediction Heads](https://arxiv.org/abs/2610.00888)。

    閱讀重點：head-only後訓練與資料預算；expected對realized speed；bounded drift與adaptive controller。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

