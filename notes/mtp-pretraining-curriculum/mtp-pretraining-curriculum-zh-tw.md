<meta>
Title: MTP Curriculum：訓練收益與加速收益的分離
Summary: 整理 Pre-Training Curriculum for Multi-Token Prediction in Language Models 的研究定位、一手參考資料與後續補寫方向。
Slug: mtp-pretraining-curriculum-zh-tw
Output: notes/mtp-pretraining-curriculum/mtp-pretraining-curriculum-zh-tw.html
CanonicalId: mtp-pretraining-curriculum
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# MTP Curriculum：訓練收益與加速收益的分離

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

以小模型比較 forward/reverse curriculum。不同訓練次序可以在 next-token 品質與 self-speculative decoding 收益上走向不同結果，適合用來拆開 MTP 的兩種目標。

## 後續補寫方向

curriculum定義與公平預算；NTP／MTP品質；head接受率與解碼收益。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Ansar Aynetdinov, Alan Akbik. (2025). *Pre-Training Curriculum for Multi-Token Prediction in Language Models*. ACL 2025 Main. [Pre-Training Curriculum for Multi-Token Prediction in Language Models](https://arxiv.org/abs/2505.22757)。

    閱讀重點：curriculum定義與公平預算；NTP／MTP品質；head接受率與解碼收益。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

