<meta>
Title: Upside-Down RL：用想達成的結果指揮下一個動作
Summary: 理解 Upside-Down RL 如何把期望回報與時間範圍當成指令，以回頭標記的經驗訓練行為模型，並對照 Decision Transformer。
Slug: upside-down-rl-zh-tw
Output: notes/upside-down-rl/upside-down-rl-zh-tw.html
CanonicalId: upside-down-rl
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: reinforcement learning, Upside-Down RL, return conditioning, supervised learning
Status: drafting
LastModified: 2026-10-10
</meta>

<draft>
- TLDR：把想拿到多少回報、還有多少時間當成指令，直接學在該指令下要做什麼。
- MainFlow：傳統問法 → 指令條件 → 回頭標記訓練 → 互動循環 → 與 Decision Transformer 對照。
- Scope：概念技術報告與實作論文；作為 DT 的短篇前驅筆記。
- FollowUps：作者全盤 proofread；留意不同論文版本的實作細節。
</draft>

# Upside-Down RL：用想達成的結果指揮下一個動作

一般強化學習常先問「這個動作未來可能拿到多少分？」，再依預測選動作。Upside-Down RL（UDRL）把方向翻過來：先給模型一個**想拿到的回報**及**剩餘時間範圍**，直接問「在目前情境與這個指令下，下一步該做什麼？」這也是名稱中 *Upside-Down* 的意思。[概念報告](https://arxiv.org/abs/1912.02875)

## 1. 指令多了哪兩個條件？

UDRL 的行為模型讀取目前狀態（必要時包含歷史）與一個指令 `c = (目標回報, 剩餘步數)`，輸出動作。目標回報表示想得到多少獎勵；剩餘步數表示希望在多長時間內達成。相同狀態下，「五步內爭取高回報」與「二十步內達成較低回報」是不同條件，模型可以據此選擇不同行動。[實作論文 §2](https://arxiv.org/html/1912.02877)

## 2. 沒有現成的「願望標籤」，怎麼訓練？

先收集真實互動軌跡，再從軌跡中選一段：起點的狀態、該段第一個動作，以及這段**實際取得的總回報與耗費步數**。把後兩個結果回頭當成起點的指令，就得到一筆監督式樣本：

```text
輸入：起點狀態 +「在 H 步得到 R 回報」
標籤：該段實際採取的第一個動作
```

這叫用已發生的結果**回頭標記指令**。模型學的是「過去在某種結果條件下採取過什麼動作」，而不是直接預測環境獎勵。實作論文再用訓好的行為模型與環境互動、收集新軌跡、更新資料集，形成反覆改進的循環。[實作論文 §2–3](https://arxiv.org/html/1912.02877)

互動時，若已收到獎勵，就從剩餘目標回報扣除；時間往前一步，就把剩餘步數減一。這讓下一步的指令仍表示「接下來還希望完成什麼」。[實作論文 §2](https://arxiv.org/html/1912.02877)

## 3. 為什麼值得和 Decision Transformer 一起讀？

UDRL 早於 <content-link canonical="decision-transformer">Decision Transformer（DT）</content-link>，清楚提出**用期望結果條件化動作預測**的觀點。DT 沿著相近想法，把離線軌跡排成 `RTG, state, action` 的 token 序列，用因果 Transformer 訓練；原始 UDRL 的指令則同時含回報與時間範圍，實作工作也強調互動收集與再訓練。它們共享「結果條件 → 行動」的方向，但資料流程與模型形式不同。[DT 原論文 §2–3](https://arxiv.org/html/2106.01345)；[UDRL 實作論文](https://arxiv.org/abs/1912.02877)

需要守住一個界線：指令是**要求**，不是**保證**。若資料裡沒有對應高回報的可學行為，只把數字調高，不會憑空產生成功策略。實作論文也討論模型可能忽略指令的問題，因此如何讓條件真正影響行動，是方法是否有效的關鍵。[實作論文 §3–4](https://arxiv.org/html/1912.02877)

## 參考資料（References）

1. Schmidhuber, J. (2019/2020). Reinforcement Learning Upside Down: Don’t Predict Rewards - Just Map Them to Actions. *arXiv preprint*. [arXiv:1912.02875](https://arxiv.org/abs/1912.02875)。
2. Srivastava, R. K., Shyam, P., Mutz, F., Jaśkowski, W., & Schmidhuber, J. (2019). Training Agents using Upside-Down Reinforcement Learning. *arXiv preprint*. [arXiv:1912.02877](https://arxiv.org/abs/1912.02877)。
3. Chen, L., et al. (2021). Decision Transformer: Reinforcement Learning via Sequence Modeling. *Advances in Neural Information Processing Systems 34*. [NeurIPS 論文頁](https://proceedings.neurips.cc/paper_files/paper/2021/hash/7f489f642a0ddb10272b5c31057f0663-Abstract.html)。

<reviewkit>
<takeaways>
- UDRL 用目標回報與剩餘步數作指令，直接預測下一個動作。
- 指令可由已完成的軌跡片段回頭標記，再以監督式學習訓練。
- 它是 DT 的重要概念前驅；兩者的模型形式與資料收集流程不同。
- 模型必須真正使用指令，而且目標仍受可學經驗的範圍限制。
</takeaways>
<qprompt/>
</reviewkit>
