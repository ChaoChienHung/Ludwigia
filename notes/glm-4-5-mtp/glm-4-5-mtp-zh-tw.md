<meta>
Title: GLM-4.5 的 MTP：MoE 預測層與推論加速
Summary: 整理 GLM-4.5 與 GLM-4.5-Air 技術報告中明示的 MTP 模型配置與用途。
Slug: glm-4-5-mtp-zh-tw
Output: notes/glm-4-5-mtp/glm-4-5-mtp-zh-tw.html
CanonicalId: glm-4-5-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-11-12
</meta>

# GLM-4.5 的 MTP：MoE 預測層與推論加速

智譜 AI（Zhipu AI）在 GLM-4.5 與 GLM-4.5-Air 基礎模型報告中，正式將 MTP 列為原生架構的一等公民。與多數稠密（Dense）MTP 設計不同，GLM-4.5 率先將混合專家架構（MoE）引入 MTP 預測層，為超大規模稀疏模型的自推測解碼開闢了全新路徑。

## 研究問題與架構設計（Architecture & Objective）

依據 GLM-4.5 技術報告（Architecture Section & Table 1）：
- **原生 MoE MTP Layer**：GLM-4.5 與輕量版 GLM-4.5-Air 均在頂部配置了 1 個 MoE MTP Layer（Table 1 明列 MTP layer=1）。
- **推論導向設計**：該 MoE MTP 層直接服務於推論階段的 Speculative Decoding，能夠根據當前上下文動態路由至專屬專家，提高預測未來 token 的命中率。
- **與同類模型的對比基準**：GLM-4.5 報告中的架構對比表特別將 Kimi K2 列為對照項，標註 Kimi K2 的 MTP layer=0，證實不同團隊在同代架構抉擇上的差異。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **旗艦與輕量版全面搭載**：GLM-4.5（千億級旗艦）與 GLM-4.5-Air（高效能輕量版）均原生包含該設計，證實 MoE MTP 結構具有良好的規模外推性。
- **服務框架原生整合**：支援自研與開源推理運行時的高速 Speculative Verification。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **架構採用不等於單獨訓練消融**：所讀報告段落明確確立了模型的「原生採用」與「推論用途」，但未提供單獨切除 MoE MTP 層的預訓練消融損失曲線，不可任意斷言該層為 Backbone 帶來了多少單獨百分比的提升。
- **家族繼承的謹慎性**：該結論嚴格限定於 GLM-4.5 / Air 版本，不可盲目延伸到 GLM 系列的所有早期或特定衍生型號。

## 參考資料（References）

### 學術論文（Academic Literature）

1. GLM-4.5 Team. (2025). *GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models*. arXiv preprint arXiv:2508.06471. [GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models](https://arxiv.org/abs/2508.06471)。

    閱讀重點：Architecture 與 Table 1 的 GLM-4.5／Air 一個 MoE MTP 層設定。

### 技術文章與模型卡（Technical Articles）

1. [zai-org/GLM-4.5｜官方模型卡](https://huggingface.co/zai-org/GLM-4.5)。

    閱讀重點：核對 zai-org/GLM-4.5 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。
2. [zai-org/GLM-4.5-Air｜官方模型卡](https://huggingface.co/zai-org/GLM-4.5-Air)。

    閱讀重點：核對 zai-org/GLM-4.5-Air 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

### 開源程式碼（Open Source Code）

1. [zai-org/GLM-4.5｜官方發布 repo](https://github.com/zai-org/GLM-4.5)。

    閱讀重點：對照該項目的模型發布、可取得的權重與使用方式；框架支援本身不能取代模型採用證據。

<reviewkit>
<takeaways>
- GLM-4.5 與 GLM-4.5-Air 原生搭載 1 個 MoE MTP Layer，專門支援推論自推測解碼。
- GLM-4.5 報告對比表明確標註 Kimi K2 的 MTP layer=0，構成明確的架構對照。
- 確認原生採用與推論用途，但應避免將模型整體綜合提升過度歸因於單一 MTP 模組。
</takeaways>
<qprompt/>
</reviewkit>
