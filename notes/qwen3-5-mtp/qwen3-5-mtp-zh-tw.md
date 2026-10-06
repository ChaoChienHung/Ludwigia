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
LastModified: 2026-10-06
</meta>

# Qwen3.5 的 MTP：多步訓練與原生推測解碼資源

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

Qwen3.5-397B-A17B 官方模型卡明示 MTP trained with multi-steps，並給出 SGLang 與 vLLM 的 MTP 部署指令。採用證據來自這個特定 checkpoint；完整 loss、訓練梯度與獨立消融留待補寫。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

官方模型卡的 Model Overview 與 MTP deployment；多模態 backbone 與 token drafter 的界面；獨立 MTP 收益。

## 參考資料（References）

### 技術文章與模型卡（Technical Articles）

1. [Qwen3.5: Towards Native Multimodal Agents｜官方文章](https://qwen.ai/blog?id=qwen3.5)。

    閱讀重點：Model Overview 的 multi-step-trained MTP 與 Serving Qwen3.5 的 MTP 指令。
2. [Qwen/Qwen3.5-397B-A17B｜官方模型卡](https://huggingface.co/Qwen/Qwen3.5-397B-A17B?library=transformers)。

    閱讀重點：核對 Qwen/Qwen3.5-397B-A17B 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

<reviewkit>
<takeaways>
- 特定官方 checkpoint 明示多步訓練 MTP。
- 部署指令支援原生推測解碼使用。
</takeaways>
<qprompt/>
</reviewkit>

