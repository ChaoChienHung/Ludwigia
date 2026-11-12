<meta>
Title: Qwen3.5 的 MTP：多步訓練與原生推測解碼資源
Summary: 以 Qwen3.5-397B-A17B 官方模型卡確認 MTP 採用，整理官方文章與部署資源。
Slug: qwen3-5-mtp-zh-tw
Output: notes/qwen3-5-mtp/qwen3-5-mtp-zh-tw.html
CanonicalId: qwen3-5-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-11-12
</meta>

# Qwen3.5 的 MTP：多步訓練與原生推測解碼資源

2026 年初發布的 Qwen3.5-397B-A17B 官方模型卡正式將 MTP 部署契約納入千億級多模態智慧體模型。該案例最重要的意義在於展示了 MTP 在主流推論加速框架（如 SGLang、vLLM）中的工業標準化封裝。

## 研究問題與架構設計（Architecture & Objective）

依據 Qwen3.5-397B-A17B 官方模型卡與博客（2026-02）：
- **多步 MTP 原生預訓練**：模型概覽明確指出模型採用 multi-step MTP 原生訓練。
- **推論引擎開箱即用**：官方模型卡直接給出主流高並發服務引擎的配置指令：
  - **SGLang**：支援 `--speculative-algorithm NEXTN` 參數。
  - **vLLM**：支援 `--speculative-model qwen3_next_mtp` 專屬原生解碼參數。
- **無縫適配多模態任務**：在多模態長文本對話與複雜代理工具調用中，MTP 模組均能維持穩定的預測生成。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **工業級部署支援**：無需第三方額外蒸餾或微調 Draft Head，開發者拉取官方檢查點即可直接在生產叢集中開啟推測解碼服務。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **檢查點限定契約**：官方模型卡確認了 Qwen3.5-397B-A17B 這個特定旗艦檢查點的原生 MTP，不能未經查驗直接將此結論套用到 Qwen3 或 Qwen3.5 的所有其他大小或蒸餾版本。
- **模型卡不提供學術消融數據**：模型卡聚焦於部署與使用說明，未提供獨立切除 MTP 模組的嚴格學術對比數據。

## 參考資料（References）

### 技術文章與模型卡（Technical Articles）

1. [Qwen3.5: Towards Native Multimodal Agents｜官方文章](https://qwen.ai/blog?id=qwen3.5)。

    閱讀重點：Model Overview 的 multi-step-trained MTP 與 Serving Qwen3.5 的 MTP 指令。
2. [Qwen/Qwen3.5-397B-A17B｜官方模型卡](https://huggingface.co/Qwen/Qwen3.5-397B-A17B?library=transformers)。

    閱讀重點：核對 Qwen/Qwen3.5-397B-A17B 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

<reviewkit>
<takeaways>
- Qwen3.5-397B-A17B 官方模型卡直接載明原生多步 MTP 訓練。
- 官方支援 SGLang (NEXTN) 與 vLLM (qwen3_next_mtp) 原生推測解碼部署指令。
- 此項證據限定於特定官方發布之檢查點，不延伸至未核對的系列其他尺寸。
</takeaways>
<qprompt/>
</reviewkit>
