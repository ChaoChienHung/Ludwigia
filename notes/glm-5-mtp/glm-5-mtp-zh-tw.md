<meta>
Title: GLM-5 的 MTP：共享參數與多步接受率
Summary: 整理 GLM-5 以共享參數跨多個預測步訓練 MTP，以及 RL rollout 的應用。
Slug: glm-5-mtp-zh-tw
Output: notes/glm-5-mtp/glm-5-mtp-zh-tw.html
CanonicalId: glm-5-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-10-06
</meta>

# GLM-5 的 MTP：共享參數與多步接受率

這是一份待補寫的文獻資源種子，用來建立閱讀入口與來源關係，尚不是完整的方法深度解析。

## 研究問題與方法定位

報告以共享參數的三個 MTP 訓練步減少訓練與推論落差。架構表的一個 MTP 層與三步訓練相容：多步不必代表多份權重。推論與 RL rollout 都使用 MTP。

框架支援 MTP 或 speculative decoding 本身不足以證明模型採用；本筆記以指定版本的一手文件為準。

## 後續補寫方向

§2.1 shared MTP；私有 prompt 接受長度比較；§3.6 長尾 rollout 的速度與訓練等待。

## 參考資料（References）

### 學術論文（Academic Literature）

1. GLM-5 Team. (2026). *GLM-5: from Vibe Coding to Agentic Engineering*. arXiv preprint arXiv:2602.15763. [GLM-5: from Vibe Coding to Agentic Engineering](https://arxiv.org/abs/2602.15763)。

    閱讀重點：§2.1 三步參數共享、§3.6.2 small-batch RL rollout 的長尾收益。

### 技術文章與模型卡（Technical Articles）

1. [zai-org/GLM-5｜官方模型卡](https://huggingface.co/zai-org/GLM-5)。

    閱讀重點：核對 zai-org/GLM-5 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

<reviewkit>
<takeaways>
- 多個預測步可共用一份參數。
- RL rollout 加速與 backbone 能力改善需分開評估。
</takeaways>
<qprompt/>
</reviewkit>

