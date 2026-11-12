<meta>
Title: Medusa：多預測頭、候選樹與驗證解碼
Summary: 整理 Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads 的研究定位、一手參考資料與後續補寫方向。
Slug: medusa-zh-tw
Output: notes/medusa/medusa-zh-tw.html
CanonicalId: medusa
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# Medusa：多預測頭、候選樹與驗證解碼

由普林斯頓大學等團隊在 ICML 2024 發表的 Medusa（《Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads》），徹底解決了傳統 Speculative Decoding 依賴外部獨立 Draft Model 的維運痛點，開創了利用多預測頭建構「候選樹（Candidate Tree）」進行平行樹狀驗證（Tree Attention Verification）的推論架構。

## 研究問題與架構設計（Architecture & Objective）

Medusa 針對凍結與聯合訓練提供了雙軌架構（§2.2）：
- **多預測頭設計**：在凍結的主模型最後一層隱層狀態頂部，掛載 $K$ 個輕量的多層感知機（ResBlock / MLP Heads），分別負責預測第 $t+1, t+2, \dots, t+K$ 個未來的 token。
- **候選樹與 Tree Attention**：各 Head 獨立預測出 Top-$k$ 候選 token，透過笛卡爾積組合或拓撲裁剪生成包含多條可能路徑的「候選樹」。在驗證階段，設計專門的 2D 樹狀注意力遮罩（Tree Attention Mask），使主模型只需 **單次 Forward Pass** 即可同時平行打分整棵樹上的所有候選路徑。
- **訓練模式劃分**：
  - **Medusa-1（Frozen Backbone）**：完全凍結主模型，僅訓練 $K$ 個附加 Heads。
  - **Medusa-2（Joint Training）**：解凍主模型聯合更新，需要結合主 LM 損失、差異化學習率（Backbone 學習率遠小於 Head）與學習率 Warmup。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **推論加速倍數**：在 Vicuna 等常用對話模型上，Medusa-1 實測帶來 **>2.2 倍** 的無損吞吐提升；Medusa-2 透過聯合特徵對齊進一步達到了 **2.3× 至 3.6×** 的端到端加速。
- **Typical Acceptance 模式**：除了嚴格保留貪婪輸出的驗證外，Medusa 提出了基於截斷熵與閾值的 Typical Acceptance 啟發式採樣，在幾乎不損害下游對話品質的前提下大幅提升了接受長度。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **兩種訓練模式的結論不可混淆**：Medusa-1 凍結主幹獲得的高加速，純粹證明了 Draft Head 對主幹表徵的採集效率，不能被拿來宣稱「主模型的邏輯能力變得更強」。
- **Typical Acceptance 的非嚴格性**：Typical Acceptance 屬於近似（Approximate）分佈模式，它保留的是實用對話評測指標，而非在數學上嚴格精確（Exact）復現目標模型的隨機採樣分佈。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Tianle Cai, Yuhong Li, Zhengyang Geng, Hongwu Peng, Jason D. Lee, Deming Chen, Tri Dao. (2024). *Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads*. ICML 2024. [Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://proceedings.mlr.press/v235/cai24b.html)。

    閱讀重點：§2.1候選樹、§2.2兩種訓練、§2.3 typical acceptance與exact sampling差別。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

### 開源程式碼（Open Source Code）

1. [FasterDecoding/Medusa](https://github.com/FasterDecoding/Medusa)。

    閱讀重點：查看 Medusa-1/2 訓練指令、tree attention 與公開 checkpoints。

<reviewkit>
<takeaways>
- Medusa 確立了多 Head 候選樹 + Tree Attention 單步驗證的自推測解碼架構。
- Medusa-1 凍結主幹實現 >2.2× 加速；Medusa-2 聯合訓練實現 2.3×–3.6× 加速。
- 需嚴格區分 Exact 貪婪保留與 Typical Acceptance 近似採樣的分佈契約。
- 凍結主幹的 Medusa-1 加速不能作為主模型推理能力提升的證據。
</takeaways>
<qprompt/>
</reviewkit>
