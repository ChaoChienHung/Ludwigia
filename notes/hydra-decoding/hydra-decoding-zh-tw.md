<meta>
Title: Hydra：讓草稿預測頭看見前面的候選
Summary: 整理 Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding 的研究定位、一手參考資料與後續補寫方向。
Slug: hydra-decoding-zh-tw
Output: notes/hydra-decoding/hydra-decoding-zh-tw.html
CanonicalId: hydra-decoding
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# Hydra：讓草稿預測頭看見前面的候選

在 COLM 2024 發表的 Hydra（《Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding》），針對 Medusa 等框架中「多個預測頭相互獨立、導致長步候選缺乏語意一致性」的本質缺陷，提出了一種具備序列依賴（Sequentially-Dependent）特性的草稿頭生成網絡，為多步候選生成的保真度帶來了突破。

## 研究問題與架構設計（Architecture & Objective）

依據 Hydra 論文（§2 & §3）：
- **獨立 Heads 的致命短板**：在標準 Medusa 架構中，所有預測頭都僅以同一個前綴隱層表徵 $h_t$ 為輸入。這意味著預測第 $t+2$ 個 token 的 Head 完全不知道第 $t+1$ 個 Head 剛剛挑選了什麼詞，兩個邊際分佈的最高機率項組合在一起極易構成語意不通順的矛盾片語。
- **序列依賴的級聯機制（Cascade Conditioning）**：Hydra 重構了 Draft Heads 的拓撲連接：第 $k$ 個預測頭不僅接收主幹表示 $h_t$，還額外接收前 $k-1$ 個 Heads 所提出候選 token 的 Embedding 投影。
- **輕量化狀態傳遞**：透過緊湊的特徵融合層保持低運算開銷，使草稿生成具備自迴歸條件因果性，卻無須像完整大模型那樣執行沈重的自注意力迭代。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **候選樹命中率與接受長度躍升**：在 Vicuna-7B/13B 等模型上的廣泛測試表明，在相同的候選樹節點預算下，Hydra 的序列依賴設計顯著提升了長步預測的精準度，平均接受長度相較 Medusa 提升了 **15% 至 25%**。
- **端到端加速表現**：在 Batch Size=1 的單用戶低延遲場景中，實現了約 **2.5× 至 2.7×** 的加速比，超越了同等規模的獨立預測頭方案。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **並行度與因果依賴的工程權衡**：引入序列依賴意味著 Draft Heads 之間無法完全無等待並行生成，雖然計算極為輕量，但在大 Batch Size 顯存帶寬飽和時，計算流水線的排程開銷可能微幅上升。
- **僅作用於推論階段的 Draft Quality**：Hydra 聚焦於後訓練微調與推論草稿品質，不能作為改變主幹模型基礎表徵能力的證據。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Zachary Ankner, Rishab Parthasarathy, Aniruddha Nrusimha, Christopher Rinard, Jonathan Ragan-Kelley, William Brandon. (2024). *Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding*. COLM 2024. [Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding](https://openreview.net/forum?id=FbhjirzvJG)。

    閱讀重點：候選 embedding的傳遞；Hydra++ training recipe；與Medusa在同workload的比較。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

### 開源程式碼（Open Source Code）

1. [zankner/Hydra](https://github.com/zankner/Hydra)。

    閱讀重點：查看作者公開的 Hydra/Hydra++ heads、訓練與benchmark配置。

<reviewkit>
<takeaways>
- Hydra 揭示了獨立 MTP Heads 忽視中間候選條件依賴的「邊際不一致」缺陷。
- 透過讓後續 Heads 看見前續預測 token 的 Embedding，建立了輕量級的序列依賴鏈。
- 在同等候選預算下，顯著拉長了平均接受長度，相較 Medusa 提升 15%–25%。
- 本質上是在 Draft 生成並行度與因果條件充分性之間達成了更優的平衡點。
</takeaways>
<qprompt/>
</reviewkit>
