<meta>
Title: MLP-Mixer：沿 Token 與 Channel 兩個軸學習影像表示
Summary: 從圖片 patch 與矩陣布局出發，圖解 MLP-Mixer 的 token-mixing 與 channel-mixing MLP、參數共享、殘差，以及它與 attention、1×1 convolution、pixel shuffle 和推薦 TokenMixer 的差異。
Slug: mlp-mixer-for-vision-zh-tw
Output: notes/mlp-mixer-for-vision/mlp-mixer-for-vision-zh-tw.html
CanonicalId: mlp-mixer-for-vision
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: computer vision, deep learning, neural networks, feature interaction
Status: drafting
LastModified: 2026-10-06
</meta>

<draft>
- TLDR：分別沿位置軸與 channel 軸套用可學習 MLP，交替建立跨 patch 與 patch 內的關係。
- MainFlow：影像 patch → S×C 矩陣 → 兩種 mixing → block → 共享與比較 → 推薦架構連結。
- Scope：CV MLP-Mixer 的核心機制與從本次討論延伸出的易混淆概念。
- OutOfScope：不把原始模型當成推薦 TokenMixer 的相同實作，也不在本文完整比較所有 vision backbones。
- FollowUps：作者全盤 proofread，核對圖解與公式軸向，之後再發布。
</draft>

# MLP-Mixer：沿 Token 與 Channel 兩個軸學習影像表示

一張圖片既需要「同一位置看到了什麼」，也需要「不同位置之間有什麼關係」。例如辨認一隻動物，局部毛皮、耳朵與眼睛需要各自被表示，再一起組成整體線索。

MLP-Mixer 將這兩件事分開：沿 channel 軸處理每個位置，沿 token 軸處理不同位置。兩者都使用可學習 MLP，不使用 self-attention 作為 mixing 機制。本文依 [NeurIPS 2021 論文入口](https://proceedings.neurips.cc/paper/2021/hash/cba0a4ee5ccd02fda0fe3f9a3e7b89fe-Abstract.html)、[原文 HTML](https://arxiv.org/html/2105.01601v1) 與官方程式碼核對。

## 1. Patch token：不需要先有離散 ID

圖片切成不重疊 patches，每個 patch 攤平後，透過同一個線性投影產生 $C$ 維表示。若有 $S$ 個 patches，輸入就是：

$$
X\in\mathbb{R}^{S\times C}.
$$

```text
圖片 → patches → 每個 patch 線性投影
                       ↓
           S 個 tokens × 每個 C 維
```

這裡 token 是連續向量。它與文字 token ID 的來源不同，但同樣是一個處理單位。進入網路後，也可稱為該位置的 hidden representation。

用三個 patches、四個 channels 示意：

```text
             c₁   c₂   c₃   c₄
patch A      a₁   a₂   a₃   a₄
patch B      b₁   b₂   b₃   b₄
patch C      c₁   c₂   c₃   c₄
```

行是不同位置，列是同一 channel 在不同位置的值。Channel 的語意由訓練形成，不一定對應紅色、邊緣或某個固定名稱。

## 2. Token-mixing MLP：沿同一 channel 看不同位置

取矩陣的一個 column，例如 $[a_1,b_1,c_1]^\top$。Token-mixing MLP 用這三個值一起產生三個更新值：

```text
channel 1：[a₁,b₁,c₁] → MLP_token → 三個位置的更新
channel 2：[a₂,b₂,c₂] → 同一套 MLP_token → 三個位置的更新
...
```

若 token 隱藏寬度為 $D_S$，MLP 形狀是 $S\rightarrow D_S\rightarrow S$。同一層的 token-mixing 權重在所有 channels 間共享。

實作上先把 $S\times C$ 轉置成 $C\times S$，方便 MLP 作用於最後一軸，算完再轉回。**轉置只是布局操作；真正的 mixing 是中間的可學習矩陣乘法與非線性。**

## 3. Channel-mixing MLP：沿同一位置看不同 channels

接著取每個 row，例如 $[a_1,a_2,a_3,a_4]$：

```text
patch A：四個 channels → MLP_channel → 四個更新值
patch B：四個 channels → 同一套 MLP_channel → 四個更新值
patch C：四個 channels → 同一套 MLP_channel → 四個更新值
```

形狀是 $C\rightarrow D_C\rightarrow C$，同一層的 channel-mixing 權重在所有 patch 位置間共享。它不直接讀其他位置，但輸入已經可透過前面的 token-mixing 包含其他位置資訊。

| 模組 | 每次處理的向量 | 權重共享範圍 |
| --- | --- | --- |
| Token-mixing MLP | 某 channel 的所有位置值 | Channels |
| Channel-mixing MLP | 某位置的所有 channel 值 | Patch 位置 |

## 4. Mixer block：兩個軸交替更新

以 $f_T$、$f_C$ 表示沿最後一軸的兩層 MLP，可概括為：

$$
U=X+\left[f_T(\operatorname{LN}(X)^\top)\right]^\top,
$$

$$
Y=U+f_C(\operatorname{LN}(U)).
$$

LN 在每個 token 的 channels 上正規化；這個位置與隨後 MLP 操作哪個軸是兩回事。

```text
X → LN → Transpose → Token MLP → Transpose back → 加 X = U
U → LN → Channel MLP                          → 加 U = Y
```

每個 block 維持 $S\times C$。最後沿位置平均池化，再送分類 head。這個 residual 沒有要求更新值保持原始 patch 的純粹資訊；它只要以正確的位置布局輸出可加的更新。[原文 §2](https://arxiv.org/html/2105.01601v1#S2)

## 5. 與熟悉的 CV 操作相比

### 5.1 Channel mixing 類似 1×1 convolution

1×1 convolution 在每個位置套用共享的 channel 線性映射。Channel MLP 則是兩次這類映射，中間加非線性。它們都在位置內混合 channels，不能由一個單獨的 1×1 conv 直接讀其他位置。

### 5.2 Pixel shuffle 只是搬位置，Mixer MLP 會改數值

```text
Pixel shuffle：      重新排列元素
MLP-Mixer：          轉置 → 可學習 MLP → 轉置回來
推薦 TokenMixer：    切分／重組區塊 → per-token 網路
```

Shuffle 類比能解釋布局，但不能取代學習機制。如果只是轉置再轉回、不加任何處理，得到的就是原輸入。

### 5.3 與 attention 的差別

Attention 依每筆輸入形成位置間的路由權重。Mixer 的 token-mixing 使用固定的可學習權重矩陣，非線性使其輸出仍依內容而變，但沒有像 attention 那樣產生每筆樣本的 $QK^\top$ 關係矩陣。

Token MLP 的輸入／輸出維度與 patch 數 $S$ 綁定，不能像某些 attention 架構那樣直接接受任意 token 數而完全不改參數。參數也對應位置順序，因此不需要另外加位置 embedding，並不等於模型對位置排列不敏感。

## 6. 從 CV Mixer 到推薦 Mixer，哪些概念可以借用？

可借用的是：將表示保留成「位置 × channels」矩陣，分開處理跨位置與位置內關係。不能原樣套用的是共享策略與具體算子。

影像 patches 都源自同一種輸入；推薦的 user ID、item ID、序列興趣與數值特徵來源更異質。<content-link canonical="rankmixer">RankMixer</content-link> 因此採位置專屬 FFN，而不是共享 channel MLP；其 token mixing 本身是無參數區塊重排。<content-link canonical="tokenmixer-large">TokenMixer-Large</content-link> 再加入 Reverting 與稀疏專家。

所以「RankMixer 首次把 MLP-Mixer 引入推薦」不應當成已證明的優先權敘述，也不能把 RankMixer 寫成原樣沿 token 軸套 CV MLP。比較時要問：哪一步有參數、哪個軸被處理、哪些位置共享權重？

## 參考資料（References）

### 學術論文（Academic Literature）

1. Tolstikhin, I., et al. (2021). MLP-Mixer: An all-MLP Architecture for Vision. *Advances in Neural Information Processing Systems*, 34. [NeurIPS 正式論文入口](https://proceedings.neurips.cc/paper/2021/hash/cba0a4ee5ccd02fda0fe3f9a3e7b89fe-Abstract.html)；[arXiv:2105.01601](https://arxiv.org/abs/2105.01601)；[原文 HTML v1](https://arxiv.org/html/2105.01601v1)。
2. Zhu, J., et al. (2025). RankMixer: Scaling Up Ranking Models in Industrial Recommenders. *CIKM 2025*, 6309–6316. [DOI](https://doi.org/10.1145/3746252.3761507)；[arXiv:2507.15551v3](https://arxiv.org/abs/2507.15551v3)。

### 開源專案與代碼（Open Source Code）

1. **[google-research/vision_transformer：官方研究程式庫](https://github.com/google-research/vision_transformer)**。
2. **[vit_jax/models_mixer.py：MLP-Mixer 實作](https://github.com/google-research/vision_transformer/blob/main/vit_jax/models_mixer.py)**。可對照 LayerNorm、swapaxes、兩個 MLP 與 residual 的順序；main 分支可能持續更新。

<reviewkit>
<takeaways>
- 圖片 patch token 是連續表示，不需要離散 ID 或查表。
- Token-mixing 沿位置軸、在 channels 間共享權重；Channel-mixing 沿 channel 軸、在位置間共享權重。
- 轉置只改布局，MLP 才真正產生可學習交互。
- Channel MLP 類似共享的 pointwise 網路，但完整 Mixer 還有跨位置計算。
- 固定位置權重不同於 attention 的輸入依賴路由，也不代表模型不依內容改變輸出。
- CV MLP-Mixer 與推薦 TokenMixer 可共享設計直覺，具體算子與參數共享策略不能混同。
</takeaways>
<qprompt/>
</reviewkit>
