<meta>
Title: ULTRA-HSTU：讓超長行為序列仍可訓練與服務
Summary: 從 HSTU 長序列成本出發，拆解 ULTRA-HSTU 的輸入整理、semi-local attention、attention truncation 與系統協同設計。
Slug: ultra-hstu-zh-tw
Output: notes/ultra-hstu/ultra-hstu-zh-tw.html
CanonicalId: ultra-hstu
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, ULTRA-HSTU, attention, long sequence
Status: drafting
LastModified: 2026-10-09
</meta>

<draft>
- TLDR：ULTRA-HSTU 以稀疏注意力、後段短序列與系統優化，使長序列擴展更划算。
- MainFlow：長序列成本 → 局部與全域線索 → 後段截短 → 系統成本與數字口徑。
- Scope：ULTRA-HSTU 相對 HSTU 的效率設計，不重述原始模型全部細節。
- FollowUps：作者全盤 proofread；核對 SLA 位置方向與 scaling efficiency 指標口徑。
</draft>

# ULTRA-HSTU：讓超長行為序列仍可訓練與服務

<content-link canonical="hstu">HSTU</content-link> 讓推薦模型直接學長期行為，但歷史若增長到數千或上萬步，每一層都讓所有位置彼此計算，費用會迅速上升。ULTRA-HSTU 的問題是：**哪些歷史關係需要精算，哪些層仍需要完整序列？**它以輸入、attention、模型拓撲與 GPU 實作一起設計，而不是只換一個算子。[原論文](https://arxiv.org/abs/2602.16986)

## 1. 先讓模型重視有用的行為

使用者歷史並非每次互動同等有用：近期點擊可表達短期意圖，較早的重複互動可表達長期偏好。ULTRA-HSTU 在輸入序列與行為訊號的組織上做調整，讓可用的訓練長度與訊號品質較好。這一步處理的是**送進模型哪些行為、如何表示**，不等於後面 attention 的運算規則。[原論文 §4.1](https://arxiv.org/html/2602.16986)

## 2. Semi-Local Attention：不要每個位置看全部歷史

全因果 attention 的配對數會隨序列長度平方成長。ULTRA-HSTU 的 **SLA** 保留局部窗口與一組全域可見位置，讓位置既能利用附近模式，也能接觸較長期訊號。若窗口大小固定，attention 配對量隨長度近似線性成長。這是有意選擇可見邊，而不是先算完整 attention 再刪掉結果。[原論文 §4.2.1](https://arxiv.org/html/2602.16986)

## 3. Attention Truncation：較深層不必一直處理全長

另一筆成本來自「完整序列 × 很多層」。ULTRA-HSTU 先讓若干層處理全長歷史，再選較短的近期片段交給後續層。這裡的 truncation 是**層間序列長度調整**；SLA 則是**同一層內哪些位置能互看**，兩者可以並用。[原論文 §4.3](https://arxiv.org/html/2602.16986)

```text
較淺層：完整長歷史 ──→ 較深層：較短近期片段
同一層：每個位置只連到 SLA 允許的歷史位置
```

論文還討論混合精度、專用 attention kernel、記憶體節省等工程手段；「訓練擴展效率超過 5 倍、推理擴展效率約 21 倍」是作者相對其基線與實驗口徑的**整體比較**，不能歸功於 SLA 或截短單一改動，也不是任意系統搬用後都會得到的端到端加速。[原論文摘要與實驗](https://arxiv.org/abs/2602.16986)

## 參考資料（References）

1. Ding, Q., et al. (2026). Bending the Scaling Law Curve in Large-Scale Recommendation Systems. *arXiv preprint*. [arXiv:2602.16986](https://arxiv.org/abs/2602.16986)。

<reviewkit>
<takeaways>
- SLA 限制同層的 attention 連線；attention truncation 縮短後續層處理的序列。
- 輸入整理、稀疏注意力與系統實作共同決定長序列成本。
- 整體 scaling efficiency 數字不可誤讀為單一算子的固定加速倍數。
</takeaways>
<qprompt/>
</reviewkit>
