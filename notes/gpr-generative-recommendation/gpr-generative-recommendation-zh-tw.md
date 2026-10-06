<meta>
Title: GPR：用 MTP 建模多重興趣的生成式廣告推薦
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 整理 GPR 的平行興趣預測、分階段訓練與微信 Channels 部署證據，保留 MTP 成效的歸因界線。
Slug: gpr-generative-recommendation-zh-tw
Output: notes/gpr-generative-recommendation/gpr-generative-recommendation-zh-tw.html
CanonicalId: gpr-generative-recommendation
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Status: drafting
LastModified: 2026-10-06
</meta>

<draft>
- 定位：資源索引與起稿骨架，待作者閱讀原始資料後補寫及全盤 proofread。
- 內容骨架：
    - 場景：廣告與自然內容的統一表示及多重興趣
    - 機制：HHD 與平行完整 SID 路徑
    - 訓練：MTP、價值對齊與 HEPO 各負責什麼
    - 證據：offline 消融、online 組合改動與歸因限制
- 查核日期：2026-10-06。
</draft>

# GPR：用 MTP 建模多重興趣的生成式廣告推薦

## 研究問題與方法定位

廣告推薦要同時承接多個興趣方向與不同商業目標。GPR 把廣告及自然內容映射成多層 semantic IDs，再以共享 backbone 與平行 heads 建模多重興趣。v1 方法預設四個 heads，各預測一條完整 item code path；不是四個頭各猜同一 item 的一個成分。

MTP 用於預訓練，後續接 value-aware fine-tuning 與 HEPO。最新版摘要仍明確提到 MTP，作者報告已完整部署於微信 Channels。這是作者的一手部署描述，尚非本筆記獨立驗證；v1 同時加入 MTP 與 Thinking 的線上收益也不能全歸給 MTP。

## 後續補寫方向

- 場景：廣告與自然內容的統一表示及多重興趣。
- 機制：HHD 與平行完整 SID 路徑。
- 訓練：MTP、價值對齊與 HEPO 各負責什麼。
- 證據：offline 消融、online 組合改動與歸因限制。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Zhang, J., Li, Y., Liu, Y., Wang, C., Wang, Y., Xiong, Y., et al. (2025; revised 2026). [GPR: Towards a Generative Pre-trained One-Model Paradigm for Large-Scale Advertising Recommendation](https://arxiv.org/abs/2511.10138). arXiv 預印本。

    閱讀重點：首版 2025-11-13，最新查核版本 v3 為 2026-02-12；摘要明確保留 MTP，並報告微信 Channels 廣告系統完整部署。

2. Zhang, J., et al. (2025). [GPR: Towards a Generative Pre-trained One-Model Paradigm for Large-Scale Advertising Recommendation](https://arxiv.org/abs/2511.10138v1), v1。

    閱讀重點：本筆記的四個 parallel heads 與每頭完整 code path 描述來自此版 §3.1；後續精讀需核對最新版本的細節是否變更。

3. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737). ICML 2024。

    閱讀重點：用來對照共享 backbone 加未來位置預測頭的原始設計；推薦模型的 token 單位與順序假設仍須另外界定。

本次查核未找到已公開的官方實作；後續若釋出程式碼或 model card，再補入原始來源。

<reviewkit>
<takeaways>
- GPR 的平行 heads 對應多個興趣路徑，各路徑產生完整 item SID。
- 作者明確報告 MTP 與微信 Channels 部署。
- 組合新增 MTP 與 Thinking 的線上結果不能當成 MTP 單獨收益。
</takeaways>
<qprompt/>
</reviewkit>

