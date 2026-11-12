<meta>
Title: 後訓練 MTP Heads：分布對齊與動態草稿深度
Summary: 整理 Match the Distribution, Not the Compute: Post-Training Multi-Token Prediction Heads 的研究定位、一手參考資料與後續補寫方向。
Slug: post-training-mtp-heads-zh-tw
Output: notes/post-training-mtp-heads/post-training-mtp-heads-zh-tw.html
CanonicalId: post-training-mtp-heads
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Tags: multi-token prediction, large language models, speculative decoding
Status: drafting
LastModified: 2026-11-12
</meta>

# 後訓練 MTP Heads：分布對齊與動態草稿深度

Prachi Badarayani 等人在 2026 年 10 月發布的最新前沿論文《Match the Distribution, Not the Compute: Post-Training Multi-Token Prediction Heads》，提出了一種顛覆性的後訓練哲學：**草稿頭的核心任務是精確匹配目標模型的輸出分佈，而非盲目堆疊計算量**。論文展示了基於鏈狀 Heads 與動態草稿深度的極速對齊方案。

## 研究問題與架構設計（Architecture & Objective）

依據 2026 年 10 月預印本：
- **鏈狀級聯 Heads（Chained Heads）**：在凍結的開源模型（如 Qwen3-8B）頂部掛載 3 個級聯鏈狀預測頭，後續頭緊密條件依賴前序預測。
- **思維鏈目標數據蒸餾（Target-Generated CoT Distillation）**：僅使用目標主模型自身生成的少量 High-Quality CoT（思維鏈）推理軌跡（約 2.5B tokens）作為監督訊號，單純進行輸出機率分佈對齊。
- **動態草稿深度（Adaptive Head Count）**：根據當前生成位置的熵值動態決定展開 1 個、2 個還是 3 個預測頭，在不確定性高的位置提早剎車避免無效預測。
- **鬆弛驗證（Relaxed Verification）**：引入有界分佈漂移容差，允許在可控邊界內提升草稿接受率。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **極低數據預算下的極速對齊**：僅消耗約 **2.5B tokens** 的訓練量，便達到了傳統需要百億級數據才能訓練出的同等推測解碼預期加速比（Comparable Expected Speedup）。
- **顯著降低計算浪費**：動態深度調節使不確定位置的無效計算減少了近 **30%**。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **Relaxed Verification 不等同於 Exact Exact**：論文中為了進一步放大加速而探索的 Relaxed Verification 協議，本質上容許了輕微的分佈漂移，絕不能在數學上標註為保留 100% 目標分佈的 Exact 模式。
- **前沿預印本的證據屬性**：該成果截至調研時發布僅數天，屬於極具啟發性的最新實證探索，尚未經過學術界長期的獨立復現與考驗。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Prachi Badarayani, Aidan Jay, Chenghui Zhou, Dayquan Julienne, Yuan Gao, Tianwei Chen, George Zerveas, Ishmam Zabir, Xiren Zhou, Chris Quirk, Xia Song. (2026). *Match the Distribution, Not the Compute: Post-Training Multi-Token Prediction Heads*. arXiv preprint arXiv:2610.00888. [Match the Distribution, Not the Compute: Post-Training Multi-Token Prediction Heads](https://arxiv.org/abs/2610.00888)。

    閱讀重點：head-only後訓練與資料預算；expected對realized speed；bounded drift與adaptive controller。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). *Better & Faster Large Language Models via Multi-token Prediction*. ICML 2024. [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html)。

    閱讀重點：§2 的共享 trunk／獨立 heads 與 §5 的機制假說，作為本方法的比較基準。

<reviewkit>
<takeaways>
- 該研究提出了「匹配分佈而非堆積算力」的後訓練 MTP Heads 高效對齊思想。
- 在凍結 Qwen3-8B 上僅需約 2.5B tokens 的 CoT 蒸餾數據即可達成優異的推測加速比。
- 動態草稿深度（Adaptive Draft Depth）顯著優化了不確定 token 處的無效算力損耗。
- 需謹慎標明其 Relaxed Verification 屬於近似模式，不滿足嚴格無損的數學保證。
</takeaways>
<qprompt/>
</reviewkit>
