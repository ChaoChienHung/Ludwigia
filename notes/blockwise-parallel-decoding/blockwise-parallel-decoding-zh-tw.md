<meta>
Title: Blockwise Parallel Decoding：猜測多步，再驗證最長前綴
Summary: 整理 Blockwise Parallel Decoding for Deep Autoregressive Models 的研究定位、一手參考資料與後續補寫方向。
Slug: blockwise-parallel-decoding-zh-tw
Output: notes/blockwise-parallel-decoding/blockwise-parallel-decoding-zh-tw.html
CanonicalId: blockwise-parallel-decoding
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# Blockwise Parallel Decoding：猜測多步，再驗證最長前綴

Google 團隊（Mitchell Stern, Noam Shazeer, Jakob Uszkoreit）在 NeurIPS 2018 發表的《Blockwise Parallel Decoding for Deep Autoregressive Models》，是今日所有推測解碼（Speculative Decoding）與 MTP 驗證機制的歷史奠基之作。該論文首次確立了「多步並行前瞻預測（Proposal）+ 昂貴模型打分並截取最長已驗證前綴（Prefix Verification）」的核心骨架。

## 研究問題與架構設計（Architecture & Objective）

依據 NeurIPS 2018 論文：
- **塊狀前瞻預測（Block Proposal）**：在自迴歸生成的第 $t$ 步，利用輕量輔助預測前饋網絡（Proposal Heads）一次性輸出未來 $K$ 個位置的 token 猜測塊 $(x_{t+1}, \dots, x_{t+K})$。
- **平行打分（Scoring Pass）**：將當前已知前綴與這 $K$ 個候選拼合成一段序列，輸入至完整的深層自迴歸模型進行單次平行前向打分，一次性獲得每個位置的真實條件概率分佈 $P(x_i \mid x_{<i})$。
- **最長公共前綴裁剪（Longest Verified Prefix）**：自左向右逐個核對候選與打分模型的最高機率選擇（Greedy Selection），一旦在某個位置發生分歧立即中斷截斷，並以打分模型的修正輸出作為最新結果。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **早期機器翻譯與語音驗證**：在 WMT 機器翻譯與語音特徵自迴歸解碼任務中，該方法在保持輸出文字與逐步貪婪解碼 100% 完全一致的前提下，取得了 **2× 至 4×** 的解碼步數縮減。
- **近似速度交換**：論文同時探索了允許容忍微小邊界概率差異的 Approximate 模式，進一步將解碼延遲壓低。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **Exact 的語意限定於 Greedy 判定**：2018 論文中所謂的「Exact（精確一致）」，是指完全精確復現確定性貪婪解碼（Greedy Argmax）的生成路徑；它尚未涉及現代大模型所依賴的「保留隨機溫度採樣分佈（Temperature Sampling Distribution）」的拒絕採樣數學機制。
- **原始實驗情境的歷史局限**：該論文誕生於經典 Transformer 翻譯模型時代，其驗證場景與當前數十億至千億級參量的指令遵循與長程對話 LLM 存在架構與顯存帶寬瓶頸上的顯著差異。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Mitchell Stern, Noam Shazeer, Jakob Uszkoreit. (2018). *Blockwise Parallel Decoding for Deep Autoregressive Models*. NeurIPS 2018. [Blockwise Parallel Decoding for Deep Autoregressive Models](https://arxiv.org/abs/1811.03115)。

    閱讀重點：proposal／scoring／accept流程；exact greedy的保證；approximate容許條件。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- Blockwise Parallel Decoding 是推測解碼的歷史始祖，確立了多步猜測加最長驗證前綴的範式。
- 透過單次並行 Scoring 替代逐步串行 Forward，顯著減少序列自迴歸迭代次數。
- 歷史論文中的 Exact 嚴格限定於 Greedy 解碼路徑完全一致，而非現代隨機採樣分佈保真。
- 原始任務為翻譯與序列轉導，閱讀時應理解其作為當代 LLM 候選驗證的架構原型地位。
</takeaways>
<qprompt/>
</reviewkit>
