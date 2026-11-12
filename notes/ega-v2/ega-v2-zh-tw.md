<meta>
Title: EGA-V2：以 MTP 聯合建模 POI 與廣告素材
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 收集 EGA-V2 的 POI 與 creative token 預測及廣告配置研究，保留 offline 證據與部署的差別。
Slug: ega-v2-zh-tw
Output: notes/ega-v2/ega-v2-zh-tw.html
CanonicalId: ega-v2
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Status: drafting
LastModified: 2026-11-12
</meta>

# EGA-V2：以 MTP 聯合建模 POI 與廣告素材

美團等團隊在 2025 年發布的 EGA-V2（《EGA-V2: An End-to-end Generative Framework for Industrial Advertising》），是本地生活服務與廣告領域中，將 MTP 拓展為**「實體門店（POI）+ 創意素材圖像/文案」跨模態聯合生成**的前瞻性工業探索。

## 研究問題與架構設計（Architecture & Objective）

依據論文框架：
- **Token 的實體語義**：實體興趣點/門店（POI）的語義離散編碼，以及與之配對的廣告展示創意（Creative Ad Images / Texts）的多模態離散 tokens。
- **跨模態聯合 MTP 解碼**：在同一個端到端生成框架中，MTP Heads 同時承擔預測目標門店 ID 與生成最匹配該用戶當前意圖的展示物料特徵的雙重任務，使「推薦給誰（Matching）」與「如何展示（Creativity）」在單次生成中聯合求解。
- **工業資料流適配**：針對美團海量即時外賣、到店餐飲的局部時空特徵，設計了專屬的特徵融合層。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **工業數據集離線突破**：在真實工業級本地生活廣告日誌數據集上進行嚴格離線評測，EGA-V2 在廣告點擊率、點擊轉化率以及創意契合度指標上全面超越了傳統兩階段流水線基線。
- **系統解耦成本降低**：顯著縮減了門店匹配系統與創意渲染系統相互獨立調用導致的中間傳輸與特徵對齊開銷。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **未確認生產全量推廣**：該文檔已核對的嚴格證據屬於基於工業脫敏數據的高水準離線實驗，目前沒有同行評審文檔或官方公告證實其已在全域產線完成百分之百的在線全量部署。
- **跨模態表徵干擾風險**：文本門店與多模態創意圖像的預測難度差異較大，MTP 損失權重失衡容易引發多任務負遷移現象。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Zheng, Z., Wang, Z., Yang, F., Fan, J., Zhang, T., Wang, Y., & Wang, X. (2025). [EGA-V2: An End-to-end Generative Framework for Industrial Advertising](https://arxiv.org/abs/2505.17549). arXiv 預印本。

    閱讀重點：首版 2025-05-23，查核 v3 為 2025-06-01；摘要與架構圖明確寫出 MTP、POI 與 creative decoder。文件的會議模板 placeholder 不能用來推定正式錄用。

2. Yang, Y., Ji, Z., Li, Z., Li, Y., Mo, Z., Ding, Y., Chen, K., Zhang, Z., Li, J., Li, S., & Liu, L. (2025). [Sparse Meets Dense: Unified Generative Recommendations with Cascaded Sparse-Dense Representations](https://arxiv.org/abs/2503.02453). NeurIPS 2025。

    閱讀重點：用於比較 sparse ID 到 dense representation 的級聯設計；不是此筆記已驗證的 MTP 採用案例。

3. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737). ICML 2024。

    閱讀重點：用來對照共享 backbone 加未來位置預測頭的原始設計；推薦模型的 token 單位與順序假設仍須另外界定。

本次查核未找到已公開的官方實作；後續若釋出程式碼或 model card，再補入原始來源。

<reviewkit>
<takeaways>
- EGA-V2 探索了 MTP 在「門店實體 POI」與「廣告展示創意」上的跨模態聯合生成。
- 實現了本地生活廣告中匹配（Matching）與展示（Creativity）的單模型端到端解碼。
- 在工業級大規模日誌離線評測中展現出優異的多任務兼顧能力。
- 當前嚴格證據限定於工業級離線驗證，不可輕易誇大為全量線上落地。
</takeaways>
<qprompt/>
</reviewkit>
