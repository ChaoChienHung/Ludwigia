<meta>
Title: ProphetNet：Future N-gram Prediction 的訓練前史
Summary: 整理 ProphetNet: Predicting Future N-gram for Sequence-to-Sequence Pre-training 的研究定位、一手參考資料與後續補寫方向。
Slug: prophetnet-zh-tw
Output: notes/prophetnet/prophetnet-zh-tw.html
CanonicalId: prophetnet
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# ProphetNet：Future N-gram Prediction 的訓練前史

微軟亞洲研究院在 EMNLP Findings 2020 發表的 ProphetNet（《ProphetNet: Predicting Future N-gram for Sequence-to-Sequence Pre-training》），是當代 Transformer 架構中探索「未來多步預測目標」的重要歷史前身。該研究透過獨創的 N-stream Self-Attention，成功將 Seq2Seq 預訓練目標從單步預測拓展為未來的 N-gram 預測。

## 研究問題與架構設計（Architecture & Objective）

依據 ProphetNet 論文：
- **N-stream 自注意力機制**：在傳統自注意力中引入專門的主自注意力流（Main Stream）與多個預測流（Predicting Streams）。主流專門負責累積前綴歷史以更新隱層表示，而各預測流則負責利用當前主表示分別計算未來第 $k$ 個 token 的注意力權重。
- **Future N-gram 預測損失**：在解碼器端，模型在每個時間步 $t$ 被要求同時預測未來的 $n$ 個連續 token $(x_{t+1}, \dots, x_{t+n})$，各位置的交叉熵損失共同指導編碼器與解碼器參數的更新。
- **防作弊因果遮罩**：精確設計各預測流的 Attention Mask，嚴格保證預測較遠未來 token 時不會偷看到中間的真實 Ground Truth token。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **文本摘要與問答生成表現**：在 CNN/DailyMail、Gigaword 文本摘要以及 SQuAD 問題生成基準上，ProphetNet 顯著超越了同等參量的標準 BART 與 T5 基線。
- **緩解局部最優偏差**：實驗表明，要求模型預測未來 N-gram 能夠有效防止解碼器陷入對相鄰下一個 token 的過度貪婪擬合，生成更加流暢且具備全局宏觀結構的長文本。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **Seq2Seq 架構與當代 Decoder-only 的結構分野**：ProphetNet 奠基於 Encoder-Decoder 結構與專門的 N-stream 注意力，這與當代主流 Decoder-only 大模型直接掛載輕量 MTP Heads 的主流做法存在顯著工程差異。
- **規劃動機非普適推理證明**：作者強調預測未來 N-gram 具有「前瞻規劃（Look-ahead Planning）」的直覺，但這在當時主要體現於抽象摘要的語義連貫性，不能直接外推為現代大模型複雜數學推導能力的泛化依據。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Weizhen Qi, Yu Yan, Yeyun Gong, Dayiheng Liu, Nan Duan, Jiusheng Chen, Ruofei Zhang, Ming Zhou. (2020). *ProphetNet: Predicting Future N-gram for Sequence-to-Sequence Pre-training*. Findings of EMNLP 2020. [ProphetNet: Predicting Future N-gram for Sequence-to-Sequence Pre-training](https://aclanthology.org/2020.findings-emnlp.217/)。

    閱讀重點：future n-gram loss；n-stream causal visibility；與decoder-only MTP的差異。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

### 開源程式碼（Open Source Code）

1. [microsoft/ProphetNet](https://github.com/microsoft/ProphetNet)。

    閱讀重點：對照 ProphetNet 原始實作與訓練資源；repo 同時包含其他研究，需辨識子項目。

<reviewkit>
<takeaways>
- ProphetNet 透過 N-stream Self-Attention 率先實現了未來 N-gram 的預訓練自監督目標。
- 在文本摘要與問答生成等任務上顯著改善了長程依賴與局部過擬合問題。
- 採用 Encoder-Decoder 架構，與現代 Decoder-only 的輕量 MTP 模組存在工程差異。
- 構成了 MTP 思想從早期預訓練向現代大語言模型演進的重要歷史橋樑。
</takeaways>
<qprompt/>
</reviewkit>
