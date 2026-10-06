<meta>
Title: Hydra：讓草稿預測頭看見前面的候選
Summary: 整理 Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding 的研究定位、一手參考資料與後續補寫方向。
Slug: hydra-decoding-zh-tw
Output: notes/hydra-decoding/hydra-decoding-zh-tw.html
CanonicalId: hydra-decoding
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-10-06
</meta>

# Hydra：讓草稿預測頭看見前面的候選

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

後續 draft heads 依賴先前候選 token，處理 Medusa 獨立 heads 的不一致問題。Hydra++ 進一步調整訓練配方；依賴性與平行度的取捨需要連同驗證流程評估。

## 後續補寫方向

候選 embedding的傳遞；Hydra++ training recipe；與Medusa在同workload的比較。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Zachary Ankner, Rishab Parthasarathy, Aniruddha Nrusimha, Christopher Rinard, Jonathan Ragan-Kelley, William Brandon. (2024). *Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding*. COLM 2024. [Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding](https://openreview.net/forum?id=FbhjirzvJG)。

    閱讀重點：候選 embedding的傳遞；Hydra++ training recipe；與Medusa在同workload的比較。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

### 開源程式碼（Open Source Code）

1. [zankner/Hydra](https://github.com/zankner/Hydra)。

    閱讀重點：查看作者公開的 Hydra/Hydra++ heads、訓練與benchmark配置。

<reviewkit>
<takeaways>
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

