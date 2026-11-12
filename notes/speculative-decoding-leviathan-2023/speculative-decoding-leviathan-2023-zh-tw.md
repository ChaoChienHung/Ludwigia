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
LastModified: 2026-11-12
</meta>

# Speculative Decoding：如何精確驗證草稿 token

Google 研究團隊（Yaniv Leviathan, Matan Kalman, Yossi Matias）在 ICML 2023 發表的《Fast Inference from Transformers via Speculative Decoding》，奠定了現代隨機推測解碼的數學黃金標準。論文最偉大的突破在於提出了**修正拒絕採樣（Modified Rejection Sampling）**，數學上嚴格證明了在任何採樣溫度下均可 100% 精確保留目標大模型的輸出機率分佈。

## 研究問題與架構設計（Architecture & Objective）

論文形式化了目標大模型 $M_{\text{target}}$ 與草稿小模型 $M_{\text{draft}}$ 的機率修正合約（§2）：
- **草稿生成**：輕量模型 $M_{\text{draft}}$ 依自迴歸自發採樣生成 $K$ 個候選 token $(x_1, \dots, x_K)$，各步採樣機率記為 $q_i(x_i)$。
- **平行打分**：目標大模型 $M_{\text{target}}$ 透過單次並行前向計算，評估該候選序列各位置的真實條件機率 $p_i(x_i)$。
- **修正拒絕採樣準則**：自左至右逐 token 檢驗，以機率接受各候選：
  $$\alpha_i = \min\left(1, \frac{p_i(x_i)}{q_i(x_i)}\right)$$
  若在第 $j$ 個位置被拒絕（以機率 $1 - \alpha_j$），則停止接受後續所有 token，並立即從修正殘差分佈中採樣該位置的最終 token：
  $$p'_j(x) = \frac{\max(0, p_j(x) - q_j(x))}{\sum_x \max(0, p_j(x) - q_j(x))}$$
  **數學保證**：最終生成的整體序列分佈與直接從 $M_{\text{target}}$ 逐 token 串行採樣出的分佈在理論上完全等價。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **完全無損加速**：在 T5-XXL（11B）與標準語言建模基準上，配合小規模 Draft Model，在維持輸出品質完全不失真（Zero Degradation in Benchmark Score & Perplexity）的前提下，實現了 **2× 至 3×** 的端到端推論加速。
- **嚴格驗證合約**：只要浮點數精度不出現溢出偏差，該採樣演算法保證輸出文字的統計分佈沒有任何漂移。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **Draft 模型不依賴 MTP**：本論文的核心是驗證協議；Draft Model 可以是任何完全獨立的小型預訓練語言模型，不要求必須採用 MTP 結構。
- **推論加速不是預訓練改進**：論文回答的是「給定已訓練好的模型，如何透過雙模型協同省下內存帶寬時間」，沒有涉及且不能作為改進目標主幹預訓練表現的證據。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Yaniv Leviathan, Matan Kalman, Yossi Matias. (2023). *Fast Inference from Transformers via Speculative Decoding*. ICML 2023. [Fast Inference from Transformers via Speculative Decoding](https://proceedings.mlr.press/v202/leviathan23a.html)。

    閱讀重點：接受機率與拒絕後修正分布；預期接受長度；draft/verify成本與數值精度。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- Leviathan 等人提出了修正拒絕採樣協議，首次在數學上嚴格保證了隨機推測解碼的分布無損性。
- 當候選被拒絕時，從正殘差分布 $\max(0, p - q)$ 重採樣，完美彌合機率差額。
- 在 T5-XXL 實驗中取得 2×–3× 的完全無損加速。
- 該研究屬於純粹的推論服務協議，其 Drafter 可以是任意獨立模型，不必依賴 MTP。
</takeaways>
<qprompt/>
</reviewkit>
