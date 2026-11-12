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
LastModified: 2026-11-12
</meta>

# 既有 NTP 模型加上 MTP：表示適配與推論限制

Somesh Mehra 等人在 2025 年初發表的《On multi-token prediction for efficient LLM inference》，直面了一個關鍵的工業痛點：**如何為已經基於標準 NTP 預訓練完成的現成大模型（如 LLaMA、Mistral）後向適配 MTP 能力？** 該研究深入剖析了隱層表徵的特異性帶來的適配壁壘。

## 研究問題與架構設計（Architecture & Objective）

依據論文分析：
- **NTP 特徵的過度專門化（Specialization Bottleneck）**：在純粹 NTP 下訓練的大模型，其頂層隱層特徵向量被高度優化為「僅包含足夠預測下一個相鄰 token 的局部殘差資訊」，關於更遠未來 token 的信息早在深層計算中被作為噪聲丟棄。
- **凍結主幹適配的局限**：若僅凍結主幹訓練頂層 MTP Heads，由於輸入特徵源頭本身缺乏未來多步的全局特徵，輔助 Heads 的準確率存在不可逾越的理論上限。
- **輕量解凍與適配器架構**：論文對比了 LoRA 微調主幹頂層、引入跨層特徵穿透連接（Skip Connections）等策略，探尋最低微調代價下激發多步預測能力的路徑。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **量化適配天花板**：實驗證實，直接在凍結的 NTP 主幹上掛載 Heads，其推測解碼加速比普遍被壓制在 **1.3× 至 1.6×** 之間，難以達到從頭預訓練 MTP 所具備的 2.5×+ 的高接受長度。
- **微調權衡曲線**：解凍主模型最後 2–4 層並配合小學習率進行聯合微調，能在不破壞主模型原始性能的前提下，將接受長度拉升約 20%–30%。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **後向適配不等於原生預訓練**：這項研究最關鍵的邊界在於明確指出「事後補課」與「從頭預訓練」的不可替代性；無法僅靠微調幾個小 Head 就能完全獲得原生 MTP 模型的表徵全局性。
- **實驗集中於中等規模**：論文的主要實證落在 7B 與 13B 級別模型，更大規模（如 70B+）下隱層表徵的富餘能力是否能緩解此瓶頸仍需獨立論證。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Somesh Mehra, Javier Alonso Garcia, Lukas Mauch. (2025). *On multi-token prediction for efficient LLM inference*. arXiv preprint arXiv:2502.09419. [On multi-token prediction for efficient LLM inference](https://arxiv.org/abs/2502.09419)。

    閱讀重點：未來距離實驗；frozen head與joint adaptation；表示專門化的證據與限制。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 純 NTP 預訓練模型頂層表徵存在嚴重的「下一步局部專門化」，丟失了遠期預測線索。
- 完全凍結主幹訓練附加 Heads 會面臨明顯的接受率天花板（通常加速比 <1.6×）。
- 適度解凍主幹頂層或引入跨層特徵融合是突破後向適配瓶頸的必要代價。
- 清晰劃分了後向加載 MTP 與原生預訓練 MTP 之間的本質特徵差距。
</takeaways>
<qprompt/>
</reviewkit>
