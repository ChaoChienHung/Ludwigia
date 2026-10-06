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
LastModified: 2026-10-06
</meta>

# DeepSeek-V4 的 MTP：延續 V3 的訓練目標與模組

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

§2.1 明示沿用 V3 的 MTP 模組與目標，沒有修改這個策略。Pro 與 Flash 的 MTP depth 都是 1。這份筆記聚焦 MTP，其他長上下文架構與 optimizer 改動只作必要背景。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

§2.1 沿用範圍；§4.2 的 depth 與 loss 權重；不同解碼長度及架構改動的成本歸因。

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
- 報告直接確認沿用 V3 的 MTP 策略。
- Pro 與 Flash 的設定都為 depth 1。
</takeaways>
<qprompt/>
</reviewkit>

