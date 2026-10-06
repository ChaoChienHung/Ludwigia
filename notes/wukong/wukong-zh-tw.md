<meta>
Title: Wukong：堆疊特徵交互與推薦模型的 Dense Scaling
Summary: 以向量配對關係為地基，解釋 Wukong 的 FM Block、Linear Compression Block、高階交互與低秩計算，並釐清 dense scaling 如何提高 GPU 運算強度，以及為何查表本身仍可能 memory-bound。
Slug: wukong-zh-tw
Output: notes/wukong/wukong-zh-tw.html
CanonicalId: wukong
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, deep learning, feature interaction, model scaling, GPU
Status: drafting
LastModified: 2026-10-06
</meta>

<draft>
- TLDR：顯式交互與 MLP 重編碼交替堆疊，將擴展重心從大查表轉向可學更高階關係的交互網路。
- MainFlow：配對訊號 → FMB／LCB → 高階堆疊 → 低秩計算 → arithmetic intensity → 比較與限制。
- Scope：Wukong 的交互與擴展直覺；以原論文 v4 與 ICML 正式入口核對。
- OutOfScope：不完整推導 FM 的所有變體，不把運算強度提高等同於全系統必然 compute-bound。
- FollowUps：作者全盤 proofread，特別檢查高階交互與低秩保真條件的表述。
</draft>

# Wukong：堆疊特徵交互與推薦模型的 Dense Scaling

「使用者對登山有興趣」與「商品是登山鞋」的配對是有用的；再加上價格、季節與近期購買行為，就需要更複雜的聯合關係。增加 embedding table 可以給更多 ID 獨立表示，但不會自動增強後面的關係推理。

Wukong 的核心問題是：如何讓交互網路本身持續放大，並讓新增算力帶來有用的高階表示？本篇先建立兩個向量交互的直覺，再向上組合。結構依 [原論文 v4](https://arxiv.org/abs/2403.02545v4)；正式發表入口為 [ICML 2024／PMLR](https://proceedings.mlr.press/v235/zhang24ao.html)。

## 1. 先把不同特徵變成同寬度的向量

ID／類別查 embedding，數值輸入可經 MLP 變成表示。整理後形成：

$$
X\in\mathbb{R}^{n\times d}.
$$

每列是一個完整 embedding 單位，而不是將所有 embeddings 攤平後只看個別座標。維度 $d$ 相同，是為了後續計算能對齊，不代表每列初始語意相同。

## 2. 從點積建立配對訊號

如果兩個向量是 $a,b\in\mathbb{R}^{d}$，點積為：

$$
a^\top b=\sum_{k=1}^{d}a_kb_k.
$$

它是一個標量。對所有列做配對，最基本的交互矩陣是：

$$
Q=XX^\top\in\mathbb{R}^{n\times n},\qquad Q_{ij}=x_i^\top x_j.
$$

```text
多個 embedding 向量
          ↓ 配對點積
     交互矩陣 Q
          ↓
 每格代表一對表示的關係
```

這個值不是原始類別組合的查表 ID，也不必直接解讀為購買概率。Embedding 與後續網路共同訓練，讓這些訊號對任務有用。

## 3. FMB 與 LCB：交互後必須重新組織資訊

### Factorization Machine Block（FMB）

單純得到一堆點積還不夠，下一層需要向量。因此 FMB 會把交互結果經正規化、MLP 與 reshape，產生新的 embeddings：

```text
X → FM 交互 → Flatten／Norm → MLP → Reshape
                                      ↓
                              nF 個 d 維向量
```

所以「Wukong 不使用 MLP」是錯的。差別是它先顯式算交互，再由 MLP 重編碼，不是把所有關係都交給普通 MLP 隱式學。

### Linear Compression Block（LCB）

另一條分支把 embeddings 線性組合：

$$
\operatorname{LCB}(X)=W_LX,\qquad
W_L\in\mathbb{R}^{n_L\times n}.
$$

```text
             ┌→ FMB：顯式交互＋MLP → nF 個向量 ─┐
輸入 X ──────┤                                 ├→ Concat → Residual＋Norm
             └→ LCB：線性重組       → nL 個向量 ─┘
```

FMB 引入新交互，LCB 保留並重組較低階線索。Concat 後是 $(n_F+n_L)\times d$；若殘差形狀不同，需要先對齊。[原文 §3.3–3.5](https://arxiv.org/html/2403.02545v4#S3.SS3)

## 4. 為什麼堆疊能形成更高階交互？

第一層可形成 A 與 B 的聯合訊號，另一個表示可含 C 與 D 的聯合訊號。下一層再把這兩個表示相乘，就有機會結合四個原始來源：

```text
第一層：A × B → 表示 P
        C × D → 表示 Q

第二層：P × Q → 包含 A、B、C、D 的聯合線索
```

「交互的交互」是高階堆疊的直覺。論文用每層最高階數可倍增來解釋結構；實際模型包含非線性 MLP、Norm 與壓縮，不能把它硬讀成乾淨多項式，也不能宣稱一定完整保留所有高階組合。

高階不必然更好：資料不足時也可能學到偶然組合。擴展仍需效果與資料實驗，而不只是數出最高階數。

## 5. 不必真的存下整個 n×n 交互矩陣

基礎 $XX^\top$ 的中間結果隨 $n^2$ 增長。可用 $Y\in\mathbb{R}^{n\times k}$ 作壓縮，計算：

$$
(XX^\top)Y=X(X^\top Y).
$$

右側先算 $X^\top Y$，中間只有 $d\times k$，再產生 $n\times k$，可避免實體化 $n\times n$ 的矩陣。

```text
Xᵀ [d×n] × Y [n×k] → [d×k]
X  [n×d] × 結果     → [n×k]
```

兩種計算順序在固定 $Y$ 下代數相同，但「壓縮後仍保留所有訊息」需要足夠的 rank 與適當投影，不能由結合律單獨保證。實際 $Y$ 也可依輸入產生。[原文 §3.6](https://arxiv.org/html/2403.02545v4#S3.SS6)

## 6. Dense Scaling 如何走向較高算力利用？

### 6.1 查表擴容不等於算力擴展

```text
更大的 embedding table
          ↓ 每筆樣本仍只查少數 IDs
更多儲存容量，不一定更多可重用計算
```

查表多半是在讀向量；pooling 雖有運算，運算強度仍可能低。Wukong 把擴展重心放在交互層深度、輸出 embedding 數、壓縮維度及 MLP 容量，而非只有增加查表大小。

### 6.2 看每搬一 byte，能做多少運算

$$
I=\frac{\text{FLOPs}}{\text{由主要記憶體搬運的 bytes}}.
$$

大矩陣乘法會重用輸入與權重：一個權重可作用於多筆樣本，一個輸入值可參與多個輸出。分塊 GEMM 在片上記憶體重用資料，可能讓計算需求增長比外部搬運需求更快。

用簡化 roofline 模型看單一計算階段：

$$
t\gtrsim\max\left(\frac{\mathrm{FLOPs}}{\text{峰值算力}},
\frac{\mathrm{bytes}}{\text{記憶體頻寬}}\right).
$$

當前者主導，就是 compute-bound；後者主導，則 memory-bound。這是硬體與實際 workload 的關係，不是模型名稱決定的屬性。

因此不是把 lookup 改成 compute-bound，而是讓交互部分占更大比重、能利用密集算力。單純增加 FLOPs 並不保證更快；若計算沒有改善品質，只是把時間花在更忙的 GPU 上。小 batch、權重讀取與多 GPU 通訊仍可能是瓶頸。

## 7. 與 TokenMixer 路線的差別

| 比較軸 | Wukong | TokenMixer／RankMixer 路線 |
| --- | --- | --- |
| 關係形成方式 | 向量配對交互後重編碼 | 區塊重排後共同處理 |
| MLP 的角色 | 把交互結果轉成新 embeddings | 處理原布局或混合布局的向量 |
| 資料組織 | Embedding-wise 交互矩陣 | Token／head 區塊 |
| 擴展重點 | 堆疊、交互寬度與 MLP 容量 | 表示寬度、深度、FFN／expert 容量 |

兩者都需要可學習網路、穩定訓練與硬體實作，不是「點積對 MLP」的互斥選擇。<content-link canonical="tokenmixer-large">TokenMixer-Large</content-link> 的細節另見專篇。

## 參考資料（References）

1. Zhang, B., et al. (2024). Wukong: Towards a Scaling Law for Large-Scale Recommendation. *ICML 2024, Proceedings of Machine Learning Research*, 235, 59421–59434. [PMLR 正式論文入口](https://proceedings.mlr.press/v235/zhang24ao.html)；[arXiv:2403.02545v4](https://arxiv.org/abs/2403.02545v4)；[原文 HTML](https://arxiv.org/html/2403.02545v4)。
2. Jiang, Y., et al. (2026). TokenMixer-Large: Scaling Up Large Ranking Models in Industrial Recommenders. *KDD 2026*（接受資訊由作者頁核對）. [arXiv:2602.06563v2](https://arxiv.org/abs/2602.06563v2)。
3. Wang, R., Fu, B., Fu, G., & Wang, M. (2017). Deep & Cross Network for Ad Click Predictions. *ADKDD 2017*. [arXiv:1708.05123](https://arxiv.org/abs/1708.05123)。

<reviewkit>
<takeaways>
- 擴大 embedding tables 不會自動增強交互網路；Wukong 聚焦 dense interaction scaling。
- FMB 先計算顯式交互，再用 MLP 產生新 embeddings；LCB 保留並線性重組低階線索。
- 高階交互來自「交互的交互」，不是只把同一批二階點積重複計算。
- $X(X^\top Y)$ 可避免實體化完整交互矩陣，但任意壓縮不保證資訊無損。
- 查表本身仍可能 memory-bound；規整矩陣運算與資料重用才有機會提高 arithmetic intensity。
- GPU 更忙不等於任務更有效，compute-bound 也不是無條件的架構保證。
</takeaways>
<qprompt/>
</reviewkit>
