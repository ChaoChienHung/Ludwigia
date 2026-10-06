<meta>
Title: UniSGR：以 Value-Aware MTP 對齊生成與排序
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 整理 UniSGR 的多 session targets、SID 因果遮罩及價值權重，並區分 MTP 訓練與 STARK 推論。
Slug: unisgr-zh-tw
Output: notes/unisgr/unisgr-zh-tw.html
CanonicalId: unisgr
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
    - 場景：生成候選與多目標排序的對齊
    - 遮罩：item 內因果、items 間隔離、共享 BOS
    - 訓練：VA-PMTP、Task-Aware Tokens 與排序模組
    - Serving：STARK 與 online A/B 的效果歸因
- 查核日期：2026-10-06。
</draft>

# UniSGR：以 Value-Aware MTP 對齊生成與排序

## 研究問題與方法定位

只生成可能被互動的 item，未必能承接點擊、加購與購買等不同排序目標。UniSGR 先用跨場景 NTP 預訓練，再以 VA-PMTP 和共用排序模組做目標場景對齊。

這裡同時監督多個 session items，但每個 item 內的 SID levels 仍因果相依；不同 target items 互不可見，共享 BOS。商業價值權重再調整監督。STARK 的 tree attention 與 KV cache 是另一個 serving 改動，不能把其加速直接算成 MTP 效果。2026 年預印本報告 Lazada 首頁 online A/B；本筆記未獨立確認全面部署或重現。

## 後續補寫方向

- 場景：生成候選與多目標排序的對齊。
- 遮罩：item 內因果、items 間隔離、共享 BOS。
- 訓練：VA-PMTP、Task-Aware Tokens 與排序模組。
- Serving：STARK 與 online A/B 的效果歸因。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Sun, J., Yang, J., Guo, Z., Xu, D., Yan, J., Deng, L., & Zeng, X. (2026). [UniSGR: Unified Framework for Semantic ID Generation and Ranking](https://arxiv.org/abs/2607.04068). arXiv 預印本。

    閱讀重點：2026-07-05；§3.5.2 定義 VA-PMTP 的 masking 與 business-value weights，§3.6 解釋 STARK，§4.4 報告 Lazada online A/B。文件包含會議模板 placeholder，不當作正式錄用資訊。

2. Zhou, G., et al. (2025). [OneRec-V2 Technical Report](https://arxiv.org/abs/2508.20900). arXiv 技術報告。

    閱讀重點：代表工業生成式推薦對照；其自回歸 item SID 不等同 UniSGR 的多 target VA-PMTP。

3. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737). ICML 2024。

    閱讀重點：用來對照共享 backbone 加未來位置預測頭的原始設計；推薦模型的 token 單位與順序假設仍須另外界定。

本次查核未找到已公開的官方實作；後續若釋出程式碼或 model card，再補入原始來源。

<reviewkit>
<takeaways>
- VA-PMTP 平行監督多個 target items，item 內 SID 仍保持因果順序。
- 價值權重把生成學習往不同商業目標對齊。
- STARK serving 加速與 MTP 訓練是不同機制。
</takeaways>
<qprompt/>
</reviewkit>

