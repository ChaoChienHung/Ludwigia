<meta>
Title: Decision Transformer：把離線強化學習改寫成條件式序列預測
Summary: 從行為複製的限制出發，理解 Decision Transformer 如何用目標回報、狀態與動作組成序列，以及訓練與部署時的回報更新。
Slug: decision-transformer-zh-tw
Output: notes/decision-transformer/decision-transformer-zh-tw.html
CanonicalId: decision-transformer
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: reinforcement learning, offline reinforcement learning, Decision Transformer, sequence modeling
Status: drafting
LastModified: 2026-10-10
</meta>

<draft>
- TLDR：給模型一段過去經驗和想達到的回報，讓它預測下一個動作；訓練目標仍是監督式的動作預測。
- MainFlow：離線資料的問題 → 回報條件 → 三元 token 序列 → 訓練 → 推理時更新目標 → 與其他方法的邊界。
- Scope：原始 Decision Transformer；不把後續變體當成原論文機制。
- FollowUps：作者全盤 proofread；檢查與 Upside-Down RL 的歷史定位和例子的回報定義。
</draft>

# Decision Transformer：把離線強化學習改寫成條件式序列預測

想像我們只有一批已完成的遊戲紀錄：每一步有哪些**狀態**、採取什麼**動作**、得到多少**獎勵**。最直接的行為複製會模仿紀錄裡所有動作；但資料有好局也有壞局，同一種狀態附近可能出現品質不同的行動。我們需要一個額外線索，告訴模型「這次要模仿哪一類結果」。[原論文摘要](https://proceedings.neurips.cc/paper_files/paper/2021/hash/7f489f642a0ddb10272b5c31057f0663-Abstract.html)

Decision Transformer（DT）的做法是：把**期望達成的回報**當成輸入條件，連同先前狀態與動作交給因果 Transformer，預測下一個動作。這讓離線強化學習問題可以用序列模型和監督式損失來處理。[原論文 §3](https://arxiv.org/html/2106.01345)

## 1. 先釐清「目標回報」是什麼

一條軌跡在時間點 `t` 的 **return-to-go（RTG）**，是從該步到軌跡結束的獎勵總和：

```text
RTG_t = r_t + r_(t+1) + ... + r_T
```

例如某條軌跡後續三步的獎勵是 `1, 0, 2`，相應的 RTG 是 `3, 2, 2`。訓練時，RTG 由**已完成軌跡的實際獎勵**倒推；部署時，起點的 RTG 則由我們指定為**希望達到的回報**。因此，推理輸入中的高目標只是條件，並非模型已保證能拿到的成績。[原論文 §3.1–3.2](https://arxiv.org/html/2106.01345)

## 2. 軌跡如何變成 Transformer 的輸入？

DT 將每一步排成三種 token：`(RTG_t, state_t, action_t)`。連續多步串起來，形如：

```text
RTG_1, state_1, action_1, RTG_2, state_2, action_2, ...
```

模型只看得到目前以前的 token。在 `RTG_t` 與 `state_t` 之後，它預測 `action_t`；動作發生後，環境才給出獎勵和下一個狀態。實作會取最近 `K` 步作上下文，並為各 token 加入時間步資訊。**RTG、狀態、動作都是輸入序列中的不同位置**，不是先產生一個商品或動作候選，再啟動 reasoning。[原論文 §3.1](https://arxiv.org/html/2106.01345)

## 3. 訓練與推理各做什麼？

訓練時，從固定的離線軌跡切出片段，給模型 RTG、狀態和先前動作，要求它還原資料裡的下一個動作。離散動作可用分類損失，連續動作可用迴歸損失。主要目標是**動作預測**；原始 DT 不需要先學一個 Q 值函數，也不靠 Bellman backup 更新價值。[原論文 §3.1](https://arxiv.org/html/2106.01345)

推理時先選目標回報 `R`，輸入當前狀態，產生並執行動作。環境回傳本步獎勵 `r` 後，把下一步的剩餘目標設為 `R - r`，再加入新狀態繼續預測。這裡的減法是**更新尚未達成的回報條件**，不是重新訓練模型。[原論文 §3.2](https://arxiv.org/html/2106.01345)

## 4. 它與其他路線差在哪裡？

一般行為複製只問「在這個狀態，資料中的人做了什麼？」DT 還問「**要達到這個回報**時，資料中相應的行動模式是什麼？」傳統 value-based 離線 RL 則會估計動作價值，再用價值來選動作。DT 沒有把這個估值步驟放進核心訓練目標。[原論文 §1、§3](https://arxiv.org/html/2106.01345)

這個「由期望結果反過來決定動作」的觀念，早於 DT 就出現在 <content-link canonical="upside-down-rl">Upside-Down RL</content-link>。兩者都用結果條件做監督式動作學習；原始 Upside-Down RL 的指令還明確包含**剩餘時間範圍**，而 DT 用 **RTG／狀態／動作的因果序列**與離線軌跡訓練。DT 論文也明確列出 Upside-Down RL 為相關工作。[DT 原論文 §2](https://arxiv.org/html/2106.01345)；[Upside-Down RL 原文](https://arxiv.org/abs/1912.02875)

最後要注意：把目標回報設得比資料中任何軌跡都高，模型仍可能輸出動作，但**高條件不等於高績效保證**。它學到的是資料支持的條件式行為；超出資料範圍時能否泛化，要靠實驗驗證。這是從訓練設定推得的實務邊界，而非單憑輸入目標就能消除的問題。

## 參考資料（References）

1. Chen, L., et al. (2021). Decision Transformer: Reinforcement Learning via Sequence Modeling. *Advances in Neural Information Processing Systems 34*. [NeurIPS 論文頁](https://proceedings.neurips.cc/paper_files/paper/2021/hash/7f489f642a0ddb10272b5c31057f0663-Abstract.html)。
2. Schmidhuber, J. (2019/2020). Reinforcement Learning Upside Down: Don’t Predict Rewards - Just Map Them to Actions. *arXiv preprint*. [arXiv:1912.02875](https://arxiv.org/abs/1912.02875)。

<reviewkit>
<takeaways>
- DT 用目標回報、狀態、動作的因果序列，預測下一個動作。
- 訓練 RTG 由軌跡的實際獎勵倒推；推理 RTG 是指定目標，獲得獎勵後逐步扣除。
- 核心訓練是監督式動作預測，不依賴 Q 值學習或 Bellman backup。
- Upside-Down RL 是重要前驅；高目標條件本身不保證模型能超出資料能力。
</takeaways>
<qprompt/>
</reviewkit>
