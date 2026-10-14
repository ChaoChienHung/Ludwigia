<meta>
Title: OneTrans-V2：一個使用者脈絡服務召回、粗排與精排
Summary: 從三級推薦流水線的重複歷史計算出發，理解 OneTrans-V2 的階段 token、生成式召回、SNT、跨階段快取與其限制。
Slug: onetrans-v2-zh-tw
Output: notes/onetrans-v2/onetrans-v2-zh-tw.html
CanonicalId: onetrans-v2
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, OneTrans-V2, retrieval, ranking, sequence native training
Status: drafting
LastModified: 2026-10-09
</meta>

<draft>
- TLDR：共用一次編碼的使用者歷史，保留召回、粗排、精排各自的候選計算與成本預算。
- MainFlow：三級流水線成本 → 共用／隔離邊界 → 三種任務 → SNT／推理快取 → 實驗口徑。
- Scope：OneTrans-V2 本身；原始 OneTrans 的單排序模型機制另見專篇。
- FollowUps：作者全盤 proofread；檢查 DCGR 目標與 QPS／FLOPs 比較基準。
</draft>

# OneTrans-V2：一個使用者脈絡服務召回、粗排與精排

推薦常先從龐大商品庫**召回**數千件，再由**粗排**縮到數百件，最後由**精排**決定呈現順序。三階段都要讀同一位使用者的歷史，若分別訓練、分別部署模型，長序列便重複編碼。OneTrans-V2 延伸 <content-link canonical="onetrans">OneTrans</content-link>，把三階段做成同一 Transformer 的任務，但仍保留「召回 → 粗排 → 精排」的候選縮減流程。[原論文](https://arxiv.org/abs/2609.28589)

## 1. 先畫出共用與隔離的邊界

使用者行為序列與候選無關，先編碼成共用的 user context。三階段的 token 各讀取這份脈絡，但階段 token 彼此不可見，行為 token 也不反向讀取候選。於是粗排選中某件商品，精排可拿到**入選商品**，卻不直接讀取粗排 token 的 hidden state。[原論文 §4.1](https://arxiv.org/html/2609.28589)

```text
                ┌→ 召回：生成候選 SID
使用者歷史 → 共用脈絡 ├→ 粗排：少量特徵 → 每件候選 1 個 token
                └→ 精排：完整特徵 → 每件入選候選多個 tokens
```

粗排的單 token 是**少量候選側特徵的壓縮表示**，不是商品 PID 本身。精排使用更完整的非序列特徵集，保留多個 token 以免過度壓縮；這些也不保證逐一等於原始欄位。[原論文 §4.2.2](https://arxiv.org/html/2609.28589)

## 2. 三種任務如何共訓？

召回的 **DCGR** 先預測這次互動的決策前綴，再逐步生成商品的三層 SID。取回實際商品後，粗排與精排分別預測 CTR、CVR 等分數；精排輸出還可在同模型內指導粗排，減少早期淘汰精排原本看好的商品。總訓練目標是召回、兩種排序與蒸餾損失的加權和，不代表三階段使用同一組特徵或同一種輸出。[原論文 §4.2](https://arxiv.org/html/2609.28589)

## 3. SNT 與線上快取：兩種「歷史算一次」

訓練時，**Sequence-Native Training（SNT）** 將同一使用者在時間窗口內的曝光聚到一條因果行為時間線，編碼歷史一次。每筆曝光保留時間戳、階段特徵與標籤，只能讀請求當時已發生的歷史。這不是把 request 當成新行為插入歷史，而是把曝光**錨定到相應歷史前綴**。論文相對逐曝光重編碼的基線報告 4.4 倍訓練速度。[原論文 §4.4、§7.9](https://arxiv.org/html/2609.28589)

線上一次請求則先建立 user context 的 KV cache，再讓召回、粗排、精排讀同一份快取。因果 attention 保證新行為只追加在後面，不會改寫舊歷史位置的表示；候選側工作仍要按階段執行。論文的 3.2 倍 QPS 是相同硬體預算下、連同服務端優化的整體結果；它**不是**「每次請求 FLOPs 降為三分之一」的意思。[原論文 §5.1、§7.9](https://arxiv.org/html/2609.28589)

## 4. 如何與其他路線定位？

<content-link canonical="mtfm">MTFM</content-link> 主要統一**多業務場景的精排**；OneTrans-V2 統一**同一推薦流水線的三個階段**。<content-link canonical="hstu">HSTU</content-link> 則由行為序列預測問題出發。它們都重視使用者歷史與計算重用，但處理的系統邊界不同。

## 參考資料（References）

1. Cao, H., et al. (2026). OneTrans-V2: Unifying Retrieval, Pre-rank, and Fine-rank with One Transformer in Industrial Recommender. *arXiv preprint*. [arXiv:2609.28589](https://arxiv.org/abs/2609.28589)。

<reviewkit>
<takeaways>
- 共用的是使用者歷史的模型脈絡；三階段的候選側 token、特徵與任務仍不同。
- 粗排單 token 壓縮少量特徵；精排對入選商品使用多個較豐富的特徵 token。
- SNT 在訓練窗口內跨曝光共用歷史；線上在單次請求內跨階段共用快取。
- 召回生成 SID，排序預測分數；共訓不等於三階段執行完全相同的運算。
</takeaways>
<qprompt/>
</reviewkit>
