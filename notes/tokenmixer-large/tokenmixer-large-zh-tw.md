<meta>
Title: TokenMixer-Large：從特徵 Token、Mixing／Reverting 到稀疏專家與 GPU 效率
Summary: 以推薦排序的輸入表示為起點，逐步拆解 TokenMixer-Large 的語意分組、資料重排、深層殘差、Sparse-Pertoken MoE 與算子工作流，並釐清論文數字、架構描述及與 RankMixer、Wukong、MLP-Mixer 的差異。
Slug: tokenmixer-large-zh-tw
Output: notes/tokenmixer-large/tokenmixer-large-zh-tw.html
CanonicalId: tokenmixer-large
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, deep learning, mixture of experts, model scaling, GPU
Status: drafting
LastModified: 2026-10-06
</meta>

<draft>
- TLDR：推薦模型的擴展要同時處理表示結構、梯度傳遞與硬體效率；參數變多不是充分條件。
- MainFlow：輸入與交叉特徵 → 語意 token → Mixing／Reverting → 深層訓練 → MoE → 系統效率 → 實驗證據。
- Scope：保留本次逐問逐答的概念釐清，將例子、架構事實與批判性解讀分開。
- OutOfScope：不在本文完整推導 RankMixer、Wukong 或 CV MLP-Mixer；各自另有筆記。
- FollowUps：作者全盤 proofread；補核知乎原始標題與作者，確認數學符號與閱讀節奏後再發布。
</draft>

# TokenMixer-Large：從特徵 Token、Mixing／Reverting 到稀疏專家與 GPU 效率

推薦排序要回答的是：在某個使用者與當下情境下，候選商品或內容有多值得被排在前面？答案需要把使用者、候選物品與歷史行為一起看。單獨知道「使用者喜歡登山」或「商品是登山鞋」還不夠；模型要學到兩者共同出現時如何改變預測。

本文由原始閱讀筆記與逐步討論整理而成。架構與數字以 [TokenMixer-Large 原論文 v2](https://arxiv.org/abs/2602.06563v2) 為核對依據；例子中的特徵與維度均為教學示意。作者亦參考了文末的知乎文章，但整理時該頁回傳 403，未能核驗其標題、作者與全文。

這篇的主線是：先把異質輸入整理成可並行處理的 token，再用可重複堆疊的交互結構學習關係，最後以稀疏專家與規整矩陣運算控制成本。

## 1. 輸入地基：數值、ID、序列與交叉特徵

### 1.1 向量不一定來自 embedding lookup

數值特徵可以先做標準化、log 轉換或缺失處理，再組成向量；例如價格、折扣比例、點擊次數與平均觀看時間。類別與 ID 特徵則通常查 embedding table。向量只是一種組織數字的形式，不要求每個向量都來自單一 sparse feature。

```text
user ID → embedding ─┐
item ID → embedding ─┼→ 後續表示與交互網路
數值特徵 → 前處理 ───┘
```

混合向量的一個座標可能是可讀的價格值，也可能只是 embedding 的某一維；後者沒有保證對應固定的人類語意。

### 1.2 序列長度與向量維度是兩回事

歷史行為可以先形成逐行為的表示，再經 pooling、attention 或其他序列模組聚合成興趣表示。它不一定是 RNN 的最後一個 hidden state，也不一定只有一個向量；短期、長期興趣可以分開表示。某些方法會依候選物品聚合，因此同一人的興趣表示也可能隨候選物品而變。

```text
10 次行為 × 每次 64 維  ─┐
                         ├→ 聚合模組 → 各自固定 256 維表示
100 次行為 × 每次 64 維 ─┘
```

這裡的 10／100 是元素數量，64／256 是向量寬度。不能把變長歷史誤讀成最終向量必須變長。

### 1.3 交叉欄位是 schema，交叉值是樣本內容

「使用者所在地 × 商品配送地」定義交叉欄位；「新加坡 × 馬來西亞」是某次預測的具體值。交叉表達同次預測中的條件組合，不必是時間上同時發生的事件。

```text
欄位 schema：所在地 × 配送地
樣本的值：  新加坡 × 馬來西亞
                   ↓
             組合 ID／hash bucket
                   ↓
                embedding
```

其他例子包括年齡區間 × 商品類別、時段 × 商品類別、使用者 ID × 品牌 ID。數值也能先分桶後交叉，或直接形成乘積特徵；後者不一定需要 embedding 查表。

組合數量很大時，不可能為所有組合維護專屬向量。一般工程選項包括字典查表加 OOV、固定大小 hashing，或改由網路從原始特徵學交互。具體值未收錄，並不要求輸入少掉一個欄位：OOV 或 bucket 仍可提供固定維度向量。若輸入是變長的命中特徵集合，則可透過 pooling 或 padding／mask 處理。這些是通用處理方式，不是論文明確揭露的完整線上前處理細節。

### 1.4 交叉特徵與交互算子不能混為一談

| 名稱 | 例子 | 位置 |
| --- | --- | --- |
| 輸入交叉特徵 | 地區組合 ID 的 embedding | 輸入資料 |
| 特徵交互算子 | Attention、FM、DCN cross layer、Concat＋MLP | 模型內部 |

FM 類方法可以計算 $a^\top b$，得到一個配對交互數值。DCN 則產生交互向量，不是單純逐對點積。原始 DCN 忽略 bias 的第一層為 $x_1=x_0(w^\top x_0)+x_0$；若 $x_0=[a,b]^\top$，展開便有 $a^2$、$ab$、$b^2$。這裡是在向量座標層級形成乘積，與為組合值查表不同。

TokenMixer-Large 的 Pure Model 設計移除額外的碎片化模組，不等於取消交互，也不等於移除輸入交叉特徵。交互主要交給 backbone 承擔。

## 2. Tokenization：把不同來源整理成同寬度的表示單位

### 2.1 Token 在這裡不要求離散 ID

文字模型的 token 常是離散 ID，再查 embedding；這裡的 token 則是連續向量，代表一個供 backbone 處理的單位。稱為 hidden state 時，強調它在網路某一層的表示；稱為 token 時，強調它在矩陣中是一個獨立位置。兩者可以指同一列向量，但不是所有 hidden states 都必須叫 token。

輸入位置有來源或角色，例如商品組；經過交互後，它可包含其他組的資訊，不能要求保持純粹語意。

### 2.2 不同特徵維度，不是同一欄位每次隨機變長

特徵 $F_i$ 可以映射為 $e_i\in\mathbb{R}^{d_i}$。不同欄位的 $d_i$ 可以不同，因為來源模組、表格容量與成本不同。全部使用同一個維度也可行，只是不是必要條件。

語意分組後，每組有獨立 MLP：

$$
x_t=\operatorname{MLP}_t(\operatorname{concat}_{i\in G_t}e_i)\in\mathbb{R}^{D}.
$$

```text
使用者 ID 64 維＋地區 16 維＋年齡桶 8 維
                 ↓ concat：88 維
               MLP_user
                 ↓ D 維 token

商品 ID 128 維＋類別 32 維
                 ↓ concat：160 維
               MLP_item
                 ↓ D 維 token
```

人根據領域知識決定分組，模型學習組內映射。獨立 MLP 允許各組使用不同轉換規則，但不保證壓縮後保留全部資訊，也不表示輸出具有相同語意座標。

### 2.3 Global token 是從當筆樣本算出的全局表示

Global MLP 接收所有組的原始特徵 embeddings 拼接，輸出另一個 $D$ 維 token。它不是必須先拼接各組 MLP 的輸出。

```text
各組 embeddings → 各組 MLP → 各組 tokens
所有組 embeddings → concat → MLP_global → Global token
```

BERT 的 CLS 從特殊 token embedding 開始，再透過各層聚合資訊；這裡的 Global token 在進 backbone 前就依樣本全部特徵計算。兩者角色相近，建構方式不同。

以下以 $N$ 表示含 Global token 的總數，輸入為 $X\in\mathbb{R}^{N\times D}$。對應結構可查 [原論文 §3.2](https://arxiv.org/html/2602.06563v2#S3.SS2)。

## 3. Mixing／Reverting：恢復布局，而非恢復原始語意

有三個 tokens，每個切兩塊：

```text
輸入布局                     Mixing 後
使用者：[U₁ | U₂]            [U₁ | I₁ | S₁]
商品：  [I₁ | I₂]     →      [U₂ | I₂ | S₂]
興趣：  [S₁ | S₂]
```

一般形狀為 $N\times D\rightarrow H\times(ND/H)$。重排本身無可學習參數；混合布局下的網路才讓不同來源的區塊一起影響輸出。

```text
混合布局 → per-token 網路 → 反向排列

[U₁′ | I₁′ | S₁′]            [U₁′ | U₂′]
[U₂′ | I₂′ | S₂′]     →      [I₁′ | I₂′]
                             [S₁′ | S₂′]
```

可用 pixel unshuffle／shuffle 理解互逆重排，但不把 CV 的空間軸與推薦特徵軸視為同一種語意。中間有網路，所以 Reverting 恢復的是布局與形狀，不是原始值。它本身不是線性投影。

忽略 Norm，外層殘差的示意為：

$$
X_{\mathrm{out}}=X+G\bigl(P^{-1}(F(P(X)))\bigr).
$$

$P$ 是重排；$F$ 是混合布局下的處理；$G$ 是排回原布局後的 per-token 處理。完整 block 還有內部殘差，這個示意不是逐算子的完整公式。尤其注意：Reverting 後確實還有可學習網路，並非只反向排列就直接結束。

殘差允許加入包含其他 token 資訊的更新；attention 也是如此。問題不在「混入其他資訊就不能相加」，而在位置對應、形狀與連續訊號路徑。RankMixer 的改進應描述為殘差布局與深層傳遞改善，不能寫成數學無效、原始語意被精確還原，或由一個改動單獨保證穩定。[原論文 §3.3.1 與 §4.3](https://arxiv.org/html/2602.06563v2#S3.SS3.SSS1)

## 4. 深層訓練：有 identity path，不代表所有參數都學得充分

### 4.1 RMSNorm 與 Pre-Norm 解決不同問題

RMSNorm 用平方平均根調整尺度，不做 LayerNorm 的均值中心化。Pre-Norm 是把 Norm 放在殘差分支入口，典型結構為：

$$
x_{\ell+1}=x_\ell+F_\ell(\operatorname{Norm}(x_\ell)).
$$

論文將 RMSNorm 與移除 bias 的工程調整合併報告約 8.4% 吞吐改善，不能把它當成 RMSNorm 單獨在任意硬體上的保證。Post-Norm 的消融有略高 AUC 後出現 NaN 的紀錄，也不能外推成所有 Post-Norm 都無法訓練。

### 4.2 為什麼已有 Pre-Norm，仍加入 inter-residual？

普通 Pre-Norm 已有 identity 路徑。其 Jacobian 為 $I+J_\ell$，跨層梯度經過 $(I+J_{L-1})\cdots(I+J_\ell)$。雖然展開含純 identity 項，其他項仍可能放大、抵消或改變方向。梯度能沿主路徑傳回，也不保證殘差分支參數獲得足夠更新。

額外跨層連接可能再次注入早期表示，改變路徑與訊號權重；不是「沒有它就沒 identity path」，也不是必然有益。論文建議每隔數層連接並避開最後一層，應視為該模型的設計經驗。

### 4.3 Auxiliary loss 與證據限制

低層輸出也參與 logits／loss 的計算，可以提供更直接的監督。論文以估計高層偏差解釋其作用，但不能自行改寫成未揭露的標準 deep-supervision loss 公式。

Table 5 將 inter-residual 與 auxiliary loss 一起移除，報告 $\Delta\mathrm{AUC}=-0.04\%$。這不能分離兩者貢獻，也不能證明 inter-residual 在 Pre-Norm 下必不可少。跨層路徑可帶來 inductive bias，但沒有路徑懲罰或隨機丟棄，不宜直接稱為 pathwise regularization。

此外，down-projection 的 small initialization 讓初期殘差更新較小，也是穩定設計的一部分；數值尺度、路徑與監督共同影響訓練。[原論文 §3.3.3–3.3.4、Table 5 與 Appendix A](https://arxiv.org/html/2602.06563v2#S3.SS3.SSS3)

## 5. Sparse-Pertoken MoE：拆分 SwiGLU，靠 router 選專家

### 5.1 SwiGLU 與 MoE 是不同層次

忽略 bias、採 column-vector 記法，SwiGLU 為：

$$
h=\operatorname{Swish}(W_gx)\odot(W_ux),\qquad y=W_dh.
$$

若 $h$ 為 4096 維，分成八組各 512 維，gate／up 矩陣沿輸出維度拆分，down 矩陣沿輸入維度拆分。每組形成：

$$
E_j(x)=W_{d,j}\left[\operatorname{Swish}(W_{g,j}x)\odot(W_{u,j}x)\right].
$$

每個 expert 都接收完整 $D$ 維輸入，輸出 $D$ 維；不是只看輸入八分之一。拆分後仍具 SwiGLU 形式，所以「拆 FC」與「expert 是小型 SwiGLU」並不矛盾。

在匹配切分、偏置妥善處理且無額外路由重加權時，原 dense 輸出可寫成各分塊輸出的和。加入稀疏選擇與路由權重後，模型不再保證與原 dense 函數相等。

### 5.2 兩種 gate 不同

SwiGLU gate 控制 expert 內部 hidden features；MoE router gate 才決定選哪些 experts。訓練與推理都要先選，再只執行選中的網路，才有稀疏計算收益。

```text
x → Router → 選部分 experts
                ├→ 小型 SwiGLU E₂ ─┐
                └→ 小型 SwiGLU E₄ ─┼→ 加權合併
```

Per-token 意味每個位置有專屬 expert 參數；同一位置跨樣本共用參數，不是為每筆樣本新增網路。混合後的位置可以是重組出的 head token，不必仍是原始使用者或商品組。

### 5.3 Dense／Sparse、擴容／拆分要分開

Dense per-token 網路每次使用該位置完整的 FFN，不使用所有其他位置的參數。Sparse per-token 網路只使用該位置部分 experts；被選中的 expert 內部仍做 dense GEMM。

「先 enlarge、再 sparse」是在描述版本策略：先放大 dense 網路取得效果，再細分並稀疏啟用以控制成本。拆分本身不是擴容；但可以增加總 expert 容量並維持啟用預算，讓總容量與每次計算量部分解耦。

忽略 shared expert、以八個等大小 experts 示意：

| 啟用參數／總參數 | 每次選擇 |
| --- | --- |
| 1:1 | 8 個 |
| 1:2 | 4 個 |
| 1:4 | 2 個 |
| 1:8 | 1 個 |

完整版本需把常開 shared expert 算入成本。接近零效果損失是離線／線上指標接近 dense 版本，不是 training loss 為零，也不代表端到端時間減半。

### 5.4 Shared expert、Gate Scaling 與 Z-loss

Shared expert 每次都執行，但只屬於該 token 位置，不是所有位置共用一個全局 expert。輸出可示意為：

$$
y_t=\alpha\sum_{j\in S_t}g_{t,j}(x_t)E_{t,j}(x_t)+E_{t,\mathrm{shared}}(x_t).
$$

Gate Value Scaling 的 $\alpha$ 放大 routed experts 的加權輸出，也直接影響固定上游梯度下的 expert 梯度。它不只是提高 optimizer learning rate，因為 forward 值及其他梯度也會變。

Router Z-loss 則約束 log-normalizer：

$$
L_z=\frac1B\sum_b\left(\log\sum_j e^{r_{b,j}}\right)^2.
$$

例如 $[2,1,0]$ 與 $[102,101,100]$ 的 softmax 相同，Z-loss 卻不同；它約束共同尺度漂移，不直接要求 expert 使用量均勻。Load-balancing loss 才直接針對路由分布。Z-loss 也不保證每個 logit 的絕對值都小，或 routing entropy 變高。

論文對更高稀疏度試過負載均衡方法與 Z-loss，報告有一些收益；目前 1:2 版本並未因此要求加入它們。不能寫成「極端稀疏一定需要 Z-loss」。S-P MoE 細節見 [§3.4 與 Appendix A.1–A.2、A.6](https://arxiv.org/html/2602.06563v2#S3.SS4)；Z-loss 定義見 [ST-MoE](https://arxiv.org/abs/2202.08906)。

## 6. 系統效率：把零散路由整理成規整計算

稀疏選專家只代表少算；若對每個樣本逐個呼叫小矩陣乘法，GPU 仍可能利用率低。

```text
樣本 A → E₁、E₃          按 expert 整理：
樣本 B → E₂、E₃    →     E₁：[A,C]
樣本 C → E₁、E₂          E₂：[B,C]
                         E₃：[A,B]
```

MoEPermute 按 expert 集中輸入，一筆向量可以送往多個選中的 experts。Grouped GEMM 一起排程多組矩陣乘法，各組仍有自己的權重與樣本數。MoEUnpermute 收回輸出並按 router 權重合併。這組 Permute／Unpermute 是 dispatch，不是 block 的 Mixing／Reverting。

FP8 降低推理的儲存與計算精度；論文訓練維持 BF16。Token Parallel 則把位置專屬的參數與計算分散到 GPU，讓 block 輸出維持 token 分片，減少反覆轉回 batch 分片的通訊。

Table 1 的近 90% 是所列三項 MoE 算子的訓練耗時比例，不能直接當作整個訓練作業的時間占比。[原論文 §3.5](https://arxiv.org/html/2602.06563v2#S3.SS5)

GPU 效率的底層線索是 $\text{FLOPs}/\text{搬運 bytes}$：查表讀出向量，計算少；大 GEMM 可重用輸入與權重。擴大交互網路有機會提高運算強度，但小 batch、通訊或資料重用不足仍可能造成 memory-bound。

## 7. 實驗數字：把規模、口徑與場景分開

| 場景 | 離線規模 | 線上規模 |
| --- | --- | --- |
| Feed Ads | 15B | 7B |
| E-Commerce | 7B | 4B |
| Live Streaming | 4B | 2B |

因此不能將「150 億參數」與「電商 GMV +2.98%」組合成同一個 15B 線上電商實驗。摘要把該 GMV 指標稱為 per-capita preview payment GMV，應保留人均與業務口徑。

Table 2 的約 500M 模型使用 4.2T FLOPs；這是每批 2048 樣本的訓練成本，不是單次推理。4B S-P MoE 的表格實際列出總量 4.6B、啟用 2.3B。這些參數數字也排除 sparse embedding tables，不能當成整個推薦系統所有參數的總和。

更大模型需要更多資料才能兌現效果，資料天數反映樣本覆蓋，不等於 wall-clock 訓練天數。直播實驗的資料量比較如下；原文標的是 UAUC，不應改寫成一般 AUC：

| 擴展比較 | 樣本覆蓋 | 報告的 ΔUAUC |
| --- | --- | --- |
| 30M → 90M | 14 天 | +0.94% |
| 90M → 500M | 30 天 | +0.62% |
| 500M → 2.3B | 30 天 | +0.41% |
| 2.3B 延長資料覆蓋 | 60 天 | +0.70% |

Table 4 的註腳把各列 baseline 寫成前一規模，但 2.3B 的兩列又是在比較不同資料覆蓋；最後一列的具體基準仍需在引用時保留原表與正文脈絡，不能直接把兩個百分比相加或換算成 AUC 百分點。

線上摘要另報告電商訂單 +1.66%、廣告 ADSS +2.0%、直播收益 +1.4%。這些是不同業務指標，不是同一個 AUC，也不是新增的通用品質分數。評估 scaling 時要同時看參數、啟用計算、訓練資料與收斂程度，不能只比較 headline 參數。[原論文 §4.1–4.4 與 Table 7](https://arxiv.org/html/2602.06563v2#S4)

## 8. 四篇筆記的閱讀分工

<content-link canonical="mlp-mixer-for-vision">MLP-Mixer</content-link> 解釋沿 token 軸與 channel 軸的可學習 MLP；<content-link canonical="rankmixer">RankMixer</content-link> 解釋異質推薦特徵、parameter-free multi-head 重排與 per-token FFN；本篇聚焦深層路徑與稀疏訓練；<content-link canonical="wukong">Wukong</content-link> 則走 explicit embedding-wise 交互、再用 MLP 重編碼的路線。

MLP-Mixer 與 RankMixer 共享「分開處理表示軸」的思路，但不是同一個算子。Wukong 也不是不用 MLP；它不把所有交互都交給 MLP 隱式學，而是先顯式計算交互。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Jiang, Y., et al. (2026). TokenMixer-Large: Scaling Up Large Ranking Models in Industrial Recommenders. *KDD 2026*（接受資訊見下方作者頁；本文核對 arXiv v2）. [arXiv:2602.06563v2](https://arxiv.org/abs/2602.06563v2)；[原文 HTML](https://arxiv.org/html/2602.06563v2)。
2. Zhu, J., et al. (2025). RankMixer: Scaling Up Ranking Models in Industrial Recommenders. *CIKM 2025*, 6309–6316. [DOI](https://doi.org/10.1145/3746252.3761507)；[arXiv:2507.15551v3](https://arxiv.org/abs/2507.15551v3)。
3. Zhang, B., et al. (2024). Wukong: Towards a Scaling Law for Large-Scale Recommendation. *ICML 2024, Proceedings of Machine Learning Research*, 235, 59421–59434. [PMLR](https://proceedings.mlr.press/v235/zhang24ao.html)。
4. Tolstikhin, I., et al. (2021). MLP-Mixer: An all-MLP Architecture for Vision. *Advances in Neural Information Processing Systems*, 34. [NeurIPS](https://proceedings.neurips.cc/paper/2021/hash/cba0a4ee5ccd02fda0fe3f9a3e7b89fe-Abstract.html)。
5. Zoph, B., et al. (2022). ST-MoE: Designing Stable and Transferable Sparse Expert Models. *arXiv preprint*（此處採用預印本版本，未確認正式 venue）. [arXiv:2202.08906](https://arxiv.org/abs/2202.08906)。
6. Wang, R., Fu, B., Fu, G., & Wang, M. (2017). Deep & Cross Network for Ad Click Predictions. *ADKDD 2017*. [arXiv:1708.05123](https://arxiv.org/abs/1708.05123)；[ADKDD](https://www.adkdd.org/papers/deep-%26-cross-network-for-ad-click-predictions/2017)。

### 技術文章（Technical Articles）

1. [知乎：作者提供的 TokenMixer-Large 參考文章](https://zhuanlan.zhihu.com/p/2004934991155574234)。原始標題與作者待核驗；2026-10-06 讀取回傳 403。此連結記錄作者的閱讀來源，不作為未核驗技術敘述的證據。
2. [Shikang Wu：作者個人頁](https://shikangwu.github.io/)。用於核對 TokenMixer-Large 的 KDD 2026 接受資訊。

<reviewkit>
<takeaways>
- Token 是處理單位的向量，不要求離散 ID；不同特徵維度與變長行為序列要分清楚。
- 交叉特徵是輸入組合，交互算子是模型計算；Pure Model 不等於取消交叉特徵。
- Mixing／Reverting 改變並恢復布局；跨特徵學習來自中間與後續網路，不是語意還原。
- Pre-Norm 已有 identity path；額外跨層殘差的獨立收益不能從聯合消融直接推定。
- SwiGLU 是 expert 內部網路，router 才選 experts；拆分不等於擴容，稀疏不等於刪除參數。
- Z-loss 約束 router 數值尺度；FP8 在本文的部署流程用於推理，訓練維持 BF16。
- 15B 是最大離線規模；電商線上規模與人均 GMV 指標必須分開閱讀。
</takeaways>
<qprompt/>
</reviewkit>
