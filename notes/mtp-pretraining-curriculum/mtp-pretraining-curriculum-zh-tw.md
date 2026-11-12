<meta>
Title: MTP Curriculum：訓練收益與加速收益的分離
Summary: 整理 Pre-Training Curriculum for Multi-Token Prediction in Language Models 的研究定位、一手參考資料與後續補寫方向。
Slug: mtp-pretraining-curriculum-zh-tw
Output: notes/mtp-pretraining-curriculum/mtp-pretraining-curriculum-zh-tw.html
CanonicalId: mtp-pretraining-curriculum
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# MTP Curriculum：訓練收益與加速收益的分離

Ansar Aynetdinov 與 Alan Akbik 在 ACL 2025 主會發表的《Pre-Training Curriculum for Multi-Token Prediction in Language Models》，探討了預訓練期間動態調整 MTP 預測步長與損失權重的課程學習（Curriculum Learning）策略，並給出了一個至關重要的發現：**主模型語言建模品質的改善，與推論自推測解碼的加速收益，可以完全解耦分離！**

## 研究問題與架構設計（Architecture & Objective）

論文設計了對比鮮明的兩套課程排程機制（Curriculum Schedules）：
- **正向課程（Forward Curriculum）**：從標準 NTP（$k=1$）開始預訓練，隨著訓練步數增加，逐步將預測長度擴展為 $k=2, 3, 4$。模型先打牢局部語法基礎，再逐步過渡到長程規劃。
- **反向課程（Reverse Curriculum）**：在預訓練初期直接採用較長的多步預測（$k=4$），強迫模型在數據最豐富的早期學習粗粒度的宏觀語義；在預訓練後期逐步收縮回 $k=1$（純 NTP 監督），專注於極致打磨相鄰 token 的預測精度。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **雙重收益的劇烈分化**：
  - **Reverse Curriculum 的表現**：在最終的標準語言評測（Perplexity、常識問答）中，Reverse Curriculum 取得了所有配置中最強的主模型表現（超越固定 MTP 與標準 NTP）；但由於後期收縮，其額外 Heads 的推測解碼能力大幅退化，**幾乎失去了推論加速收益**。
  - **Forward Curriculum 的表現**：完美保留了高水準的推論自推測解碼加速比，但對主幹模型最終困惑度的改善不如 Reverse 明顯。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **直接粉碎「一石二鳥」的盲目樂觀**：這項研究提供了直接的消融證據，證明「強化主幹預訓練」與「最大化草稿推論吞吐」在損失權重配置上存在內在張力，不可默認兩者永遠正向同步增長。
- **小模型算力約束**：論文實驗主要在中小規模模型（1B 級別）與受控 Token 預算下完成，在大規模集群上的最優課程拐點仍需配合具體算力預算重新校準。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Ansar Aynetdinov, Alan Akbik. (2025). *Pre-Training Curriculum for Multi-Token Prediction in Language Models*. ACL 2025 Main. [Pre-Training Curriculum for Multi-Token Prediction in Language Models](https://arxiv.org/abs/2505.22757)。

    閱讀重點：curriculum定義與公平預算；NTP／MTP品質；head接受率與解碼收益。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- Aynetdinov & Akbik 提出了 MTP 的 Forward 與 Reverse 預訓練課程學習策略。
- Reverse 課程最顯著提升主幹模型下游評測品質，但推論加速收益幾乎歸零。
- Forward 課程最穩定保留推測解碼高接受長度，兩者收益軸存在明確解耦。
- 證明了預訓練主幹優化與推論草稿頭擬合屬於不同的目標權衡。
</takeaways>
<qprompt/>
</reviewkit>
