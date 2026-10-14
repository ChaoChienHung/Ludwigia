<meta>
Title: Bebop：用拒絕採樣與 TV Loss 穩定 MTP 的 RL Rollout 加速
Summary: 整理 Bebop 如何以拒絕採樣及多步 TV loss 提高 MTP 接受長度，並區分候選接受率、rollout 與整體 RL 訓練速度。
Slug: bebop-mtp-rl-rollout-zh-tw
Output: notes/bebop-mtp-rl-rollout/bebop-mtp-rl-rollout-zh-tw.html
CanonicalId: bebop-mtp-rl-rollout
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, speculative decoding, reinforcement learning, large language models
Status: drafting
LastModified: 2026-10-11
</meta>

# Bebop：用拒絕採樣與 TV Loss 穩定 MTP 的 RL Rollout 加速

這篇研究的是**訓練時的生成成本**。LLM 的強化學習要先用當前策略產生回答（rollout），再評分並更新模型。MTP 可以用較輕的預測頭先提出數個未來 token，由主模型一起驗證，減少逐 token 生成的等待；但 RL 期間策略持續變動，候選的接受長度可能下降。Bebop 問的是：怎樣讓這項加速在整段 RL 訓練中維持？

## 從候選到接受：瓶頸在哪裡？

令主模型的下一 token 分布為 `p`，MTP 候選分布為 `q`。論文比較兩種驗證方式：

1. **Target-only sampling**：取 `q` 機率最高的候選 token，依它在 `p` 中的機率決定是否接受。即使候選找對主模型的最高機率 token，單步接受率也受該 token 的機率限制；當分布變得較分散時，這個上限可能降低。
2. **Rejection sampling**：從 `q` 抽候選，再按 `min(1, p(token)/q(token))` 接受。其平均單步接受率是兩個分布的重疊量 `Σ min(p, q) = 1 − TV(p, q)`。配合拒絕後的殘差重採樣，輸出仍遵循主模型分布。

作者在所測的 RL 任務中觀察到：策略分布的熵變化，比凍結預測頭與持續更新的主模型之間的失配，更能解釋接受長度的下降。這是對其設定的分析與實驗結果；不能把「熵越高，所有 MTP 都必然越慢」當成通用定律。拒絕採樣仍有保存與處理候選分布的額外成本，接受率提高也不自動保證吞吐提高。

## Bebop 怎麼訓練 MTP？

單步拒絕採樣的接受率由 `TV(p, q)` 直接決定，因此作者用 TV 距離取代一般 cross-entropy／KL 作為預測頭的訓練目標。多步候選還有前綴依賴：第一步若遭拒，後面的候選就不能直接計入這輪已接受的長度。Bebop 的 **end-to-end TV loss** 依各步接受率的連乘，優化整段候選的預期接受長度，因而自然更重視較早的步數。

其實務配方是在 **RL 開始前的 SFT 階段**訓練 MTP 預測頭，RL rollout 時使用拒絕採樣，並在論文測試條件下凍結預測頭。這與「RL 期間持續共同訓練主模型和 MTP」是不同方案；論文報告前者已能維持接受長度，省去線上更新預測頭的成本。這裡優化的是候選分布與生成效率，不能推成 MTP 改善主模型本身的推理能力或 RL sample efficiency。

## 實驗結果與閱讀邊界

論文以 Qwen3.5、3.6、3.7 的不同設定測試數學、程式與 agent 任務。在 Qwen3.5-35A3B 的三步候選實驗中，end-to-end TV loss 相對 CE baseline 的拒絕採樣接受率提升，依任務為 **3.0–8.0 個百分點**（分布外 MT-Bench 為 **2.3 個百分點**）。作者另報告非同步 RL 流程相對無 MTP 最高 **1.8 倍整體加速**；agentic 任務的 rollout 階段最高 **2.4 倍**。百分點、rollout 吞吐與整體訓練時間是不同量，不能互換，也不能當成跨模型或跨硬體的固定倍率。

這篇在 MTP 系列中的位置是 **「候選預測頭訓練目標＋驗證規則＋RL rollout 系統成本」**。它補足了「模型有 MTP」到「RL 訓練真的更快」之間的關鍵條件。後續深讀應核對：不同熵變化任務的接受長度、TV loss 計算成本、候選分布快取成本，以及相同硬體／batch／生成長度下的完整 wall-clock 比較。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Li, Y., Jiang, H., Xu, Y., et al. (2026). *Breaking Entropy Bounds: Accelerating RL Training via MTP with Rejection Sampling*. arXiv preprint arXiv:2606.12370, v1. [arXiv 頁面](https://arxiv.org/abs/2606.12370)。

    閱讀重點：§2.2 兩種驗證與分布保證；§3 熵與接受率；§4 多步 TV loss；§5 是否需在線更新；§6 的接受率、rollout 與整體 RL 延遲。

<reviewkit>
<takeaways>
- Bebop 對準的是 RL rollout 中 MTP 候選的接受長度與生成成本，不是主模型品質的直接提升。
- 拒絕採樣的平均單步接受率等於主模型與候選分布的重疊量；多步 TV loss 再對準整段可接受的前綴長度。
- 1.8 倍是論文測試設定中的最高整體非同步 RL 加速；仍需連同任務、系統與比較基準閱讀。
</takeaways>
<qprompt/>
</reviewkit>
