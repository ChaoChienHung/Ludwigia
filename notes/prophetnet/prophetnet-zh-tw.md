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
LastModified: 2026-10-06
</meta>

# ProphetNet：Future N-gram Prediction 的訓練前史

這是待補寫的文獻資源種子，先建立方法定位與閱讀入口，尚不是完整 deep dive。

## 研究問題與方法定位

encoder-decoder 以 future n-gram objective 與 n-stream attention 預測多個未來 token。實驗為摘要與問題生成；作者提出降低局部相關依賴的動機，尚不等於證明通用規劃能力。

## 後續補寫方向

future n-gram loss；n-stream causal visibility；與decoder-only MTP的差異。

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
- 研究結論必須連同訓練對象、任務與測試條件閱讀。
- 多 token 候選品質、驗證契約與實際加速需要分開評估。
</takeaways>
<qprompt/>
</reviewkit>

