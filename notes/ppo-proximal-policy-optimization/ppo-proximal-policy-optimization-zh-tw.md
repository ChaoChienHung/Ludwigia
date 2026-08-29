<meta>
Title: RLHF 的古典基石：PPO (Proximal Policy Optimization) 近端策略優化解析
Summary: 本文深入探討 PPO (Proximal Policy Optimization) 在大語言模型對齊 (RLHF) 中的經典機制，解構 Clip 截斷機制、Importance Sampling 比率、Actor-Critic 雙網架構以及 GAE (Generalized Advantage Estimation) 優勢估算，並分析其在巨型 LLM 訓練中的顯存與系統工程瓶頸。
Slug: ppo-proximal-policy-optimization-zh-tw
Output: notes/ppo-proximal-policy-optimization/ppo-proximal-policy-optimization-zh-tw.html
CanonicalId: ppo-proximal-policy-optimization
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: reinforcement learning, ppo, rlhf, deep learning
Status: drafting
Published: 2026-08-29
LastModified: 2026-08-29
</meta>

<draft>
- 1. 前言：從 TRPO 到 PPO——強化學習策略梯度的演進
    - TRPO (Trust Region Policy Optimization) 的二階 Hesian 矩陣痛點。
    - PPO 的設計哲學：用一階 Clip 截斷達到同等穩健的策略更新。
- 2. PPO 核心數學機制
    - 重要性採樣 (Importance Sampling) 與 Probability Ratio $r_t(\theta)$。
    - Clipped Surrogate Objective 的悲觀約束邏輯：$\min(r_t A_t, \text{clip}(r_t, 1-\epsilon, 1+\epsilon) A_t)$。
- 3. Actor-Critic 雙網與 GAE 優勢估算
    - Actor (Policy $\pi_\theta$) 與 Critic (Value $V_\phi$) 的職責分工。
    - GAE (Generalized Advantage Estimation) 如何平衡偏差 (Bias) 與方差 (Variance)。
- 4. PPO 在 LLM RLHF 中的四模型協同架構
    - Actor ($\pi_\theta$)、Critic ($V_\phi$)、Reference Model ($\pi_{\text{ref}}$) 與 Reward Model ($r_\psi$)。
    - 顯存吞吐開銷與系統架構工程複雜度。
- 5. PPO 的局限與後續演進 (DPO & GRPO)
- 6. 結語
</draft>


# RLHF 的古典基石：PPO (Proximal Policy Optimization) 近端策略優化解析

在 ChatGPT 與 InstructGPT 開啟的大語言模型（LLM）對齊浪潮中，**PPO（Proximal Policy Optimization，近端策略優化）** 是最經典且被廣泛驗證的強化學習（RL）演算法。由 Schulman 等人於 2017 年提出的 PPO，解決了傳統 Policy Gradient 方法中「策略更新步長過大導致崩塌」的致命問題。

在傳統 RLHF 工作流中，PPO 被用來引導模型生成符合人類偏好（流暢、有用、無害）的文本。然而，隨著模型參數量擴展至千億級別，PPO 複雜的 Actor-Critic 雙網路架構與巨額顯存需求也暴露無遺。

本文將深度解析 PPO 的數學推導、截斷機制（Clipped Objective）、Actor-Critic 分工、GAE 優勢估算，以及其在 LLM 落地時的工程調優細節。

## 從 Policy Gradient 到 PPO 截斷機制

### 1. 傳統 Policy Gradient 的風險

傳統 Policy Gradient 的目標函數可以寫作：

$$L^{\text{PG}}(\theta) = \hat{\mathbb{E}}_t \left[ \log \pi_\theta(a_t | s_t) \hat{A}_t \right]$$

如果優勢值 $\hat{A}_t > 0$，梯度更新會急劇增加該動作的概率。然而，若更新步長（Step Size）稍微過大，新策略 $\pi_\theta$ 可能衝出舊策略 $\pi_{\theta_{\text{old}}}$ 保持良好的「安全區域」，導致模型崩潰且難以恢復。

為了控制步長，TRPO (Trust Region Policy Optimization) 引入了 KL 散逸約束，但需要計算二階 Hessian 矩陣逆矩陣，計算極為昂貴。PPO 則以巧思改寫為**一階剪裁（Clipped）代理目標**。

### 2. 重要性採樣比率與 Clipped Objective

首先定義新舊策略的概率比率（Probability Ratio）：

$$r_t(\theta) = \frac{\pi_\theta(a_t | s_t)}{\pi_{\theta_{\text{old}}}(a_t | s_t)}$$

當 $\theta = \theta_{\text{old}}$ 時，$r_t(\theta_{\text{old}}) = 1$。PPO 的目標函數寫作：

$$L^{\text{CLIP}}(\theta) = \hat{\mathbb{E}}_t \left[ \min \left( r_t(\theta) \hat{A}_t, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) \hat{A}_t \right) \right]$$

其中超參數 $\epsilon$ 通常設定為 $0.1$ 或 $0.2$。

<block>
title: 悲觀剪裁邏輯（Pessimistic Bound）
content:
$\min(\cdot, \cdot)$ 函數的作用是在利益與風險間取悲觀下界：
1. **當 $\hat{A}_t > 0$（好動作）**：我們希望提升 $r_t(\theta)$，但當 $r_t(\theta) > 1+\epsilon$ 時，$\text{clip}$ 將其封頂在 $1+\epsilon$，不再給予更多梯度回報。這避免了對單一好動作過度過擬合。
2. **當 $\hat{A}_t < 0$（壞動作）**：我們希望降低 $r_t(\theta)$，當 $r_t(\theta) < 1-\epsilon$ 時，$\text{clip}$ 將其下限壓在 $1-\epsilon$，防止策略過度懲罰而崩潰。
</block>

## Actor-Critic 架構與 GAE 優勢估算

在 PPO 中，模型的學習依賴於 **Actor-Critic 雙網配合**：

* **Actor Network ($\pi_\theta$)**：即我們最終要對齊的 LLM，負責給定 Prompt $s_t$ 後生成下一個 Token $a_t$。
* **Critic Network ($V_\phi$)**：價值網路（Value Model），輸入 Prompt 與已生成的 Token 前綴 $s_t$，預估從當前狀態開始直到生成結束的期望總累積獎勵 $V_\phi(s_t)$。

```
     [ Prompt (s_t) ]
         /      \
        v        v
  [ Actor π_θ ]  [ Critic V_φ ]
       |             |
  (Token a_t)   (Value V(s_t))
```

### Generalized Advantage Estimation (GAE)

為了解決直接用單步 Temporal Difference (TD) 誤差方差大、用整段 MC (Monte Carlo) 累積回報偏差大的問題，PPO 使用 GAE 方程式來計算優勢 $\hat{A}_t$：

$$\delta_t^V = r_t + \gamma V_\phi(s_{t+1}) - V_\phi(s_t)$$

$$\hat{A}_t^{\text{GAE}(\gamma, \lambda)} = \sum_{l=0}^{\infty} (\gamma \lambda)^l \delta_{t+l}^V$$

其中 $\gamma$ 為折扣因子（Discount Factor），$\lambda \in [0, 1]$ 用於在方差與偏差之間進行折衷平衡。

## LLM RLHF 訓練中的四模型協同與顯存挑戰

將 PPO 應用於大語言模型時，系統需要維持多達 **4 個巨型神經網路** 協同運算：

1. **Actor Model ($\pi_\theta$)**：正處於 RL 梯度的 Policy 模型（需要計算 Gradient & Optimizer States）。
2. **Critic Model ($V_\phi$)**：估算 $V(s)$ 的 Value 模型（需要計算 Gradient & Optimizer States）。
3. **Reference Model ($\pi_{\text{ref}}$)**：凍結的原始 SFT 模型，用於計算每步 Token 的 KL 散逸懲罰 $D_{\text{KL}}(\pi_\theta || \pi_{\text{ref}})$（只需 Forward）。
4. **Reward Model ($r_\psi$)**：凍結的標註評分模型，用於在序列生成結束時給出標量 Reward（只需 Forward）。

<callout title="巨額顯存開銷與工程挑戰">
對於 70B 參數的模型，單是載入這 4 個模型就需數百 GB 的顯存。若算上 Actor 與 Critic 的 Adam 變異數/均值矩陣，顯存開銷更加龐大。這導致傳統 PPO 的吞吐率（Throughput）極低，極易發生 GPU OOM（Out of Memory），促使了後來 DPO 與 GRPO 等省去 Critic 的演算法誕生。
</callout>

## PPO 總損失函數

綜合上述元件，LLM 中的 PPO 總損失函數為：

$$\mathcal{L}_{\text{PPO}}(\theta, \phi) = \mathcal{L}^{\text{CLIP}}(\theta) - c_1 \mathcal{L}^{\text{VF}}(\phi) + c_2 S[\pi_\theta]$$

其中：
* $\mathcal{L}^{\text{VF}}(\phi) = \frac{1}{2} \left( V_\phi(s_t) - V_t^{\text{target}} \right)^2$ 為 Critic 網路的均方誤差。
* $S[\pi_\theta]$ 為策略的熵獎勵（Entropy Bonus），鼓勵模型維持一定的生成多樣性。

<reviewkit>
<takeaways>
* PPO 透過概率比率 $r_t(\theta)$ 與 Clipped Objective $\min(r_t A_t, \text{clip}(r_t, 1-\epsilon, 1+\epsilon) A_t)$，成功避免了策略更新過猛引發的衰退。
* PPO 採用 Actor-Critic 架構，利用 GAE (Generalized Advantage Estimation) 平衡優勢估算的方差與偏差。
* 在 LLM RLHF 訓練中，PPO 需要同時維護 Actor、Critic、Reference Model 與 Reward Model，帶來了極大的顯存與架構複雜度。
</takeaways>

<qprompt count=15 type=["mcq"]>
請根據本文關於 PPO (Proximal Policy Optimization) 的核心機制、Clipped Target 數學原理、Actor-Critic 雙網分工與 LLM 落地顯存開銷，設計選擇題以檢驗讀者理解。
</qprompt>

<qquiz>
{
  "questions": [
    {
      "id": "ppo_q1",
      "type": "single_choice",
      "question": "PPO 的 Clipped Objective 目標函數採用 $\\min(r_t(\\theta) A_t, \\text{clip}(r_t(\\theta), 1-\\epsilon, 1+\epsilon) A_t)$ 的主要目的是什麼？",
      "options": [
        "確保模型概率分佈恆等於高斯分佈",
        "在優勢值正負不同時採取悲觀剪裁，防止策略更新步長過大導致模型崩塌",
        "強制將梯度限定在 0 到 1 之間以防止梯度消失",
        "直接替代 Reward Model 進行偏好排序"
      ],
      "answer": 1,
      "explanation": "Clip 機制透過悲觀下界限定了新舊策略比率 $r_t$ 的變化幅度，防止好動作過度過擬合或壞動作引發策略崩潰。"
    },
    {
      "id": "ppo_q2",
      "type": "single_choice",
      "question": "在將 PPO 應用於 LLM 的 RLHF 訓練時，下列何者不是必須同時維護的模型？",
      "options": [
        "Actor Model (策略模型)",
        "Critic Model (價值模型)",
        "Discriminator Model (生成對抗網路判別器)",
        "Reference Model (參考模型)"
      ],
      "answer": 2,
      "explanation": "LLM 的 PPO RLHF 包含 Actor、Critic、Reference Model 與 Reward Model 四個模型，不包含 GAN 的 Discriminator。"
    }
  ]
}
</qquiz>
</reviewkit>
