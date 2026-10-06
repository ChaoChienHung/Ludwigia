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
LastModified: 2026-10-06
</meta>

# GLM-4.5 的 MTP：MoE 預測層與推論加速

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

GLM-4.5 與 GLM-4.5-Air 都加入一個 MoE MTP 層，以支援 speculative decoding。這份資源筆記先記錄模型採用與架構位置；獨立的 backbone 訓練收益與加速倍數仍須另外查證。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

Architecture 與 Table 1；預測層共享資訊與梯度路徑；推論部署的驗證與成本。

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
- 兩個指定版本都具有一個 MTP 層。
- 官方明示用途為推測解碼。
</takeaways>
<qprompt/>
</reviewkit>

