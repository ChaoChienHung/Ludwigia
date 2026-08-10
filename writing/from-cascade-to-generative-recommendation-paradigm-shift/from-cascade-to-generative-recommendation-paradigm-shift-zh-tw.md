<meta>
Title: 從級聯漏斗到自迴歸生成：推薦系統範式轉移的必然與挑戰
Summary: 本文深入探討推薦系統為何正在經歷從「傳統漏斗級聯架構」向「自迴歸生成式範式」的重大轉型。結合快手 OneRec 最新研究成果，分析傳統碎片化模組如何陷入低 ROI 的 Scaling 陷阱，揭示生成式推薦如何透過一體化架構與聯合機率分佈建模對齊大模型紅利，並剖析 Semantic ID、RQ-VAE 與 RQ-Kmeans 如何解決海量商品 Token 化的核心工程挑戰。
Slug: from-cascade-to-generative-recommendation-paradigm-shift-zh-tw
Output: writing/from-cascade-to-generative-recommendation-paradigm-shift/from-cascade-to-generative-recommendation-paradigm-shift-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommendation systems, scaling law, deep learning
Status: published
Published: 2026-08-02
LastModified: 2026-08-10
</meta>

# 從級聯漏斗到自迴歸生成：推薦系統範式轉移的必然與挑戰

推薦系統就像是現代網路世界「看不見的手」。從電商首頁的商品展示，到無盡滑動的短影音資訊流，它決定了數十億人每天消費的內容。然而，當整個 AI 圈正因為大語言模型（LLM）的突破而天翻地覆時，支撐著這些龐大商業流量底層的推薦引擎，過去十幾年來卻沒有太多本質上的改變。

長久以來，大廠們的底層心法始終是同一個經典框架——<content-link canonical="funnel-cascade-architecture-in-recommendation-systems">漏斗式級聯架構</content-link>。這套架構在過去十年確實完美解決了「如何在毫秒級延遲下處理海量數據」的現實難題。但如今，這套不斷打補丁的舊系統，正無可避免地撞上一道物理與工程的高牆。系統越疊越厚，投入的算力與研發資源呈指數級飆升，但換來的業務 <information concept="concept.roi">ROI</information> 增長卻越來越微不足道。

曾經無往不利的架構，到底卡在了哪裡？面對增長停滯的焦慮，業界前沿團隊又是如何尋找下一代破局之道的？

這篇文章將帶你拆解舊架構的技術債黑盒，並探討一場正在發生、將底層架構「推倒重來」的範式轉移——端到端自迴歸生成（Generative Recommendation）背後的技術全貌與工程挑戰。

## 1. 傳統級聯架構的深層痛點：陷入低 ROI 陷阱

級聯架構的核心工程哲學是「**用空間與階段換取時間**」。面對數百萬甚至數億級別的商品庫，我們不可能在短短 50 毫秒內，用最複雜的深度神經網路把每個商品都精算一遍。

因此，業界標準做法是將鏈路切分為多個階段（召回 $\to$ 粗排 $\to$ 精排 $\to$ 重排）。候選商品像過沙漏一樣被層層篩選，數量從百萬、千、百，一路縮減到最後呈現在用戶眼前的十幾個。隨著數量減少，模型特徵才敢越加越厚。這套「分而治之」的策略在早期吃盡了紅利，但當各個模組的優化都逼近天花板時，架構本身的結構性缺陷就徹底暴露了。

### 痛點一：目標錯位與模型解釋性的喪失
在長長的級聯鏈路上，各模組的優化目標天然存在不一致。召回階段拼命擴大覆蓋度與多樣性，深怕漏掉潛在興趣；精排階段卻極致追求 <information concept="concept.ctr">CTR</information> 與 <information concept="concept.cvr">CVR</information> 的精準預估。這帶來了嚴重的內部消耗：召回硬塞進來的多樣性內容，往往在精排階段被無情打低分；而精排真正偏好的高潛力內容，可能早就在召回階段被過濾掉了。**各自追求局部最優，最終卻拼湊不出全局最優。**

更折磨人的是多模組耦合帶來的「歸因問題」。當線上數據掉血、出現糟糕的推薦時，系統的問題排查宛如大海撈針：是召回通道失效？被粗排的某條硬規則誤殺？還是精排給了異常的低分？模組間互相掣肘，不僅迭代成本極高，還經常演變成不同演算法團隊間的推諉扯皮。

### 痛點二：通信與 IO 吞噬了寶貴算力
在多階段鏈路中，數據必須頻繁跨越多個獨立模組。每一次跨階段的呼叫，都伴隨著大量的 <information concept="concept.rpc">RPC</information> 網路通信、海量的分散式特徵檢索以及記憶體搬運。

在極限的延遲限制下，系統其實花了大半的時間在「等」——等數據傳輸、等特徵拼裝。真正在做純數學 Tensor 運算的時間比例少得可憐。對於極度昂貴的硬體資源來說，這是一種極大的浪費。

### 痛點三（核心致命傷）：碎片化模組與 GPU 算力天性的不相容
為了解決效果瓶頸，業界這幾年也嘗試讓推薦系統追隨大模型的 <information concept="concept.scaling_law">Scaling Law</information>：拉長用戶行為序列、放大打分候選集。但結果卻是算力成本增加，效果成長有限，<information concept="concept.roi">ROI</information> 不佳。其根本原因在於：**傳統推薦架構與現代 AI 算力的底層天性不完全相容。**

現代算力的核心推動力是 <information concept="concept.gpu">GPU</information>，而 GPU 渴望的是「**<information concept="concept.compute_bound">算力密集</information>**」的任務，生來就是為了高效執行「**一致且海量的 <information concept="concept.gemm">GEMM</information>**」與「**<information concept="concept.simt">SIMT</information>**」。反觀傳統推薦系統，充斥著各種異構小模型、複雜的規則過濾、樹狀結構與散亂的 <information concept="concept.embedding">Embedding</information> 查找，這是一個典型的「**<information concept="concept.memory_bound">記憶體頻寬受限</information>**」任務。當你把這樣的系統丟給 GPU 時，算力被嚴重的記憶體碎片與邏輯分支所打斷，硬體根本無法跑滿，<information concept="concept.scaling_law">Scaling Law</information> 自然也就無從談起。

### 痛點四：淪為「技術孤島」，與現代 AI 基礎設施脫節
長久以來，為了應對超大規模的稀疏特徵，推薦領域造了無數特化的輪子——如獨創的分散式 <information concept="concept.parameter_server">Parameter Server</information>。這導致當 LLM 與大模型社群的底層工程基建突飛猛進時，推薦系統卻因為架構太過特殊而淪為一座技術孤島，看著龐大的生態紅利卻吃不到。

## 2. 破局之道：當推薦系統走向「端到端生成」

當級聯架構在目標一致性、IO 開銷與硬體利用率上都走到死胡同時，業界意識到：我們不能再繼續給舊系統打補丁了。解藥，其實藏在另一個領域——大語言模型（LLM）所採用的**自迴歸生成（Autoregressive Generation）**。

這正是近年來以快手 [**OneRec** (*OneRec: Unifying Retrieve and Rank with Generative Recommender and Preference Alignment*)](https://arxiv.org/abs/2502.18965) 為代表的前沿研究所掀起的範式轉移：從多階段的漏斗過濾，走向端到端的自迴歸生成（Generative Recommendation）。

過去的推薦模型本質上是「**判別式（Discriminative）**」的思維，其核心任務是給定特定用戶與商品，去**預估一個單點的互動機率 $P(\text{action} \mid u, i)$**。對於模型而言，這就像是在做無數道「是非題」或「打分題」，它只能被動地對系統餵給它的候選商品進行評估，專注於局部的特徵匹配，卻缺乏對全局商品空間以及商品之間關聯性的宏觀理解。

而生成式推薦則將問題昇華，直接讓模型學習複雜的**聯合機率分佈 $P(\text{items} \mid u, c)$**。給定用戶歷史與上下文，模型直接像寫文章一樣，一步步「生成」出最適合的商品序列。這本質上比起判別式，對於模型而言更像是一道「開放式申論題」——模型不再受限於既定的候選集，而是必須真正掌握用戶興趣的演變脈絡與全局商品的分佈特徵，具備主動構建內容序列的全局視野與推理能力。

不僅如此，這種演算法的轉變，還精準地擊破了傳統架構的四大痛點：

### 解法一：統一目標，消除內耗與歸因難題
生成式架構用一個強大的端到端模型，直接根據用戶上下文吐出最終的推薦列表。沒有召回與排序的割裂，模型直接為最終的全局最優解負責。同時，因為不再有多階段的過濾規則，問題案例的歸因變得純粹——一切效果好壞，皆源於這個統一模型的權重與訓練數據，徹底消滅了偵錯黑盒。

### 解法二：消除系統 IO，讓計算回歸計算
傳統的跨網路傳輸、繁雜的特徵拼接與多階段檢索被徹底抹除。所有的資訊流轉、用戶興趣的捕捉與商品的匹配，全部在單一模型的一次<information concept="concept.forward_pass">前向傳播</information>中，由隱藏層權重瞬間完成。系統的 IO 瓶頸被打破，時間預算終於能全數投資在真正的模型計算上。

### 解法三：硬體親和性與 Scaling Law 的真正釋放
為什麼生成式架構能享受 <information concept="concept.scaling_law">Scaling Law</information> 紅利？因為其底層骨幹網路如 <information concept="concept.transformer">Transformer</information> 是高度同質化的結構，核心運算幾乎百分之百是大規模的 <information concept="concept.gemm">GEMM</information>。

這完美契合了現代 GPU 的底層設計。當軟體架構終於對齊了硬體的物理天性，投入的每一分算力都能毫無耗損地轉化為模型參數規模的擴展。推薦系統終於能擺脫低 <information concept="concept.roi">ROI</information> 的泥沼，享受「算力越大、能力越強」的暴力美學。

### 解法四：全面繼承 LLM 的工業級基礎設施
當推薦系統轉向標準的 Transformer 自迴歸架構後，最大的隱藏紅利在於：**不再需要重複造輪子**。

推薦系統可以直接「無縫接入」LLM 領域極度成熟的工程優化——無論是 <information concept="concept.flash_attention">FlashAttention</information>、<information concept="concept.kv_cache">KV Cache</information>、<information concept="concept.vllm">vLLM</information> 推理加速，還是 <information concept="concept.megatron">Megatron</information> 的分散式訓練框架。這讓推薦系統的迭代速度與全球頂尖的 AI 工程社群正式接軌，全面繼承這波大模型基建的爆發紅利。

## 3. 結語：算法、硬體與生態共振的未來

推薦系統從級聯漏斗走向自迴歸生成，絕非僅僅是追趕大模型的時髦。這本質上是一場「軟體架構向硬體物理極限妥協與對齊」，並且與 LLM 工業生態大一統的必然結果。

<takeaways>
- **級聯架構的局限：** 各階段優化目標不一致（局部最優 $\neq$ 全局最優）、通信與 IO 搬運開銷巨大，導致傳統推薦系統在序列拉長與候選打分放大時陷入低 ROI 的 Scaling 陷阱。
- **生成式推薦的突破 (以 OneRec 為例)：** 透過單一端到端模型取代多級漏斗，集中算力並恢復系統一致性；建模上從判別式 $P(\text{action} \mid u, i)$ 升級為生成式聯合機率分佈 $P(\text{items} \mid u, c)$，徹底打開 Scaling 空間。
</takeaways>

## 參考文獻（References）

1. [知乎：从原理到落地详细解读生成式推荐OneRec](https://zhuanlan.zhihu.com/p/2011387251351908741)