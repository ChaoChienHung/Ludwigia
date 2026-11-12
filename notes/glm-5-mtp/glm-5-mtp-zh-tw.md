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
LastModified: 2026-11-12
</meta>

# GLM-5 的 MTP：共享參數與多步接受率

GLM-5（2026-02 技術報告）代表了將 MTP 與「極致參數量約束」及「強化學習訓練加速」深度融合的最新進展。GLM-5 透過精巧的**多步參數共享機制**，解決了多步推測解碼帶來的參數量膨脹難題。

## 研究問題與架構設計（Architecture & Objective）

依據 GLM-5 技術報告（§2.1 & §3.6.2）：
- **共享參數的多步訓練（Parameter-Shared Multi-Step Training）**：GLM-5 使用單一組物理參數塊，遞迴地執行 3 個 MTP 訓練步數。這既模擬了多步預測的誤差傳遞，又嚴格限制了參數量的增加（架構表上僅佔用 1 個 MTP Layer 的參數配額）。
- **縮小訓練與推論的認知差距**：在預訓練期間就讓同一組 Head 適應不同未來距離的預測，顯著緩解了多頭分離設計中的泛化不一致問題。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **更高的多步接受長度**：在專有真實用戶 Prompts 的評測中，配置 4 個推測步驟時，GLM-5 達到了 **2.76 個 tokens** 的平均接受長度（對比 DeepSeek-V3.2 的 2.55 tokens）。
- **長尾 RL Rollout 加速（§3.6.2）**：在後訓練強化學習中，小 Batch 的長文本採樣往往存在嚴重的「長尾等待」（Stragglers）。MTP 能顯著壓縮這些長尾序列的解碼延遲，使整個分散式訓練節拍顯著加快。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **共享 3 步與單一物理層的正確理解**：報告中的 3 個 MTP training steps 與實體架構表上的 1 個 MTP layer 不矛盾，屬於時間步遞迴展開而非參數量增加三倍。
- **Rollout 時間壓縮非演算法革新**：Rollout 階段的加速純屬工程層面的管線優化，不可混淆為演算法收斂效率提升。

## 參考資料（References）

### 學術論文（Academic Literature）

1. GLM-5 Team. (2026). *GLM-5: from Vibe Coding to Agentic Engineering*. arXiv preprint arXiv:2602.15763. [GLM-5: from Vibe Coding to Agentic Engineering](https://arxiv.org/abs/2602.15763)。

    閱讀重點：§2.1 三步參數共享、§3.6.2 small-batch RL rollout 的長尾收益。

### 技術文章與模型卡（Technical Articles）

1. [zai-org/GLM-5｜官方模型卡](https://huggingface.co/zai-org/GLM-5)。

    閱讀重點：核對 zai-org/GLM-5 的指定 checkpoint、架構資訊與發布／部署範圍；模型卡與論文角色不同。

<reviewkit>
<takeaways>
- GLM-5 採用共享參數的 3 步 MTP 訓練機制，在不增加物理層數的前提下對齊多步推論。
- 在 4 步推測評測中取得 2.76 tokens 的平均接受長度，超越 DeepSeek-V3.2 的 2.55。
- MTP 被明確用於消除大規模 RL 訓練中長尾採樣導致的等待瓶頸。
</takeaways>
<qprompt/>
</reviewkit>
