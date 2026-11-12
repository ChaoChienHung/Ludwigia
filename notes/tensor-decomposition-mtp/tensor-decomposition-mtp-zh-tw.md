<meta>
Title: Tensor Decomposition MTP：從獨立邊際到聯合預測
Summary: 整理 Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition 的研究定位、一手參考資料與後續補寫方向。
Slug: tensor-decomposition-mtp-zh-tw
Output: notes/tensor-decomposition-mtp/tensor-decomposition-mtp-zh-tw.html
CanonicalId: tensor-decomposition-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# Tensor Decomposition MTP：從獨立邊際到聯合預測

Artem Basharin 等人在 2024 年底提出的《Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition》，從高維多線性代數的視角，為多 token 預測的**聯合機率分佈建模（Joint Distribution Modeling）**提供了理論突破。該研究利用張量 CP 分解（CANDECOMP/PARAFAC）突破了傳統獨立頭的 Rank-1 局限性。

## 研究問題與架構設計（Architecture & Objective）

依據論文數學推導：
- **獨立 Heads 的本質：Rank-1 聯合分佈**：傳統獨立 MTP Heads 將未來 $K$ 個 token 的聯合機率強行假設為各邊際的乘積：
  $$q(x_{t+1}, \dots, x_{t+K} \mid x_{\le t}) = \prod_{k=1}^K q_k(x_{t+k} \mid x_{\le t})$$
  這在幾何上對應於一個秩為 1（Rank-1）的極高維概率張量，無法捕捉未來詞彙之間的複雜互資訊與多模態分歧。
- **Rank-$R$ 張量 CP 分解**：論文將未來的聯合條件分佈張量表示為 $R$ 個 Rank-1 張量的凸組合加權和：
  $$q(x_{t+1}, \dots, x_{t+K} \mid x_{\le t}) = \sum_{r=1}^R w_r \prod_{k=1}^K q_{k, r}(x_{t+k} \mid x_{\le t})$$
  透過張量分解，以微小的參數增量引入了多個隱含「未來路徑模式（Modes）」，使模型能夠同時維護多條語義自洽的潛在未來分支。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **聯合分佈保真度提升**：在合成語言建模與程式碼生成的評測中，Rank-$R$ 張量分解顯著降低了未來 token 聯合分佈的困惑度（Joint Perplexity）。
- **推測解碼接受率改善**：在自推測解碼中，由於提出的多 token 候選具備內在的模式一致性，多步接受率明顯優於單純獨立頭的預測方案。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **增加 Rank 存在計算開銷邊界**：增大張量分解的秩 $R$ 雖然能增強分佈表達能力，但也顯著放大了 Head 的計算複雜度與詞表投影矩陣的顯存佔用；當 $R$ 過大時，Draft Head 自身的計算延遲將抵消跳步帶來的時間節省。
- **預印本研究定位**：該方法為極具數學優雅性的前沿探索，在超大規模工業級模型上的完整穩定性與擴展法則（Scaling Law）尚待進一步的大規模驗證。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Artem Basharin, Andrei Chertkov, Ivan Oseledets. (2024). *Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition*. arXiv preprint arXiv:2410.17765. [Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition](https://arxiv.org/abs/2410.17765)。

    閱讀重點：rank-1直覺；rank-r CP分解、採樣與loss；rank/vocabulary/速度的權衡。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 傳統獨立 MTP Heads 在數學上等價於極度嚴苛的 Rank-1 聯合機率張量。
- Tensor Decomposition 引入 Rank-R CP 分解，能自然捕捉未來的多模態分支分歧。
- 在維持輕量參數量的前提下顯著降低了未來多步的聯合交叉熵損失。
- Rank 的取值存在理論表達力與推論計算延遲之間的實體權衡。
</takeaways>
<qprompt/>
</reviewkit>
