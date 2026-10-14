<meta>
Title: MTFM：跨業務共用行為骨幹並擴大 Target 表示
Summary: 從美團多場景推薦的特徵不一致與長序列成本出發，理解 H/R/T tokens、動態遮罩、Hybrid Target Attention 與 Target Scale-Up。
Slug: mtfm-zh-tw
Output: notes/mtfm/mtfm-zh-tw.html
CanonicalId: mtfm
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommender systems, MTFM, Meituan, multi-scenario, target attention
Status: drafting
LastModified: 2026-10-09
</meta>

<draft>
- TLDR：MTFM 跨業務共用長期行為表示，保留各場景 target 特徵差異，並增加 target token 容量。
- MainFlow：多場景 schema 問題 → H/R/T 組織 → mask → 混合注意力與四 token → 訓練部署邊界。
- Scope：MTFM 論文與美團官方技術說明；不把多業務模型誤寫為召回／粗排／精排一體。
- FollowUps：作者全盤 proofread；檢查論文與技術文章版本差異。
</draft>

# MTFM：跨業務共用行為骨幹並擴大 Target 表示

外賣首頁、頻道頁與其他場景都需要理解同一位使用者，但各自的候選、特徵欄位和預測目標不完全相同。若每個場景維護獨立排序模型，長行為序列與工程流程會被重複計算。MTFM（Meituan Foundation Model for Recommendation）在 <content-link canonical="mtgr">MTGR</content-link> 之上，嘗試共用長期興趣骨幹，同時讓不同場景保留自己的輸入與任務頭。[原論文](https://arxiv.org/abs/2602.11235)

## 1. 三類 token 各有責任

**H-token** 放跨場景的歷史行為，**R-token** 放較近的即時行為，**T-token** 放這次待評估目標的候選、情境及交叉特徵。不同業務可用自己的 tokenizer 轉換各自的 T 特徵，不必硬把所有場景欄位排成一模一樣的表格；長期與即時的使用者線索則可共用。[美團技術文章 §3.1](https://tech.meituan.com/2026/09/22/Meituan-Foundation-Model-for-Recommendation.html)

```text
共用 H：長期行為 ──┐
共用 R：即時行為 ──┼→ 共享骨幹 → 各業務的預測頭
場景 T：本次候選 ──┘
```

Mask 維持時間與候選邊界：T 只能看到當時已發生的 R；同請求的不同候選不能互看，否則一件商品的分數會受到同批其他候選影響。[美團技術文章 §3.2](https://tech.meituan.com/2026/09/22/Meituan-Foundation-Model-for-Recommendation.html)

## 2. 為何同時有 Full 與 Target Attention？

讓全部長序列在每一層互相注意，成本高；但完全不讓歷史內部交互，也可能失去有效訊號。MTFM 因而穿插少數 **Full Self-Attention** 層與較多 **Target Attention** 層，把更多運算集中在要輸出分數的 T 側。這是計算分配策略，不是 T-token 從此不讀歷史。[美團技術文章 §3.3](https://tech.meituan.com/2026/09/22/Meituan-Foundation-Model-for-Recommendation.html)

## 3. Target Scale-Up：一個候選為何要多個 token？

若候選側同時攜帶使用者、情境、商品及交叉特徵，把它們擠成一個向量可能過度壓縮。MTFM 的一個版本用 AutoSplit 將每個 target 的特徵映射成**四個 token embeddings**，並為不同 token 配置投影與 FFN，再做 token mixing。這不是「四個不同候選商品」，而是**同一個待評估目標的四個表示位置**。[美團技術文章 §3.3.2](https://tech.meituan.com/2026/09/22/Meituan-Foundation-Model-for-Recommendation.html)

訓練時，MTFM 把同一使用者多個場景的曝光聚在一起，共用昂貴的長序列計算；部署時仍可按各業務取其相關部分。這是**多場景精排統一**，不等同於 <content-link canonical="onetrans-v2">OneTrans-V2</content-link> 所做的跨召回、粗排、精排三階段統一。[美團技術文章 §3.4–4](https://tech.meituan.com/2026/09/22/Meituan-Foundation-Model-for-Recommendation.html)

## 參考資料（References）

### 學術論文（Academic Literature）

1. Song, X., et al. (2026). MTFM: A Scalable and Alignment-free Foundation Model for Industrial Recommendation in Meituan. *KDD 2026*. [DOI](https://doi.org/10.1145/3770855.3818452)；[arXiv:2602.11235](https://arxiv.org/abs/2602.11235)。

### 技術文章（Technical Articles）

1. [美团技术团队：MTFM：美团统一推荐基座大模型在外卖多业务场景的落地实践](https://tech.meituan.com/2026/09/22/Meituan-Foundation-Model-for-Recommendation.html)。

<reviewkit>
<takeaways>
- H/R/T 分別承載歷史、即時行為與待評估 target；T 可保留場景差異。
- Hybrid Target Attention 把更多計算放在候選側，仍讓候選讀取使用者脈絡。
- 四個 target tokens 是同一候選的多個表示，不是四件商品。
- MTFM 統一多業務精排；OneTrans-V2 統一推薦流水線的三個階段。
</takeaways>
<qprompt/>
</reviewkit>
