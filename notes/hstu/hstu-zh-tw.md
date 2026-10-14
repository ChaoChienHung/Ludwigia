<meta>
Title: HSTU：把推薦改寫為使用者行為的序列預測
Summary: 從逐候選打分的重複計算出發，理解 HSTU 的序列轉導、pointwise aggregated attention、長序列工程，以及它與後續排序模型的邊界。
Slug: hstu-zh-tw
Output: notes/hstu/hstu-zh-tw.html
CanonicalId: hstu
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, HSTU, generative recommendation, sequence modeling
Status: drafting
LastModified: 2026-10-09
</meta>

<draft>
- TLDR：HSTU 以行為序列作主要學習單位，為生成式推薦設計高效的長序列骨幹。
- MainFlow：逐候選樣本問題 → 序列轉導 → attention 差異 → 成本與後繼。
- Scope：原始 HSTU 論文；ULTRA-HSTU 的效率改進另見專篇。
- FollowUps：作者全盤 proofread；留意 generative 指訓練／任務表述，不把所有部署都寫成 SID 生成。
</draft>

# HSTU：把推薦改寫為使用者行為的序列預測

傳統排序常對同一位使用者的多個候選分別製作樣本。這可以充分使用候選特徵，但同一段歷史容易被重複讀取；歷史越長，成本越突出。HSTU 所在的 Generative Recommenders 路線改從**連續發生的使用者行為**出發：把先前互動組成時間序列，學習接下來可能發生的行為或物品。HSTU 是為這類任務設計的序列骨幹，不是「HSTU＝一種商品 ID 編碼」。[原論文](https://arxiv.org/abs/2402.17152)

## 1. 為什麼以序列為單位？

假設使用者依序看了 A、點了 B、停留在 C。逐候選打分只問「這次候選 X 的機率」；序列訓練則可利用多個前綴作監督：看了 A 後會做什麼？看了 A、B 後又會做什麼？這讓模型直接從行為鏈學習偏好變化，也讓同一條長序列能服務多個訓練目標。[原論文 §2](https://arxiv.org/html/2402.17152)

```text
行為 A → 行為 B → 行為 C → 預測下一步
   前綴 A      前綴 A,B       前綴 A,B,C
```

## 2. HSTU 的 attention 與一般 Transformer 有何不同？

一般 softmax attention 會在可見的歷史位置之間做正規化，讓權重總和固定。HSTU 採 **pointwise aggregated attention**：先對各位置的相關性施加非線性，再聚合與正規化，不使用同樣的跨位置 softmax 競爭。作者的動機之一是保留「相關歷史出現了多少次」這種偏好強度訊號，而不只比較相對排序。[原論文 §3.1](https://arxiv.org/html/2402.17152)

這不代表 HSTU 完全沒有 attention，也不代表它在所有資料上必然勝過標準 Transformer。論文另透過稀疏、變長序列處理與專用 kernel 來控制長序列訓推成本。[原論文 §3.2](https://arxiv.org/html/2402.17152)

## 3. 後繼方法各自補了什麼？

<content-link canonical="ultra-hstu">ULTRA-HSTU</content-link> 繼續改善超長序列的 attention 與層級計算效率。<content-link canonical="mtgr">MTGR</content-link> 借用 HSTU 類骨幹做工業排序，同時保留傳統 <content-link canonical="dlrm">DLRM</content-link> 重視的候選側交叉特徵。後者雖叫「生成式推薦框架」，其文中排序目標使用的是**判別式 loss**；不能把所有 HSTU 後繼都理解成線上逐 token 生成商品。[MTGR 原論文](https://arxiv.org/abs/2505.18654)

## 參考資料（References）

1. Zhai, J., et al. (2024). Actions Speak Louder than Words: Trillion-Parameter Sequential Transducers for Generative Recommendations. *Proceedings of the 41st International Conference on Machine Learning (ICML 2024)*. [arXiv:2402.17152](https://arxiv.org/abs/2402.17152)。

<reviewkit>
<takeaways>
- HSTU 把使用者行為序列放在學習中心，服務序列轉導式推薦。
- 它使用 pointwise aggregated attention；差異不是「有無 attention」。
- 商品 SID 編碼、MTGR 的判別式排序與 ULTRA-HSTU 的效率改進，都不應反向當成原始 HSTU 的定義。
</takeaways>
<qprompt/>
</reviewkit>
