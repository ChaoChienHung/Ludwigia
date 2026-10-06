<meta>
Title: Qwen3-Next 的 MTP：原生多步預測與訓練推論一致性
Summary: 以官方文章整理 Qwen3-Next 的原生 MTP 與多步訓練主張，保留待補的技術細節。
Slug: qwen3-next-mtp-zh-tw
Output: notes/qwen3-next-mtp/qwen3-next-mtp-zh-tw.html
CanonicalId: qwen3-next-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-10-06
</meta>

# Qwen3-Next 的 MTP：原生多步預測與訓練推論一致性

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

官方文章明示原生 MTP 同時用於整體性能與 speculative decoding，並以 multi-step training 改善訓練與推論的一致性。此筆記以官方文章為主要證據，目前未另列獨立技術論文。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

多步 conditioning 與 loss；MTP 獨立消融；避免把 hybrid attention 與稀疏 MoE 的整體速度提升歸因於 MTP。

## 參考資料（References）

### 技術文章與模型卡（Technical Articles）

1. [Qwen3-Next: Towards Ultimate Training & Inference Efficiency｜官方文章](https://qwen.ai/blog?id=qwen3-next)。

    閱讀重點：Multi-Token Prediction 段落的原生多步訓練，以及整體架構速度與 MTP 的歸因差異。
2. [Qwen/Qwen3-Next-80B-A3B-Instruct｜官方模型卡](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct)。

    閱讀重點：核對 Qwen/Qwen3-Next-80B-A3B-Instruct 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。
3. [Qwen/Qwen3-Next-80B-A3B-Thinking｜官方模型卡](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Thinking)。

    閱讀重點：核對 Qwen/Qwen3-Next-80B-A3B-Thinking 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

### 開源程式碼（Open Source Code）

1. [QwenLM/Qwen3-Next｜官方發布 repo（目前轉向 Qwen3.8，版本證據請讀原文章／模型卡）](https://github.com/QwenLM/Qwen3-Next)。

    閱讀重點：對照該項目的模型發布、可取得的權重與使用方式；框架支援本身不能取代模型採用證據。

<reviewkit>
<takeaways>
- 官方明示 native MTP 和 multi-step training。
- 整體架構速度不能視為 MTP 的獨立收益。
</takeaways>
<qprompt/>
</reviewkit>
