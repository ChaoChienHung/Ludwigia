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
LastModified: 2026-10-08
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

DPO 的核心數學貢獻在於：**帶 KL 懲罰的獎勵最大化問題，其最優策略有閉式解；反過來可用策略與參考模型的對數機率比表示獎勵差。** 在 Bradley–Terry 偏好模型等假設下，這讓我們不必顯式訓練 Reward Model 或執行 PPO，就能用離線偏好配對直接優化策略。閉式解描述的是理想化的最優策略；有限模型、有限且有噪聲的資料，不保證訓練結果與 RLHF 完全等價。

本文將帶領讀者完整還原 DPO 的數學推導過程、損失函數語意，並剖析其與 PPO/GRPO 的長短板。

## DPO 數學推導：從 RLHF 到離線閉式解

### 1. 標準 RLHF 目標函數

在傳統 RLHF 中，給定 Prompt $x$，我們希望優化策略 $\pi_\theta(y|x)$ 以極大化獎勵模型 $r(y|x)$ 的得分，同時受限於與參考模型 $\pi_{\text{ref}}(y|x)$ 的 KL 散逸：

$$\max_{\pi_\theta} \mathbb{E}_{x \sim \mathcal{D}, y \sim \pi_\theta(y|x)} \left[ r(x, y) \right] - \beta D_{\text{KL}}(\pi_\theta(y|x) || \pi_{\text{ref}}(y|x))$$

這可以重寫為求期望的最大化：

$$\max_{\pi_\theta} \mathbb{E}_{x \sim \mathcal{D}} \left[ \mathbb{E}_{y \sim \pi_\theta(y|x)} \left[ r(x,y) - \beta \log \frac{\pi_\theta(y|x)}{\pi_{\text{ref}}(y|x)} \right] \right]$$

### 2. 最優策略的閉式解 (Closed-Form Solution)

固定一個 Prompt $x$，令 $\pi(y|x)$ 為待求的分佈。把 KL 項展開，並用拉格朗日乘子 $\lambda$ 約束 $\sum_y \pi(y|x)=1$。對每個 $\pi(y|x)$ 求導並令其為零：

$$r(x,y)-\beta\left(\log\frac{\pi(y|x)}{\pi_{\text{ref}}(y|x)}+1\right)+\lambda=0$$

移項、取指數後，所有與 $y$ 無關的項併入正規化常數，可得最優策略 $\pi^*$：

$$\pi^*(y|x) = \frac{1}{Z(x)} \pi_{\text{ref}}(y|x) \exp \left( \frac{1}{\beta} r(x, y) \right)$$

其中 $Z(x) = \sum_y \pi_{\text{ref}}(y|x) \exp \left( \frac{1}{\beta} r(x, y) \right)$ 為歸一化配分函數（Partition Function）：先以 $e^{r/\beta}$ 放大高獎勵回答的權重，再用 $Z(x)$ 讓機率總和回到 1。$\beta$ 越大，獎勵造成的重新加權越溫和，策略越接近參考模型。

將兩邊取對數並移項，我們可以導出**隱性獎勵函數（Implicit Reward Function）** 的精確表達式：

$$r(x, y) = \beta \log \frac{\pi^*(y|x)}{\pi_{\text{ref}}(y|x)} + \beta \log Z(x)$$

<block>
title: 核心神來之筆：將 Reward 重參數化為 Policy
content:
這個公式意味著：**我們不需要單獨訓練一個 Reward Model $r(x, y)$！**
對同一個 Prompt 的兩個回答，Policy 與 Reference Policy 的對數機率比足以求出**獎勵差**；單個回答的絕對獎勵仍含有 $\beta\log Z(x)$。DPO 訓練時以參數化模型 $\pi_\theta$ 取代理論上的 $\pi^*$，從偏好資料學到對應的隱性獎勵差。
</block>

### 3. 結合 Bradley-Terry 偏好模型

人類偏好通常以成對數據（Pairwise Dataset）形式給出 $\mathcal{D} = \{(x, y_w, y_l)\}$，其中 $y_w$ 表示偏好的回答（Winning Response），$y_l$ 表示較差的回答（Losing Response）。

根據經典的 Bradley-Terry 偏好模型，人類選擇 $y_w$ 勝過 $y_l$ 的概率為：

$$P(y_w \succ y_l | x) = \sigma (r(x, y_w) - r(x, y_l))$$

其中 $\sigma(t) = \frac{1}{1 + e^{-t}}$ 為 Sigmoid 函數：分數相同時偏好機率為 $0.5$，分數差為 $1$ 時約為 $0.73$。它只依賴兩個回答的分數差；這種 logistic 成對比較形式也出現在推薦系統的 BPR，只是 BPR 通常比較使用者對兩個物品的預測分數，而 DPO 使用語言模型相對於參考模型的對數機率比。

將剛剛的獎勵公式分別套用在 $y_w$ 與 $y_l$。因為兩個回答共享同一個 Prompt $x$，其 $\beta\log Z(x)$ 相同，相減時**完全抵消**，因此無須枚舉所有可能回答來計算配分函數：

$$r(x, y_w) - r(x, y_l) = \beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}$$

### 4. DPO 損失函數 (DPO Loss)

令 $\Delta_\theta=r_\theta(x,y_w)-r_\theta(x,y_l)$。Bradley–Terry 模型把 $\sigma(\Delta_\theta)$ 視為人會選 $y_w$ 的機率。資料中的標籤是「$y_w$ 勝出」（二元標籤 1），所以最大化其對數似然，等同最小化該標籤的二元交叉熵 $-\log\sigma(\Delta_\theta)$。用可訓練的 $\pi_\theta$ 取代理論上的 $\pi^*$，並對固定的偏好資料集取平均，即得 **DPO Loss**：

$$\mathcal{L}_{\text{DPO}}(\theta) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)} \right) \right]$$

這是「監督式形式的偏好優化」，但不是一般只模仿 chosen 回答的 SFT：它同時比較 chosen 與 rejected，並以固定的 Reference Policy 為基準。例如兩個回答相對於參考模型的機率都提高兩倍，兩個 log-ratio 同增 $\log 2$，差距不變；只有 chosen 的**相對**變化大於 rejected，DPO 的偏好分數才提高。

## DPO Loss 的物理語意與梯度解析

定義 $\hat r_\theta(x,y)=\beta\log[\pi_\theta(y|x)/\pi_{\text{ref}}(y|x)]$；同一 Prompt 的兩個 $\hat r$ 相減即為上節的 $\Delta_\theta$。對 DPO Loss 求關於參數 $\theta$ 的梯度，可看出其動態權重：

$$\nabla_\theta \mathcal{L}_{\text{DPO}}(\theta) = -\beta \mathbb{E}_{(x, y_w, y_l)} \left[ \underbrace{\sigma \left( \hat{r}_\theta(x, y_l) - \hat{r}_\theta(x, y_w) \right)}_{\text{動態標量權重 (Dynamic Weight)}} \left( \nabla_\theta \log \pi_\theta(y_w|x) - \nabla_\theta \log \pi_\theta(y_l|x) \right) \right]$$

* **方向指引**：對單個配對，梯度的直接目標是提高 $\log\pi_\theta(y_w|x)-\log\pi_\theta(y_l|x)$。由於模型參數共享且機率須正規化，不能保證每次更新都讓 chosen 的絕對機率上升、rejected 的絕對機率下降；應觀察的是兩者的**相對差距**。
* **動態權重（Dynamic Weighting）**：當模型已經能很好地區分 $y_w$ 與 $y_l$（即估算的隱性獎勵差很大時），Sigmoid 權重趨近於 0，梯度更新自動變小；反之，若模型誤判（將 $y_l$ 評高於 $y_w$），權重會增大，給予強烈的校正梯度。

## DPO 的優勢與局限性

<callout title="DPO 與 Online RL (PPO / GRPO) 的工程權衡">
* **優勢**：
  1. **無線上採樣開銷**：原版 DPO 使用固定的偏好配對，訓練步驟不需要重新生成回答。
  2. **架構較簡**：省去顯式 Reward Model 與 Critic，但仍須計算可訓練 Policy 和固定 Reference Policy 對配對的 log-probability；實際速度及記憶體收益取決於實作。
  3. **訓練流程較直接**：可用一般反向傳播，免去 PPO 的採樣與價值估計；仍可能遇到資料噪聲、模型退化或超參數問題。
* **局限性（Why RL is Still Needed?）**：
  1. **原版缺少線上探索**：固定資料集沒有對未收集的回答提供直接偏好訊號；模型仍可泛化到未見回答，但缺少訓練中主動生成與評估新候選的迴圈。這是原版離線資料設定的限制，不是「沒有顯式 Reward Model」必然造成的限制。
  2. **對標註噪聲敏感**：若離線資料中存在錯誤的偏好標註，DPO 容易過擬合錯誤樣本。
  3. **資料覆蓋與信用分配**：整段回答的成對偏好不直接指出哪一步推理有功或有錯；在可驗證任務中，線上採樣及結果回饋可能提供更多新訊號，但 PPO / GRPO 的序列級獎勵也不會自動解決 token 級信用分配。
</callout>

## 實作檢查：正確計算 $\log \pi_\theta(y|x)$

原始 DPO 的序列機率遵循自迴歸分解：

$$\log \pi_\theta(y|x)=\sum_{t=1}^{|y|}\log\pi_\theta(y_t\mid x,y_{<t})$$

閱讀 Deepak Kumar Sahoo 的示意訓練迴圈時，尤其要檢查以下三點；該篇程式片段不宜直接視為正確的 DPO 實作。

1. **下一 token 對齊**：位置 $t$ 的 logits 預測位置 $t+1$ 的 token。若手動 `gather`，需對齊 `logits[:, :-1]` 與 `input_ids[:, 1:]`；原片段把未位移的 logits 與同位置 token 配對。
2. **只保留回答 token**：遮住 Prompt 與 padding，保留回答（以及若納入序列定義的 EOS）之 log-probability。原片段傳入 Prompt IDs 卻未用來製作回答遮罩。若兩個回答共享完全相同的 Prompt 且使用總和，Prompt 項在差分中原可抵消；配合平均或不同截斷時不可仰賴此性質。
3. **跨 token 求總和**：整段回答的機率是 token 條件機率之乘積，因此 log-probability 必須求**總和**。原片段使用平均值，算的是每 token 幾何平均機率，已不是原始 DPO 目標。總和與平均都可能帶來不同的長度效應，不能單憑平均法斷言偏差方向。

## 參考資料（References）

1. Rafailov, R., Sharma, A., Mitchell, E., Manning, C. D., Ermon, S., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). NeurIPS 2023。
2. Sahoo, D. K. (2025). [Direct Preference Optimization (DPO): An In-depth Analysis](https://medium.com/the-synaptic-stack/direct-preference-optimization-dpo-an-in-depth-analysis-62a3d1f343a4). *The Synaptic Stack*。其中手寫訓練迴圈僅作概念示意，見上節校正。
3. Rendle, S., Freudenthaler, C., Gantner, Z., & Schmidt-Thieme, L. (2009). [BPR: Bayesian Personalized Ranking from Implicit Feedback](https://proceedings.mlr.press/r7/rendle09a.html). UAI 2009。

<reviewkit>
<takeaways>
* DPO (Direct Preference Optimization) 證明了帶 KL 懲罰的最優 RLHF 策略，可將 Reward 重參數化為 Policy 與 Reference Model 的 Log-Ratio。
* DPO 將 RLHF 簡化為離線二元交叉熵 Loss：$\mathcal{L}_{\text{DPO}} = -\mathbb{E} [\log \sigma( \beta \log \frac{\pi_\theta(y_w)}{\pi_{\text{ref}}(y_w)} - \beta \log \frac{\pi_\theta(y_l)}{\pi_{\text{ref}}(y_l)} )]$。
* 原版 DPO 免去訓練期線上採樣、Critic 與顯式 Reward Model；固定偏好資料限制了直接探索新候選的能力，但不代表模型無法泛化，或在線上回饋方法必然較好。
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
        "固定偏好數據集不提供訓練中對新生成回答的直接偏好回饋",
        "完全無法使用 GPU 進行平行化計算"
      ],
      "answer": 2,
      "explanation": "原版 DPO 使用固定偏好配對更新模型；若要在線上接觸新候選回答，需另外建立採樣與回饋資料迴圈。"
    }
  ]
}
</qquiz>
</reviewkit>
