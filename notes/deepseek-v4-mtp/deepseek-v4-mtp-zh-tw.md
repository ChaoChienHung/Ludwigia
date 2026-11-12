<meta>
Title: DeepSeek-V4 的 MTP：延續 V3 的訓練目標與模組
Summary: 整理 DeepSeek-V4-Pro 與 Flash 技術報告中直接確認的 MTP 延續契約。
Slug: deepseek-v4-mtp-zh-tw
Output: notes/deepseek-v4-mtp/deepseek-v4-mtp-zh-tw.html
CanonicalId: deepseek-v4-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-11-12
</meta>

# DeepSeek-V4 的 MTP：延續 V3 的訓練目標與模組

DeepSeek-V4（2026-04 官方發布，2026-06 論文）在百萬級上下文智慧模型中，全面繼承了 DeepSeek-V3 的 MTP 設計契約。這為我們觀察 MTP 架構在大版本跨代升級中的穩定性與延續性提供了最佳標本。

## 研究問題與架構設計（Architecture & Objective）

依據 DeepSeek-V4 技術報告（§2.1 & §4.2.1）：
- **完整繼承架構契約**：報告明確指出，DeepSeek-V4-Pro 與 DeepSeek-V4-Flash 均原汁原味地保留了 DeepSeek-V3 所採用的 Sequential MTP 模組與輔助訓練目標，未進行結構性改動。
- **預測深度維持 $	ext{depth} = 1$**：在極長上下文（Million-Token Context）與全新 MoE 路由的背景下，MTP 模組的深度依舊維持為 1。
- **損失權重排程（Loss Weight Schedule）**：在 Flash 版本的訓練細節中，MTP 損失初始權重設為 0.3，並在預訓練後期平滑衰減至 0.1。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **百萬上下文下的穩健性**：證實了 Sequential MTP 模組在極長上下文窗口與新型注意力架構下依舊能穩定運作，未發生數值發散或顯存崩潰。
- **官方透明度承諾**：官方發布時間線與 Hugging Face 模型卡均同步確認了 Pro 與 Flash 檢查點的 MTP 屬性。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **家族延續案例，不可臆測新機制**：V4 報告展示的是成功經驗的平移；不可因為 V4 在長文本或路由機制上有重大創新，就主觀推論其 MTP 本身引入了未被文檔記載的新結構。
- **損失衰減排程的特定性**：0.3 到 0.1 的衰減排程屬於 Flash 特定的工程超參數，不可直接外推至所有大模型訓練。

## 參考資料（References）

### 學術論文（Academic Literature）

1. DeepSeek-AI. (2026). *DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence*. arXiv preprint arXiv:2606.19348. [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://arxiv.org/abs/2606.19348)。

    閱讀重點：§2.1 沿用 V3 MTP 的直接證據、§4.2 的 depth 1 與 loss weight。

### 技術文章與模型卡（Technical Articles）

1. [DeepSeek Transparency Center｜模型發布日期與文件入口](https://www.deepseek.com/en/transparency/)。

    閱讀重點：核對 DeepSeek-V4 在 2026-04-24 的官方發布日期，與技術報告發表日期區分。
2. [deepseek-ai/DeepSeek-V4-Pro｜官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)。

    閱讀重點：核對 deepseek-ai/DeepSeek-V4-Pro 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。
3. [deepseek-ai/DeepSeek-V4-Flash｜官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)。

    閱讀重點：核對 deepseek-ai/DeepSeek-V4-Flash 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

<reviewkit>
<takeaways>
- DeepSeek-V4-Pro 與 Flash 完全沿用 V3 的 Sequential MTP 模組與 depth=1 契約。
- Flash 訓練揭露了 MTP loss weight 由 0.3 衰減至 0.1 的排程策略。
- 該案例展示了 MTP 作為成熟基礎架構在跨代百萬上下文模型中的工程延續性。
</takeaways>
<qprompt/>
</reviewkit>
