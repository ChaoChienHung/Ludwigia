<meta>
Title: DeepSeek-V3 的 MTP：主模型監督與自推測解碼
Summary: 以 DeepSeek-V3 技術報告為入口，整理序列式 MTP 的訓練監督、消融證據與推論加速。
Slug: deepseek-v3-mtp-zh-tw
Output: notes/deepseek-v3-mtp/deepseek-v3-mtp-zh-tw.html
CanonicalId: deepseek-v3-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-10-06
</meta>

# DeepSeek-V3 的 MTP：主模型監督與自推測解碼

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

共享 embedding 與 output head，串接 Transformer MTP 模組；實際 depth 為 1。額外預測 loss 與 backbone 聯合訓練，推論可移除模組，也可用它提出候選並交由主模型驗證。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

§2.2 架構與 loss；§4.5.1 backbone 消融；§5.4.3 接受率與 TPS 的量測條件。

## 參考資料（References）

### 學術論文（Academic Literature）

1. DeepSeek-AI. (2024). *DeepSeek-V3 Technical Report*. arXiv preprint arXiv:2412.19437. [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437)。

    閱讀重點：§2.2 MTP 架構與 loss、§4.5.1 訓練消融、§5.4.3 接受率與 TPS。

### 技術文章與模型卡（Technical Articles）

1. [deepseek-ai/DeepSeek-V3-Base｜官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3-Base)。

    閱讀重點：核對 deepseek-ai/DeepSeek-V3-Base 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。
2. [deepseek-ai/DeepSeek-V3｜官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3)。

    閱讀重點：核對 deepseek-ai/DeepSeek-V3 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

### 開源程式碼（Open Source Code）

1. [deepseek-ai/DeepSeek-V3｜官方發布 repo](https://github.com/deepseek-ai/DeepSeek-V3)。

    閱讀重點：對照該項目的模型發布、可取得的權重與使用方式；框架支援本身不能取代模型採用證據。

<reviewkit>
<takeaways>
- 聯合訓練與推論用途是不同收益。
- 實際一個 MTP 模組提供一個額外 token 預測。
</takeaways>
<qprompt/>
</reviewkit>

