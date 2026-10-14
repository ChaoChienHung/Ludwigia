<meta>
Title: OneTrans：同一個 Transformer 如何處理行為序列與特徵交互
Summary: 從傳統推薦模型分開處理歷史與特徵的成本出發，拆解 OneTrans 的 S／NS tokens、混合參數、因果遮罩、金字塔序列與快取。
Slug: onetrans-zh-tw
Output: notes/onetrans/onetrans-zh-tw.html
CanonicalId: onetrans
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, OneTrans, Transformer, feature interaction
Status: drafting
LastModified: 2026-10-09
</meta>

<draft>
- TLDR：OneTrans 在一個排序模型內共同處理使用者行為與非序列特徵。
- MainFlow：兩套模組的分工 → token 組織 → attention 與參數 → 序列縮短／快取 → V2 邊界。
- Scope：原始 OneTrans 的單階段排序模型，不將 V2 的召粗精統一倒灌進來。
- FollowUps：作者全盤 proofread，核對金字塔機制與實驗口徑。
</draft>

# OneTrans：同一個 Transformer 如何處理行為序列與特徵交互

排序時要同時回答兩件事：使用者最近做了什麼？這些歷史與眼前候選的各項特徵如何組合？傳統設計常先用一個序列模組編碼歷史，再交給另一個特徵交互模組。OneTrans 把兩類資訊放進**同一個計算圖**，希望模型直接學到序列內、特徵間，以及序列與特徵間的關係。[原論文](https://arxiv.org/abs/2510.26104)

## 1. 先認清兩類 token

**S-token** 代表按時間排列的使用者行為；**NS-token** 代表非序列特徵，來源可包含使用者、候選商品與請求情境。這裡的 token 是固定寬度的向量位置，不必是文字 tokenizer 的離散 ID，也不保證一個原始欄位恰好對應一個 token。

```text
[歷史行為 S₁, S₂, …, Sₙ] [候選相關 NS₁, NS₂, …, NSₖ]
             同一個 Transformer 堆疊
```

NS-token 放在 S-token 後，因果 mask 讓 NS-token 讀取歷史；序列位置不能看未來。不同性質的 token 也不必強迫共用全部權重：OneTrans 對同質的 S-token 共用參數，對異質的 NS-token 使用位置專屬的 Q/K/V 與 FFN 參數。[原論文 §3.1–3.3](https://arxiv.org/html/2510.26104)

## 2. 為何仍能控制長序列成本？

若每一層都對全部歷史位置重新發出 query，長序列會很貴。OneTrans 的 **pyramid stack** 讓較深層只保留部分較新的序列 query；這些 query 仍可讀較完整的 key/value，層層減少要更新的位置。最後由 NS-token 狀態送入任務頭打分。這是減少深層計算的位置數，不能理解為一開始就把舊歷史全部刪掉。[原論文 §3.4](https://arxiv.org/html/2510.26104)

因果方向還帶來快取價值：已算好的歷史表示不依賴後面接的是哪個候選，後續可重用其 KV。這是「長歷史算一次、多個候選讀取」的基礎。

## 3. 與 OneTrans-V2 的邊界

原始 OneTrans 統一的是**一個排序模型內**的序列建模與特徵交互；它並未把召回、粗排、精排三個階段全部變成同一模型。<content-link canonical="onetrans-v2">OneTrans-V2</content-link> 才把共用使用者脈絡擴展到整個級聯流水線。對照 <content-link canonical="dlrm">DLRM</content-link>，可以記成：DLRM 先組織候選特徵再打分；OneTrans 把歷史 token 與特徵 token 放入同一 Transformer 共同處理。

## 參考資料（References）

1. Zhang, Z., et al. (2026). OneTrans: Unified Feature Interaction and Sequence Modeling with One Transformer in Industrial Recommender. *Proceedings of the ACM Web Conference 2026*, 8162–8170. [arXiv:2510.26104](https://arxiv.org/abs/2510.26104)。

<reviewkit>
<takeaways>
- S-token 表示行為歷史；NS-token 表示使用者、候選與情境的非序列特徵。
- 同一 Transformer 承擔序列與特徵交互，但兩類 token 的參數分工不同。
- 金字塔堆疊縮短較深層要更新的序列位置；因果方向支援歷史 KV 重用。
- 原始 OneTrans 是單一排序模型；跨召回、粗排、精排的統一屬於 V2。
</takeaways>
<qprompt/>
</reviewkit>
