<meta>
Title: 告別 RL 的偏好對齊：DPO (Direct Preference Optimization) 數學推導與實務解析
Summary: 本文深入剖析 DPO (Direct Preference Optimization) 演算法，解構其如何利用 Bradley-Terry 偏好模型，將隱性 Reward Function 參數化為 Policy 與 Reference Model 的 Log-Likelihood 比率，進而將複雜的 RLHF 轉化為極簡的離線二元交叉熵優化，並對比其與 PPO/GRPO 的長短板。
Slug: dpo-direct-preference-optimization-zh-tw
Output: notes/dpo-direct-preference-optimization/dpo-direct-preference-optimization-zh-tw.html
CanonicalId: dpo-direct-preference-optimization
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: reinforcement learning, dpo, rlhf, deep learning
Status: drafting
Published: 2026-08-29
LastModified: 2026-08-29
</meta>

<draft>
- 1. 前言：為什麼我們想繞過強化學習？
    - 傳統 RLHF (PPO) 的動態採樣、 Reward Model 不穩定性與顯存昂貴痛點。
    - DPO (Rafailov et al., 2023) 的破局思路：直接在偏好數據上記算 Loss。
- 2. DPO 數學推導：從 RLHF 目標到閉式解 (Closed-Form Solution)
    - 帶 KL 懲罰的標準 RLHF 目標函數。
    - 偏好模型：Bradley-Terry Model 的概率定義 $P(y_w \succ y_l | x)$。
    - 關鍵變換：將 Reward 顯式重參數化為 $r(x, y) = \beta \log \frac{\pi_\theta(y|x)}{\pi_{\text{ref}}(y|x)} + \beta \log Z(x)$。
- 3. DPO 損失函數與物理語意
    - $\mathcal{L}_{\text{DPO}}$ 二元交叉熵形式。
    - 隱性獎勵與動態權重的物理直覺（Implicit Reward & Dynamic Weighting）。
- 4. DPO vs. PPO / GRPO 的工程權衡與局限性
    - 優勢：極速訓練、無需 Online Sampling、無 Critic 顯存開銷。
    - 局限性：對離線資料庫（Offline Pairwise Dataset）極度敏感、缺少探索 (Exploration) 與長鏈條推理進化能力。
- 5. 結語
</draft>


# 告別 RL 的偏好對齊：DPO (Direct Preference Optimization) 數學推導與實務解析

在大語言模型（LLM）的偏好對齊領域，傳統 RLHF (PPO) 雖然效果顯著，但其訓練過程極不穩定、超參數敏感，且需要同時載入四個大型神經網路。由 Rafailov 等人於 2023 年提出的 **DPO（Direct Preference Optimization，直接偏好優化）**，打破了「偏好對齊必須依賴強化學習（RL）」的迷思。

DPO 的核心數學貢獻在於：**證明了帶 KL 散逸約束的 RLHF 最優策略，可以用 Reward Model 的閉式解（Closed-Form Solution）精確替換**。透過將隱性獎勵函數（Implicit Reward Function）直接參數化為策略模型本身，DPO 將繁複的 RLHF 轉化為標準的離線二元交叉熵（Binary Cross-Entropy）分類優化。

本文將帶領讀者完整還原 DPO 的數學推導過程、損失函數語意，並剖析其與 PPO/GRPO 的長短板。

## DPO 數學推導：從 RLHF 到離線閉式解

### 1. 標準 RLHF 目標函數

在傳統 RLHF 中，給定 Prompt $x$，我們希望優化策略 $\pi_\theta(y|x)$ 以極大化獎勵模型 $r(y|x)$ 的得分，同時受限於與參考模型 $\pi_{\text{ref}}(y|x)$ 的 KL 散逸：

$$\max_{\pi_\theta} \mathbb{E}_{x \sim \mathcal{D}, y \sim \pi_\theta(y|x)} \left[ r(x, y) \right] - \beta D_{\text{KL}}(\pi_\theta(y|x) || \pi_{\text{ref}}(y|x))$$

這可以重寫為求期望的最大化：

$$\max_{\pi_\theta} \mathbb{E}_{x \sim \mathcal{D}} \left[ \mathbb{E}_{y \sim \pi_\theta(y|x)} \left[ r(x,y) - \beta \log \frac{\pi_\theta(y|x)}{\pi_{\text{ref}}(y|x)} \right] \right]$$

### 2. 最優策略的閉式解 (Closed-Form Solution)

數學上可以證明（利用 Gibbs 分佈與 Jensen 不等式），上述優化問題的最優策略 $\pi^*$ 滿足如下關係：

$$\pi^*(y|x) = \frac{1}{Z(x)} \pi_{\text{ref}}(y|x) \exp \left( \frac{1}{\beta} r(x, y) \right)$$

其中 $Z(x) = \sum_y \pi_{\text{ref}}(y|x) \exp \left( \frac{1}{\beta} r(x, y) \right)$ 為歸一化配分函數（Partition Function）。

將兩邊取對數並移項，我們可以導出**隱性獎勵函數（Implicit Reward Function）** 的精確表達式：

$$r(x, y) = \beta \log \frac{\pi^*(y|x)}{\pi_{\text{ref}}(y|x)} + \beta \log Z(x)$$

<block>
title: 核心神來之筆：將 Reward 重參數化為 Policy
content:
這個公式意味著：**我們不需要單獨訓練一個 Reward Model $r(x, y)$！**
只要我們知道當前 Policy $\pi_\theta$ 與 Reference Policy $\pi_{\text{ref}}$ 對回答 $y$ 的相對概率比值，就能直接推算出該回答隱含的 Reward 得分。
</block>

### 3. 結合 Bradley-Terry 偏好模型

人類偏好通常以成對數據（Pairwise Dataset）形式給出 $\mathcal{D} = \{(x, y_w, y_l)\}$，其中 $y_w$ 表示偏好的回答（Winning Response），$y_l$ 表示較差的回答（Losing Response）。

根據經典的 Bradley-Terry 偏好模型，人類選擇 $y_w$ 勝過 $y_l$ 的概率為：

$$P(y_w \succ y_l | x) = \sigma (r(x, y_w) - r(x, y_l))$$

其中 $\sigma(t) = \frac{1}{1 + e^{-t}}$ 為 Sigmoid 函數。

將我們剛剛導出的隱性獎勵公式代入 Bradley-Terry 模型中，注意項 $\beta \log Z(x)$ 在相減時**完全抵消**：

$$r(x, y_w) - r(x, y_l) = \beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}$$

### 4. DPO 損失函數 (DPO Loss)

對偏好對數據極大化對數似然（Negative Log-Likelihood），便得到極簡的 **DPO Loss**：

$$\mathcal{L}_{\text{DPO}}(\theta) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)} \right) \right]$$

## DPO Loss 的物理語意與梯度解析

對 DPO Loss 求關於參數 $\theta$ 的梯度，可以揭示其背後的動態調節機制：

$$\nabla_\theta \mathcal{L}_{\text{DPO}}(\theta) = -\beta \mathbb{E}_{(x, y_w, y_l)} \left[ \underbrace{\sigma \left( \hat{r}_\theta(x, y_l) - \hat{r}_\theta(x, y_w) \right)}_{\text{動態標量權重 (Dynamic Weight)}} \left( \nabla_\theta \log \pi_\theta(y_w|x) - \nabla_\theta \log \pi_\theta(y_l|x) \right) \right]$$

* **方向指引**：梯度會**推高**勝出回答 $\log \pi_\theta(y_w|x)$ 的生成概率，同時**壓低**失敗回答 $\log \pi_\theta(y_l|x)$ 的生成概率。
* **動態權重（Dynamic Weighting）**：當模型已經能很好地區分 $y_w$ 與 $y_l$（即估算的隱性獎勵差很大時），Sigmoid 權重趨近於 0，梯度更新自動變小；反之，若模型誤判（將 $y_l$ 評高於 $y_w$），權重會增大，給予強烈的校正梯度。

## DPO 的優勢與局限性

<callout title="DPO 與 Online RL (PPO / GRPO) 的工程權衡">
* **優勢**：
  1. **無 Sampling 開銷**：不需要在訓練時調用模型大量生成文本。
  2. **架構極簡**：省去 Critic Model 與 Reward Model，訓練速度快數倍，顯存開銷小。
  3. **穩定收斂**：標準的二元交叉熵 Loss，無 RL 中的方差爆炸與 Policy 崩塌隱患。
* **局限性（Why RL is Still Needed?）**：
  1. **高度依賴離線偏好集**：DPO 無法探索離線資料庫 $\mathcal{D}$ 以外的未知輸出空間（No Active Exploration）。
  2. **對標註噪聲敏感**：若離線資料中存在錯誤的偏好標註，DPO 容易過擬合錯誤樣本。
  3. **長鏈條推理 (CoT) 瓶頸**：在數學、程式碼等需要多步推理的任務中，DPO 很難單靠離線成對數據引發自發的推理進化，此時 GRPO / PPO 的 Online 反饋仍具備顯著優勢。
</callout>

<reviewkit>
<takeaways>
* DPO (Direct Preference Optimization) 證明了帶 KL 懲罰的最優 RLHF 策略，可將 Reward 重參數化為 Policy 與 Reference Model 的 Log-Ratio。
* DPO 將 RLHF 簡化為離線二元交叉熵 Loss：$\mathcal{L}_{\text{DPO}} = -\mathbb{E} [\log \sigma( \beta \log \frac{\pi_\theta(y_w)}{\pi_{\text{ref}}(y_w)} - \beta \log \frac{\pi_\theta(y_l)}{\pi_{\text{ref}}(y_l)} )]$。
* DPO 免去了在訓練期線上 Sampling、Critic 網路與 Reward Model，但在探索能力 (Exploration) 與長鏈條推理進化上弱於 Online RL (如 GRPO)。
</takeaways>

<qprompt count=15 type=["mcq"]>
請根據本文關於 DPO (Direct Preference Optimization) 的數學推導、隱性 Reward 參數化、Bradley-Terry 模型結合以及與 PPO/GRPO 的比較，設計選擇題以檢驗讀者理解。
</qprompt>

<qquiz>
{
  "questions": [
    {
      "id": "dpo_q1",
      "type": "single_choice",
      "question": "DPO 演算法最核心的數學突破是什麼？",
      "options": [
        "利用生成對抗網路 (GAN) 取代了標註數據",
        "證明了隱性 Reward Function 可以精確重參數化為 Policy 與 Reference Model 的 Log-Likelihood 比率",
        "發明了全新的 Monte Carlo 樹狀搜尋演算法",
        "將 Transformer 的 Attention 機制轉化為二階矩陣"
      ],
      "answer": 1,
      "explanation": "DPO 的主要貢獻是導出 $r(x,y) = \\beta \\log (\\pi_\\theta(y|x)/\\pi_{\\text{ref}}(y|x)) + \\beta \\log Z(x)$，從而省去了單獨訓練 Reward Model 的步驟。"
    },
    {
      "id": "dpo_q2",
      "type": "single_choice",
      "question": "相較於 GRPO 或 PPO 等 Online RL 演算法，DPO 的主要局限性為何？",
      "options": [
        "訓練記憶體開銷比 PPO 大數倍",
        "必須同時訓練 4 個巨型神經網路",
        "受限於離線偏好數據集 (Offline Pairwise Data)，缺乏主動探索 (Exploration) 與長鏈條推理自發進化的能力",
        "完全無法使用 GPU 進行平行化計算"
      ],
      "answer": 2,
      "explanation": "DPO 屬於 Offline 偏好對齊演算法，無法像 Online RL 那樣在訓練期間對新輸出的策略空間進行探索與採樣。"
    }
  ]
}
</qquiz>
</reviewkit>
