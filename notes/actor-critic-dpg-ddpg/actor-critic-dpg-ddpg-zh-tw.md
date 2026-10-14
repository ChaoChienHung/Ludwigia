<meta>
Title: 從 Actor-Critic 到 DPG、DDPG：連續動作的決策與穩定訓練
Summary: 從連續動作的問題出發，釐清 Actor-Critic、確定性策略梯度與 DDPG 的關係，並用四個網路、經驗回放和探索噪聲理解實際訓練。
Slug: actor-critic-dpg-ddpg-zh-tw
Output: notes/actor-critic-dpg-ddpg/actor-critic-dpg-ddpg-zh-tw.html
CanonicalId: actor-critic-dpg-ddpg
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: reinforcement learning, actor-critic, dpg, ddpg, continuous control
Status: drafting
LastModified: 2026-10-11
</meta>

# 從 Actor-Critic 到 DPG、DDPG：連續動作的決策與穩定訓練

想像機器手臂要決定關節力矩。動作不是「左／右」兩個選項，而是連續數值。Actor 可以直接輸出力矩；Critic 則估計「在這個狀態做這個動作，之後總共能得到多少回報」。這先建立了兩個角色，接下來才有「如何更新 Actor」以及「如何穩定訓練」兩個不同問題。

## 三個名稱各自回答什麼

| 名稱 | 回答的問題 | 核心 |
| --- | --- | --- |
| Actor-Critic | 決策和評估由誰負責？ | Actor 選動作，Critic 提供學習訊號；是一類架構，不指定唯一更新公式。 |
| DPG | 確定性 Actor 要如何更新？ | 用 Critic 對動作的梯度，沿著讓 Q 值提高的方向更新 Actor；它既有策略梯度定理，也有相應的 off-policy 演算法。 |
| DDPG | 如何用深度網路實作 DPG？ | 深度 Actor／Critic 加上 replay buffer、緩慢更新的 target networks 和探索噪聲。 |

所以 DDPG 是 Actor-Critic 家族中的一個具體方法，使用 DPG 的梯度結果；三者不是同義詞。DPG 原論文也提出了 off-policy actor-critic 演算法，不應只被說成一條純理論公式。

## 為什麼 DPG 可以直接輸出一個動作？

令確定性 Actor 為 $a=\mu_\theta(s)$，Critic 為 $Q_\phi(s,a)$。固定狀態 $s$ 看，若稍微改動 Actor 參數，動作會變；動作變了，Critic 的評價也會變。鏈鎖律給出更新方向：

$$\nabla_\theta J \approx \mathbb{E}_{s\sim\rho}\left[\left.\nabla_a Q_\phi(s,a)\right|_{a=\mu_\theta(s)}\nabla_\theta\mu_\theta(s)\right].$$

直覺就是：Critic 告訴 Actor「力矩往哪邊調會更好」，Actor 再調整自己的參數。這個表達式省掉對連續動作分佈的逐一抽樣或積分，但不代表隨機策略梯度一定不可行，也不保證梯度估計在所有情況下方差較低。訓練時仍需要探索；DDPG 常以 $\mu_\theta(s)+\text{noise}$ 和環境互動。

## DDPG 為什麼有四個網路？

學習中的 Critic 若同時拿自己不斷變動的預測當標籤，很容易追逐移動目標。因此 DDPG 將正在更新的網路和用來構造目標的網路分開：

| 網路 | 工作 |
| --- | --- |
| Actor $\mu_\theta$ | 產生目前策略的動作，接受策略梯度更新。 |
| Critic $Q_\phi$ | 評估狀態與動作，擬合 Bellman 目標。 |
| Target Actor $\mu_{\theta'}$ | 在下一個狀態提供目標動作。 |
| Target Critic $Q_{\phi'}$ | 對該目標動作提供下一步 Q 值。 |

從 replay buffer 抽出 $(s,a,r,s',d)$，其中 $d$ 表示是否終止，Critic 的目標是

$$y=r+\gamma(1-d)Q_{\phi'}\!\left(s',\mu_{\theta'}(s')\right).$$

Critic 讓 $Q_\phi(s,a)$ 靠近 $y$；Actor 則沿上節的梯度更新。完成後，兩個 target network 才緩慢追上線上網路：$\theta'\leftarrow\tau\theta+(1-\tau)\theta'$，$\phi'\leftarrow\tau\phi+(1-\tau)\phi'$，其中 $\tau$ 很小。**「複製一份」指的是 target network；Actor 和 Critic 本來就是不同職責的兩個網路。**

Replay buffer 讓更新可以重用過去的互動，並減輕連續採集資料的時間相關性。它和 target networks 是從 DQN 借來的穩定化思路；確定性 Actor 處理連續動作則來自 DPG。這些設計改善可訓練性，但 DDPG 仍可能受 Q 值高估、超參數及探索方式影響，不能理解成普遍「解決」連續控制。

## 複習時自問

1. Target Actor 是用來探索，還是用來構造 Bellman target？
2. 確定性策略在訓練時為何仍需噪聲？
3. 為何 DPG 不等於 DDPG，也不只是 Actor-Critic 的別名？

## References

- [Silver et al., Deterministic Policy Gradient Algorithms, ICML 2014](https://proceedings.mlr.press/v32/silver14.html)
- [Lillicrap et al., Continuous Control with Deep Reinforcement Learning, 2015](https://arxiv.org/abs/1509.02971)

<reviewkit>
<takeaways>
- Actor-Critic 是分工架構；DPG 給確定性 Actor 的更新方向；DDPG 是深度網路版本的具體演算法。
- DDPG 的四個網路是在線 Actor／Critic 與緩慢更新的 target Actor／Critic；target network 負責穩定 Bellman 目標。
- 確定性輸出不等於沒有探索；與環境互動時仍須加入探索噪聲。
</takeaways>
<qprompt/>
</reviewkit>
