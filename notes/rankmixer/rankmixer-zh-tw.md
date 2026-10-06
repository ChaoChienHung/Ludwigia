<meta>
Title: RankMixer：異質特徵如何透過 Token Mixing 與 Per-token FFN 擴展
Summary: 從推薦特徵的異質性出發，以形狀圖解說明 RankMixer 的語意 Tokenization、無參數多頭重排、位置專屬 FFN，以及 ReLU routing 與 Dense-Training／Sparse-Inference 的取捨。
Slug: rankmixer-zh-tw
Output: notes/rankmixer/rankmixer-zh-tw.html
CanonicalId: rankmixer
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, deep learning, mixture of experts, model scaling, GPU
Status: drafting
LastModified: 2026-10-06
</meta>

<draft>
- TLDR：透過異質特徵分組、跨 token 區塊重排與位置專屬 FFN，同時取得交互能力與較規整的計算。
- MainFlow：異質輸入與成本 → token 表示 → 重排與 FFN → 稀疏路由 → 系統取捨 → 後繼架構。
- Scope：RankMixer 自身的架構與 ReLU-MoE；辨認它與 CV MLP-Mixer 的差異。
- OutOfScope：TokenMixer-Large 的 Reverting、SwiGLU 與稀疏訓練改進另見專篇。
- FollowUps：作者全盤 proofread，特別檢查殘差解讀與效果數字口徑。
</draft>

# RankMixer：異質特徵如何透過 Token Mixing 與 Per-token FFN 擴展

推薦排序同時看使用者、候選內容、上下文與行為。這些來源可能有不同維度、頻率與意義：商品類別不是使用者 ID，短期點擊興趣也不是價格。若把全部資訊塞進單一大向量，模型仍可學習，但不同來源的處理責任不容易被保留；若每個微小欄位都有一套網路，又容易形成大量小算子。

RankMixer 的理解起點，是如何在「保留多個表示單位」與「讓計算足夠規整」之間取得折衷。本篇採 [原論文 v3](https://arxiv.org/abs/2507.15551v3)，例子與尺寸均為示意。

## 1. 把特徵整理成 tokens

數值可以前處理，ID 可以查 embedding，序列可以先聚合興趣。這些表示一起進入 tokenization。原文以領域知識作語意排序／分組，再拼接、切分與投影成固定維度 tokens；不要把它直接等同於後繼模型「每個完整語意組一個獨立 MLP」的描述。

以 $T$ 個 tokens、每個 $D$ 維表示：

$$
X\in\mathbb{R}^{T\times D}.
$$

Token 是矩陣的一列，不需要離散 token ID。輸入位置有來源，後續層的同一位置則可能包含混合資訊。每層固定寬度方便堆疊，但維度相同不等於不同來源共享可直接比較的語意座標。

## 2. Multi-head Token Mixing：先重排哪些數字在一起

取 $T=3,D=6,H=3$，每個 token 切成三塊，每塊兩個數字：

```text
原始 tokens：
A：[A₁ | A₂ | A₃]
B：[B₁ | B₂ | B₃]
C：[C₁ | C₂ | C₃]

重組後：
s₁：[A₁ | B₁ | C₁]
s₂：[A₂ | B₂ | C₂]
s₃：[A₃ | B₃ | C₃]
```

一般形狀變換為：

$$
T\times D\rightarrow T\times H\times(D/H)
\rightarrow H\times(TD/H).
$$

這個 Mixing 是 split／concat 的無參數重排，不是 attention，也不是沿 token 軸的可學習 MLP。它只是把來自不同來源的區塊放進同一個向量；接下來 FFN 才能共同處理這些區塊。

論文選 $H=T$，讓前後形狀相同、能做殘差。但形狀相同不代表布局相同：重排後第一列不再只是 A，而是所有原始 token 的第一塊。[原文 §3.2–3.3](https://arxiv.org/html/2507.15551v3#S3.SS3)

## 3. Per-token FFN：不同位置有不同參數

以兩層 FFN 示意：

$$
v_t=W_{t,2}\operatorname{GELU}(W_{t,1}s_t+b_{t,1})+b_{t,2}.
$$

```text
s₁ → FFN₁ → v₁
s₂ → FFN₂ → v₂
s₃ → FFN₃ → v₃
```

不同位置使用不同權重，同一位置在不同樣本中使用相同權重。「Per-token」因此指位置參數隔離，不是為每個使用者生成一套新網路。

若三個位置使用完全相同的 FFN，每筆樣本仍需做三次計算；換成三套同大小 FFN，單筆算術量可以相近，但總參數較多。這是擴充表示容量的一種方式，儲存與讀取成本仍要算入。

重排＋FFN 可以類比先把空間資訊搬到 channels、再做 channel 運算。但標準 1×1 convolution 在空間位置共享權重，這裡不共享，不能直接當成同一層。

## 4. 為什麼不直接用 attention？

Attention 依輸入動態計算 token 關係；RankMixer 使用固定重排，讓後續網路學習混合表示。這是成本與建模方式的取捨，不代表 attention 在推薦上普遍無效。

| 比較軸 | Attention | RankMixer Mixing |
| --- | --- | --- |
| 跨位置組織 | 依當次輸入產生權重 | 固定區塊重排 |
| Mixing 本身有無參數 | 有投影參數 | 無 |
| 學習發生處 | 投影、注意力與後續網路 | 主要在後續 FFN 等網路 |
| 表示是否含其他位置資訊 | 可以 | 經後續處理後可以 |

異質性使共享處理不一定最合適，但「user 與 item 不是同一語意空間」並不構成 attention 不可用的數學證明；模型也可以學習投影對齊。

## 5. ReLU-MoE：用門控控制專家數量

FFN 可以換成多個 experts。Router 產生各專家分數，再用 ReLU 作非負權重：

$$
g_{t,j}=\max(0,r_{t,j}(s_t)),\qquad
v_t=\sum_jg_{t,j}E_{t,j}(s_t).
$$

```text
分數：[−0.5, 0.8, −0.2, 1.3]
權重：[ 0,   0.8,  0,   1.3]
            E₂ 與 E₄ 開啟
```

這裡的 ReLU 是 router gate，不是在說 expert 必須採 ReLU activation。它允許一筆輸入選兩個、另一筆選三個；正則化控制平均稀疏程度，而不是固定每筆 top-k。

### Dense-Training／Sparse-Inference

如果少數 experts 早期就主導路由，其他 experts 可能更新不足。RankMixer 使用訓練與推理兩個 router，在訓練中更新兩者，但只對推理 router 施加稀疏正則；推理使用後者。其目的是以較稠密的訓練參與減少 expert starvation，再以稀疏推理省成本。

因此不要把「dense training」理解成每個 token 使用整個模型所有位置的權重，也不要把它理解成所有路由權重均勻。它與下一代的 Sparse Train／Sparse Infer 是不同的成本策略。[原文 §3.4](https://arxiv.org/html/2507.15551v3#S3.SS4)

## 6. 系統價值與成本邊界

硬體可同時處理多個 per-token FFN，而規整矩陣運算有機會減少算子啟動與零碎資料搬運。MoE 的稀疏性是跳過未選 experts；選中的 experts 內部仍可用 dense GEMM。

增大 expert 總容量、維持每次選擇預算，可以讓參數量比 FLOPs 增長更快，但不會消除記憶體容量、讀權重、router 與通訊成本。小 batch 推理尤其可能受權重搬運限制。

原文報告工業部署收益，應以各自 baseline、資料與硬體口徑閱讀；不要把單篇論文結果當成跨場景保證。參數數字也要確認是否只計 backbone／dense parameters，而非 embedding tables。

## 7. 從 RankMixer 走向 TokenMixer-Large

RankMixer 的重排在 $H=T$ 時可以保持形狀，但沒有明確把分支排回原始布局。後繼模型增加 Reverting，讓外層原始 token 路徑維持位置對應；也調整深層穩定性與 MoE 訓練策略。

這是可改進的設計，不是 RankMixer 的 residual 在數學上無效。含跨 token 資訊的分支也可以相加；重點是布局、訊號路徑與實驗效果。

若要往下讀，<content-link canonical="tokenmixer-large">TokenMixer-Large</content-link> 聚焦這些後繼改進；若要確認 CV 的名稱來源，<content-link canonical="mlp-mixer-for-vision">MLP-Mixer</content-link> 的 token-mixing 本身是可學習 MLP，與這裡的無參數 Mixing 不同。

## 參考資料（References）

1. Zhu, J., et al. (2025). RankMixer: Scaling Up Ranking Models in Industrial Recommenders. *CIKM 2025*, 6309–6316. [DOI](https://doi.org/10.1145/3746252.3761507)；[arXiv:2507.15551v3](https://arxiv.org/abs/2507.15551v3)；[原文 HTML](https://arxiv.org/html/2507.15551v3)。
2. Jiang, Y., et al. (2026). TokenMixer-Large: Scaling Up Large Ranking Models in Industrial Recommenders. *KDD 2026*（接受資訊由作者頁核對）. [arXiv:2602.06563v2](https://arxiv.org/abs/2602.06563v2)。
3. Tolstikhin, I., et al. (2021). MLP-Mixer: An all-MLP Architecture for Vision. *Advances in Neural Information Processing Systems*, 34. [NeurIPS](https://proceedings.neurips.cc/paper/2021/hash/cba0a4ee5ccd02fda0fe3f9a3e7b89fe-Abstract.html)。

<reviewkit>
<takeaways>
- 推薦 tokens 是異質特徵的連續表示單位，不要求離散 ID。
- Mixing 以 split／concat 重排區塊，後續 per-token FFN 才學習跨特徵關係。
- $H=T$ 保持形狀，不等於保持原 token 布局或純粹語意。
- Per-token 指不同位置有專屬權重，同一位置跨樣本共用。
- ReLU routing 允許變動 expert 數；Dense-Training／Sparse-Inference 主要降低部署計算，訓練仍有較稠密成本。
- RankMixer 不是 CV MLP-Mixer 的原樣移植，也不應被描述成數學無效的模型。
</takeaways>
<qprompt/>
</reviewkit>
