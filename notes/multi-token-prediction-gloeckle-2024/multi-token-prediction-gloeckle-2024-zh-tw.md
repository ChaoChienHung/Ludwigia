<meta>
Title: MTP 預訓練：共享表示與獨立未來預測頭
Summary: 整理 Better & Faster Large Language Models via Multi-token Prediction 的研究定位、一手參考資料與後續補寫方向。
Slug: multi-token-prediction-gloeckle-2024-zh-tw
Output: notes/multi-token-prediction-gloeckle-2024/multi-token-prediction-gloeckle-2024-zh-tw.html
CanonicalId: multi-token-prediction-gloeckle-2024
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# MTP 預訓練：共享表示與獨立未來預測頭

Meta AI 的 Fabian Gloeckle 等人在 ICML 2024 發表的標誌性論文《Better & Faster Large Language Models via Multi-token Prediction》，是推動當代大語言模型走向多 token 預測的開山之作。該研究從最基本的資訊理論與梯度累積出發，形式化了 MTP 如何作為一種自監督正則化機制，大幅改善程式碼生成等長程依賴任務的樣本效率。

## 研究問題與架構設計（Architecture & Objective）

論文形式化了標準 NTP 與 MTP 的損失差異（§2）：
- **標準 NTP 目標**：對給定長度為 $T$ 的前綴序列，標準自迴歸僅最小化相鄰下一個 token 的負對數似然：
  $$\mathcal{L}_{\text{NTP}} = - \sum_{t=1}^T \log p(x_{t+1} \mid x_{\le t})$$
- **獨立 Heads MTP 目標**：共享同一個主幹（Shared Trunk）提取特徵 $h_t$，其後分叉出 $n$ 個相互獨立的 Transformer Heads，分別預測從未來距離 $k=1$ 到 $n$ 的 token，且各 Head 共享同一個輸出 Unembedding 矩陣：
  $$\mathcal{L}_{\text{MTP}} = - \sum_{t=1}^T \sum_{k=1}^n \lambda_k \log q_k(x_{t+k} \mid x_{\le t})$$
- **梯度累積機制**：在反向傳播中，同一位置 $t$ 的表徵 $h_t$ 同時累積來自多個未來位置 $(x_{t+1}, \dots, x_{t+n})$ 的交叉熵梯度，強迫底層表示提早編碼能決定未來多步發展的關鍵全局特徵。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

論文在不同規模（0.3B 至 13B）與任務上進行了深入實證（§3–5）：
- **程式碼生成的顯著躍升**：在 13B 參數模型上，MTP 在 HumanEval Pass@1 上取得了約 **12%** 的相對提升，在 MBPP 上取得了約 **17%** 的相對提升（此為相對增幅，非百分點）。在競技編程（Codeforces）等需長程算法規劃的任務中表現尤為亮眼。
- **自推測解碼加速**：訓練好的獨立 Heads 可直接作為 Draft Heads 進行自推測解碼，實測獲得約 **3×** 的推論吞吐提升。
- **訓練耗時的實際代價（Appendix C）**：MTP 並非零成本訓練。在 13B 規模、4-token 預測配置下，即使採用了高度優化的 FSDP，實際 Wall-clock 訓練時間仍為標準 NTP 的 **1.09 倍**（0.3B 模型上為 **1.22 倍**）。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **機制解釋屬於假說（Speculation）**：作者在 §5 中坦承，「MTP 強迫模型在 Choice Points 提早規劃」屬於極具啟發性的直覺假說，而非數學定理；合成任務雖支持局部決策權重的改變，但不可無限上綱為「模型已具備通用的主動規劃心智」。
- **自然語言評測的非均勻性**：在常識問答與多選題等一般 NLP 基準上，MTP 未能取得如代碼領域般廣泛的超額收益，在 4-token 的極端配置下甚至可能出現微幅退化。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Fabian Gloeckle, Badr Youbi Idrissi, Baptiste Rozière, David Lopez-Paz, Gabriel Synnaeve. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 loss 與架構、§3 程式與自然語言差異、§5機制假說、Appendix C 額外訓練成本。

2. Leviathan, Y., Kalman, M., & Matias, Y. (2023). *Fast Inference from Transformers via Speculative Decoding*. ICML 2023. [Fast Inference from Transformers via Speculative Decoding](https://proceedings.mlr.press/v202/leviathan23a.html)。

    閱讀重點：修正 rejection sampling 如何保留 target 分布；區分候選預測與驗證程序。

<reviewkit>
<takeaways>
- Gloeckle 等人確立了 Shared Trunk + Independent Heads + Shared Unembedding 的經典 MTP 範式。
- 13B 程式碼模型在 HumanEval 與 MBPP 上分別取得約 12% 與 17% 的顯著相對提升。
- 訓練 Wall-clock Time 存在額外開銷（13B 上約為 NTP 的 1.09 倍），額外監督並非完全免費。
- 「Choice Points 規劃假說」屬於合理推測而非嚴格定論，自然語言任務收益弱於結構化程式碼。
</takeaways>
<qprompt/>
</reviewkit>
