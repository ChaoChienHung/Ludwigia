<meta>
Title: DeepSeek-R1 的核心基石：GRPO (Group Relative Policy Optimization) 群體相對策略優化
Summary: 本文深入解析 GRPO (Group Relative Policy Optimization) 的演算機制與數學原理，剖析其如何藉由群體相對優勢 (Group Relative Advantage) 徹底擺脫傳統 PPO 昂貴的 Critic (Value Model) 網路開銷，並探討 Rule-based Reward、Format Reward 與 DeepSeek-R1 純 RL 自我推理進化的工程落地。
Slug: grpo-group-relative-policy-optimization-zh-tw
Output: notes/grpo-group-relative-policy-optimization/grpo-group-relative-policy-optimization-zh-tw.html
CanonicalId: grpo-group-relative-policy-optimization
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: reinforcement learning, grpo, ppo, rlhf, deep learning
Status: drafting
Published: 2026-08-29
LastModified: 2026-08-29
</meta>

<draft>
- 1. 前言：大語言模型 Reinforcement Learning 的新範式
    - 點出傳統 PPO 在大模型對齊時的顯存負擔與 Critic 模型瓶頸。
    - 引出 GRPO 的核心突破：用群體相對比較取代絕對價值評估。
- 2. PPO 痛點與 GRPO 核心破局點
    - 傳統 PPO 的 Actor-Critic 架構成本分析：為何 Value Model 需要與 Policy 同規模。
    - GRPO 的無 Critic 設計理念：直接採樣 $G$ 個候選回答並計算相對優勢。
- 3. GRPO 數學原理與演算法流程
    - 候選策略集生成 (Candidate Strategy Set Generation)。
    - 群體相對優勢計算 (Group Relative Advantage Normalization)：$A_i = \frac{R_i - \mu_R}{\sigma_R}$。
    - Clipped Surrogate Loss 與 KL 散逸懲罰機制。
- 4. LLM 獎勵信號的多元構建 (Reward Engineering)
    - 規則型獎勵 (Rule-based Reward)：數學與程式碼的絕對正確性驗證。
    - 格式型獎勵 (Format Reward)：約束模型產生結構化思考標籤 (如 `<think>...</think>`)。
    - 模型評分 (Reward Model) 與環境反饋。
- 5. DeepSeek-R1 中的落地實踐與思考湧現
    - DeepSeek-R1-Zero 純 RL 訓練：無需 SFT 的自我進化。
    - CoT (Chain-of-Thought) 長鏈條思考的強烈自發湧現。
- 6. [Callout] GRPO vs. PPO vs. DPO 架構全景對比
- 7. 結語
</draft>


# DeepSeek-R1 的核心基石：GRPO (Group Relative Policy Optimization) 群體相對策略優化

在基於強化學習（Reinforcement Learning, RL）的大語言模型（LLM）對齊與推理能力優化領域，**GRPO（Group Relative Policy Optimization，群體相對策略優化）** 是近年來最關鍵的演算突破之一。GRPO 最初由 DeepSeek 團隊在 *DeepSeekMath* 中提出，並隨後成為 *DeepSeek-R1* 強大推理解題能力的核心驅動引擎。

傳統的 RLHF（Human Feedback Reinforcement Learning）方法（例如 PPO）極度依賴一個與 Actor 模型相同規模的 Critic (Value) 模型來評估狀態價值。這種架構在訓練千億參數級別的大模型時，會帶來巨大的顯存負擔與系統複雜度。GRPO 巧妙地**廢除了獨立的 Critic 網路**，改採對同一 Prompt 採樣一組候選回答，並計算「群體內部相對優勢（Group Relative Advantage）」來指導策略更新。

本文將完整拆解 GRPO 的運作機制、數學推導、獎勵信號構造，以及在 DeepSeek-R1 中實現純 RL 推理能力湧現的落地經驗。

## PPO 的瓶頸與 GRPO 的破局思維

<block>
title: 核心痛點：為何傳統 PPO 難以擴展至極大規模 LLM 訓練？
content:
在標準 PPO 訓練中，系統必須同時維護 4 個巨型模型：**Actor (Policy)**、**Critic (Value)**、**Reference Model** 與 **Reward Model**。
其中 Critic 網路負責估算當前 Token 生成序列的累積期望回報 $V(s)$。為了獲得精確的估計，Critic 網路的參數量通常需要與 Actor 模型相當。這意味著顯存開銷翻倍，且 Value Network 的擬合難度會隨著輸出長度增加而劇烈上升。
</block>

GRPO 的核心突破在於：**不需要絕對的狀態價值估計，只需知道哪一個回答在「當前同組候選中表現更好」**。

對於給定的提示詞（Prompt）$q$，模型 $\pi_\theta$ 不再只生成一個回答，而是同步採樣生成包含 $G$ 個候選回答的策略組（Group of Candidate Strategies）：

$$\mathcal{O} = \{o_1, o_2, \dots, o_G\}$$

環境或獎勵函數對每個回答評定一個純數獎勵值（Scalar Reward）$R = \{R_1, R_2, \dots, R_G\}$。GRPO 直接利用這 $G$ 個獎勵值在群體內部的相對高低，計算出每個回答的「優勢（Advantage）」。

## GRPO 數學原理與優化目標

### 1. 群體相對優勢 (Group Relative Advantage)

GRPO 捨棄了 GAE（Generalized Advantage Estimation）與 Value 估算，採用群體內的 Z-score 標準化來定義相對優勢：

$$A_i = \frac{R_i - \text{mean}(R)}{\text{std}(R)} = \frac{R_i - \frac{1}{G}\sum_{j=1}^G R_j}{\sqrt{\frac{1}{G}\sum_{j=1}^G (R_j - \bar{R})^2 + \epsilon}}$$

其中 $\epsilon$ 為防止除以零的微小數值（如 $10^{-8}$）。

這個簡潔的公式蘊含了深刻的直覺：
* **高於平均值（$A_i > 0$）**：說明回答 $o_i$ 在當前組內表現優於平均，其對應的概率生成路徑會獲得正向鼓勵。
* **低於平均值（$A_i < 0$）**：說明回答 $o_i$ 低於平均水平，概率會受到抑制。
* **無縫基線消除（Baseline Elimination）**：同組採樣隱式地提供了一個高質量的相對基線（Baseline），徹底省去了獨立 Critic 模型的訓練。

### 2. GRPO 損失函數 (Objective Function)

GRPO 的總優化目標由兩部分組成：**PPO 風格的 Clipped Surrogate Loss** 以及 **KL 散逸懲罰 (KL Penalty)**。

$$\mathcal{L}_{\text{GRPO}}(\theta) = \mathbb{E}_{\substack{q \sim P(Q) \\ \{o_i\}_{i=1}^G \sim \pi_{\theta_{\text{old}}}(O|q)}} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \min \left( r_{i,t}(\theta) A_i, \text{clip}(r_{i,t}(\theta), 1-\epsilon, 1+\epsilon) A_i \right) - \beta D_{\text{KL}}(\pi_\theta || \pi_{\text{ref}}) \right]$$

其中重要性採樣比率（Importance Sampling Ratio）定義為：

$$r_{i,t}(\theta) = \frac{\pi_\theta(o_{i,t} | q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} | q, o_{i,<t})}$$

$D_{\text{KL}}(\pi_\theta || \pi_{\text{ref}})$ 用於防範 Policy 偏離初始參考模型過遠。DeepSeek 實作中常採用可直接估算的無偏 KL 散逸表示法：

$$D_{\text{KL}}(\pi_\theta || \pi_{\text{ref}}) = \frac{\pi_{\text{ref}}(o_{i,t} | q, o_{i,<t})}{\pi_\theta(o_{i,t} | q, o_{i,<t})} - \log \frac{\pi_{\text{ref}}(o_{i,t} | q, o_{i,<t})}{\pi_\theta(o_{i,t} | q, o_{i,<t})} - 1$$

## 獎勵信號的多元構建 (Reward Engineering)

在傳統 RLHF 中，獎勵主要依賴人類標註資料訓練的 Reward Model（RM）。然而 GRPO 的強大之處在於其能高度相容多元、客觀且無需人工標註的環境獎勵（Environment / Rule Rewards）：

1. **規則型獎勵 (Rule-based Accuracy Reward)**：
    * **數學問題**：比對最終輸出的答案數值是否與 Ground Truth 完全匹配（如 `Accuracy = 1.0` 或 `0.0`）。
    * **程式碼編譯**：將生成的 Code 送入單元測試（Unit Test），若通過測試則給予滿分，語法錯誤或執行逾時則扣分。
2. **格式型獎勵 (Format Reward)**：
    * 為了約束模型進行結構化思考，設置格式檢查器。例如規範回答必須將推理過程放在 `<think>` 與 `</think>` 標籤之間，最終答案放在指定區塊。符合格式給予正回饋，打破格式給予懲罰。
3. **神經網路評分模型 (Neural Reward Model)**：
    * 對於語意流暢度、文章結構等無唯一標準答案的任務，可引入預訓練的 Reward Model 給予連貫評分。

<callout title="擺脫 SFT 依賴：為什麼 GRPO 不需要標註的「正確思考過程」？">
傳統 Supervised Fine-Tuning (SFT) 需要大量人類專家撰寫的 Step-by-Step 思路（CoT）。但人類思考路徑可能並非神經網路的最優解。
GRPO 只檢驗「最終結果」與「結構規範」，讓模型自己在 $G$ 個嘗試中摸索。只要某個隨機嘗試產生了較好的思考步驟並導向正確答案，該嘗試的相對優勢 $A_i$ 便會凸顯，進而強化該推理模式。
</callout>

## DeepSeek-R1 實踐：長鏈條思考 (CoT) 的自發湧現

在 DeepSeek-R1-Zero 的實驗中，研究人員直接從 Base Model 出發，未經過任何 SFT 數據預熱，直接套用 GRPO 進行純強化學習訓練。

實驗觀測到了顯著的「**Aha Moment（頓悟時刻）**」：
* **自我修正 (Self-Correction)**：模型在面對複雜數學題時，會在 `<think>` 標籤中自發出現「Wait, let me double check my step...」等重新檢視邏輯的行為。
* **長思考鏈條 (Long CoT)**：隨著 GRPO 迭代代數增加，模型生成 `<think>` 的長度自然延伸，推導步驟越趨嚴密。
* **Zero-Shot 性能躍升**：在 AIME 2024 等高難度競賽級數學基準上，僅靠 GRPO 訓練的模型的準確率實現了跨越式提升。

## GRPO vs. PPO vs. DPO 對比

| 維度 | PPO (Proximal Policy Optimization) | GRPO (Group Relative Policy Optimization) | DPO (Direct Preference Optimization) |
| :--- | :--- | :--- | :--- |
| **Critic 網路** | 需要（規模同 Actor） | **不需要** | **不需要** |
| **獎勵來源** | Reward Model 評估 | 規則、RM、環境多源相對評估 | 離線成對標註偏好 $(y_w, y_l)$ |
| **採樣機制** | Online 單個 / 批量採樣 | **Online 同 Prompt 群體採樣 ($G \ge 4$)** | Offline 數據集對齊 |
| **顯存開銷** | 極高（4 模型同時載入） | **中低（省去 Critic 顯存）** | **極低（無 Sampling，雙模型 forward）** |
| **探索能力 (Exploration)** | 強 | **極強（群體多樣性推動創新）** | 弱（限於離線數據分佈） |

<reviewkit>
<takeaways>
* GRPO (Group Relative Policy Optimization) 核心在於廢除獨立 Critic Model，改以「群體採樣 + 相對優勢」更新策略。
* 群體優勢 $A_i = \frac{R_i - \bar{R}}{\sigma_R}$ 能自動消除 Baseline，極大減輕千億參數 LLM 的訓練顯存負擔。
* 結合 Rule-based Reward 與 Format Reward，GRPO 在 DeepSeek-R1 中實現了無需人工 SFT 的自發 Chain-of-Thought 與自我修正能力。
</takeaways>

<qprompt count=15 type=["mcq"]>
請根據本文關於 GRPO (Group Relative Policy Optimization) 的核心機制、數學推導、優化目標、顯存優勢與 DeepSeek-R1 實踐，設計相應的選擇題以檢驗讀者理解。
</qprompt>

<qquiz>
{
  "questions": [
    {
      "id": "grpo_q1",
      "type": "single_choice",
      "question": "GRPO (Group Relative Policy Optimization) 相較於傳統 PPO 演算法，最關鍵的架構簡化是什麼？",
      "options": [
        "廢除了 Reference Model，不再做 KL 散逸約束",
        "廢除了獨立的 Critic (Value Model) 網路，改用群體內相對獎勵估計優勢",
        "不再需要任何 Reward 評分，改採純監督學習",
        "將重要性採樣比率 (Importance Sampling Ratio) 設為常數 1.0"
      ],
      "answer": 1,
      "explanation": "GRPO 最主要的突破是省去了龐大的 Critic 網路，在相同的 Prompt 下採樣 G 個回答，藉由計算組內相對標準化得分得到 Advantage。"
    },
    {
      "id": "grpo_q2",
      "type": "single_choice",
      "question": "在 GRPO 中，針對包含 $G$ 個回答的群體，候選回答 $o_i$ 的優勢值 (Advantage) $A_i$ 是如何計算的？",
      "options": [
        "由 Critic 網路預測的 $V(s)$ 減去折扣獎勵和",
        "直接等於獎勵值 $R_i$",
        "將獎勵值 $R_i$ 進行群體內 Z-score 標準化：$(R_i - \\bar{R}) / \\sigma_R$",
        "計算回答 $o_i$ 與參考模型 output 之間的交叉熵"
      ],
      "answer": 2,
      "explanation": "GRPO 採用群體內的 Z-score 標準化 $A_i = (R_i - \\text{mean}(R)) / \\text{std}(R)$ 來代表該策略相對於群體平均的表現。"
    }
  ]
}
</qquiz>
</reviewkit>
