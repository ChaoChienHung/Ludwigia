<meta>
Title: MiMo-7B 的 MTP：聯合預訓練與凍結主模型後的預測頭訓練
Summary: 整理 MiMo-7B 如何分開主模型能力訓練與多步預測頭的推論優化。
Slug: mimo-7b-mtp-zh-tw
Output: notes/mimo-7b-mtp/mimo-7b-mtp-zh-tw.html
CanonicalId: mimo-7b-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-10-06
</meta>

# MiMo-7B 的 MTP：聯合預訓練與凍結主模型後的預測頭訓練

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

預訓練使用一個 MTP 層。之後複製出另兩個層，凍結主模型與第一個 MTP 層，只微調新增層以加速 speculative decoding。這個案例能清楚區分 backbone supervision 與 head-only fitting。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

§2.2 分階段訓練；不同預測距離的接受率；訓練能力收益與推論速度的測試條件。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Xiaomi LLM-Core Team. (2025). *MiMo: Unlocking the Reasoning Potential of Language Model -- From Pretraining to Posttraining*. arXiv preprint arXiv:2505.07608. [MiMo: Unlocking the Reasoning Potential of Language Model -- From Pretraining to Posttraining](https://arxiv.org/abs/2505.07608)。

    閱讀重點：§2.2 單層聯合預訓練、凍結主模型後的新增 heads 訓練與 AIME24 接受率。

### 開源程式碼（Open Source Code）

1. [XiaomiMiMo/MiMo｜官方發布 repo](https://github.com/XiaomiMiMo/MiMo)。

    閱讀重點：對照該項目的模型發布、可取得的權重與使用方式；框架支援本身不能取代模型採用證據。

<reviewkit>
<takeaways>
- pretraining 與 inference 的 MTP 設置不同。
- 新增 heads 的微調階段凍結主模型。
</takeaways>
<qprompt/>
</reviewkit>

