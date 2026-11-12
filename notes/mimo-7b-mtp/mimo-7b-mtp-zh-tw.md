<meta>
Title: MiMo-7B 的 MTP：聯合預訓練與凍結主模型後的預測頭訓練
Summary: 整理 MiMo-7B 如何分開主模型能力訓練與多步預測頭的推論優化。
Slug: mimo-7b-mtp-zh-tw
Output: notes/mimo-7b-mtp/mimo-7b-mtp-zh-tw.html
CanonicalId: mimo-7b-mtp
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models
Status: drafting
LastModified: 2026-11-12
</meta>

# MiMo-7B 的 MTP：聯合預訓練與凍結主模型後的預測頭訓練

小米大模型團隊發布的 MiMo-7B 技術報告展示了 MTP 在模型生命週期不同階段的精細分工。該研究最核心的貢獻在於明確解耦了「改善 Backbone 特徵的訓練階段」與「僅優化 Draft Head 接受率的微調階段」，為大模型工程落地提供了經典的兩階段範式。

## 研究問題與架構設計（Architecture & Objective）

依據 MiMo 技術報告（§2.2）：
- **第一階段（Pre-training 聯合預訓練）**：主幹模型與 1 個額外的 MTP 層共同預訓練，梯度全量回傳至 Backbone，目標是利用未來 token 監督增強主模型的高階推理與長程規劃特徵。初步研究表明，在預訓練階段繼續增加 MTP 層數（如 2 層或 3 層）並未進一步改善主模型性能。
- **第二階段（Post-training 凍結適配）**：在預訓練結束後，為進一步提升推論推測解碼的步長，團隊將現有的 MTP 層權重複製為另 2 個獨立層（形成 3 層 MTP heads）。隨後，**完全凍結主模型 Backbone 以及第一層 MTP**，僅使用監督微調數據單獨訓練新增加的兩層 Heads。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **推理基準上的高接受率**：在 AIME 2024 等高難度數學與邏輯推理任務上評測，第一層 MTP 的平均驗證接受率達到約 **90%**；即使到了預測較遠未來的第三層 MTP，其接受率仍超過 **75%**。
- **訓練成本控制**：在第二階段凍結主幹模型後，訓練 2 個額外 Draft Heads 所消耗的顯存與算力僅為主模型全量微調的極小一部分，顯著縮短了適配週期。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **Head Acceptance 不等於 Backbone 改善**：第二階段新增兩層 MTP 獲得的高接受率，反映的是 Draft Head 對主模型輸出分布的擬合能力，絕不能被誤讀為「主模型的推理能力又增強了兩層」。
- **階段性優化目標隔離**：報告明確指出，預訓練期多加 MTP 層邊際收益遞減，因此將多層 MTP 的算力投入推遲到後訓練期是權衡後的工程選擇。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Xiaomi LLM-Core Team. (2025). *MiMo: Unlocking the Reasoning Potential of Language Model -- From Pretraining to Posttraining*. arXiv preprint arXiv:2505.07608. [MiMo: Unlocking the Reasoning Potential of Language Model -- From Pretraining to Posttraining](https://arxiv.org/abs/2505.07608)。

    閱讀重點：§2.2 單層聯合預訓練、凍結主模型後的新增 heads 訓練與 AIME24 接受率。

### 開源程式碼（Open Source Code）

1. [XiaomiMiMo/MiMo｜官方發布 repo](https://github.com/XiaomiMiMo/MiMo)。

    閱讀重點：對照該項目的模型發布、可取得的權重與使用方式；框架支援本身不能取代模型採用證據。

<reviewkit>
<takeaways>
- MiMo-7B 採用兩階段 MTP 訓練範式：預訓練單層聯合監督，後訓練凍結主幹適配多層。
- 預訓練期額外增加 MTP 層對 Backbone 收益遞減，但推論期多層能顯著拉長接受前綴。
- AIME 2024 上第一層接受率約 90%，第三層仍維持在 75% 以上。
- 凍結主模型訓練 Draft Head 的高接受率不能反向推導為主幹表示能力的進一步提升。
</takeaways>
<qprompt/>
</reviewkit>
