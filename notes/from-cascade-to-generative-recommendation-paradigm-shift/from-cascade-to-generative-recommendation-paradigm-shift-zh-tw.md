<meta>
Title: 從級聯漏斗到自迴歸生成：推薦系統的範式重塑
Summary: 本文深入探討推薦系統為何正在經歷從「傳統漏斗級聯架構」向「自迴歸生成式範式」的重大轉型。結合快手 OneRec 最新研究成果，分析傳統碎片化模組如何陷入低 ROI 的 Scaling 陷阱，揭示生成式推薦如何透過一體化架構與聯合機率分佈建模對齊大模型紅利，並剖析 Semantic ID、RQ-VAE 與 RQ-Kmeans 如何解決海量商品 Token 化的核心工程挑戰。
Slug: from-cascade-to-generative-recommendation-paradigm-shift-zh-tw
Output: notes/from-cascade-to-generative-recommendation-paradigm-shift/from-cascade-to-generative-recommendation-paradigm-shift-zh-tw.html
CanonicalId: from-cascade-to-generative-recommendation-paradigm-shift
Style: default
Cover: ./from-cascade-to-generative-recommendation-paradigm-shift.png
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommendation systems, scaling law, deep learning
Status: published
Published: 2026-08-02
LastModified: 2026-08-11
</meta>
<draft>
- 核心摘要與問題意識
    - 本文深入探討推薦系統為何正在經歷從「傳統漏斗級聯架構」向「自迴歸生成式範式」的重大轉型。結合快手 OneRec 最新研究成果，分析傳統碎片化模組如何陷入低 ROI 的 Scaling 陷阱，揭示生成式推薦如何透過一體化架構與聯合機率分佈建模對齊大模型紅利，並剖析 Semantic ID、RQ-VAE 與 RQ-Kmeans 如何解決海量商品 Token 化的核心工程挑戰。
- 1. 傳統級聯架構的深層痛點：陷入低 ROI 陷阱
    - 痛點一：目標錯位與模型解釋性的喪失
    - 痛點二：通信與 IO 吞噬了寶貴算力
    - 痛點三（核心致命傷）：碎片化模組與 GPU 算力天性的不相容
    - 痛點四：淪為「技術孤島」，與現代 AI 基礎設施脫節
- 2. 破局之道：當推薦系統走向「端到端生成」
    - 一、統一目標，消除內耗與歸因難題
    - 二、消除系統 IO，讓計算回歸計算
    - 三、硬體親和性與 Scaling Law 的真正釋放
    - 四、全面繼承 LLM 的工業級基礎設施
- 3. 結語：算法、硬體與生態共振的未來
    - 從級聯漏斗到自迴歸生成的演進，本質上是推薦系統架構重新對齊現代硬體物理特性的必然結果
    - 轉向端到端自迴歸生成，不僅解決了碎片化模組帶來的內部損耗與通訊開銷，更讓推薦系統的底層運算契合了現代硬體的天性
- 參考文獻（References）
</draft>

# 從級聯漏斗到自迴歸生成：推薦系統的範式重塑

<image>
src: ./from-cascade-to-generative-recommendation-paradigm-shift.png
alt: 生成式推薦系統 (Generative Recommender System) 新範式架構示意圖，展示用戶輸入、生成式模型核心與多維度生成式輸出。
caption: 生成式推薦系統（Generative Recommender System）的新範式架構示意圖。
</image>

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

在極限的延遲限制下，系統其實花了大半的時間在「等」——等數據傳輸、等特徵拼裝。模型真正在做運算的時間比例少得可憐。對於極度昂貴的硬體資源來說，這是一種極大的浪費。

### 痛點三（核心致命傷）：碎片化模組與 GPU 算力天性的不相容
為了解決效果瓶頸，業界這幾年也嘗試讓推薦系統追隨大模型的 <information concept="concept.scaling_law">Scaling Law</information>：拉長用戶行為序列、放大打分候選集。但結果卻是算力成本增加，效果成長有限，<information concept="concept.roi">ROI</information> 不佳。其根本原因在於：**傳統推薦架構與現代 AI 算力的底層天性不完全相容。**

現代算力的核心推動力是 <information concept="concept.gpu">GPU</information>，而 GPU 渴望的是「**<information concept="concept.compute_bound">算力密集</information>**」的任務，生來就是為了高效執行「**一致且海量的 <information concept="concept.gemm">GEMM</information>**」與「**<information concept="concept.simt">SIMT</information>**」。反觀傳統推薦系統，充斥著各種異構小模型、複雜的規則過濾、樹狀結構與散亂的 <information concept="concept.embedding">Embedding</information> 查找，這是一個典型的「**<information concept="concept.memory_bound">記憶體頻寬受限</information>**」任務。當你把這樣的系統丟給 GPU 時，算力被嚴重的記憶體碎片與邏輯分支所打斷，硬體根本無法跑滿，<information concept="concept.scaling_law">Scaling Law</information> 自然也就無從談起。

### 痛點四：淪為「技術孤島」，與現代 AI 基礎設施脫節
長久以來，為了應對超大規模的稀疏特徵，推薦領域造了無數特化的輪子——如獨創的分散式 <information concept="concept.parameter_server">Parameter Server</information>。這導致當 LLM 與大模型社群的底層工程基建突飛猛進時，推薦系統卻因為架構太過特殊而淪為一座技術孤島，看著龐大的生態紅利卻吃不到。

## 2. 破局之道：當推薦系統走向「端到端生成」

當級聯架構在目標一致性、IO 開銷與硬體利用率上都走到死胡同時，業界意識到：我們不能再繼續給舊系統打補丁了。答案，其實藏在另一個領域——大語言模型（LLM）所採用的**自迴歸生成（Autoregressive Generation）**。

這正是近年來以快手 [**OneRec** (*OneRec: Unifying Retrieve and Rank with Generative Recommender and Preference Alignment*)](https://arxiv.org/abs/2502.18965) 為代表的前沿研究所掀起的範式轉移：從多階段的漏斗過濾，走向端到端的自迴歸生成（Generative Recommendation）。

過去的推薦模型本質上是「**判別式（Discriminative）**」的思維，其核心任務是給定特定用戶與商品，去**預估一個單點的互動機率 $P(\text{action} \mid u, i)$**。對於模型而言，這就像是在做無數道「是非題」或「打分題」，它只能被動地對系統餵給它的候選商品進行評估，專注於局部的特徵匹配，卻缺乏對全局商品空間以及商品之間關聯性的宏觀理解。

而生成式推薦則將問題昇華，直接讓模型學習複雜的**聯合機率分佈 $P(\text{items} \mid u, c)$**。給定用戶歷史與上下文，模型直接像寫文章一樣，一步步「生成」出最適合的商品序列。這本質上比起判別式，對於模型而言更像是一道「開放式申論題」——模型不再受限於既定的候選集，而是必須真正掌握用戶興趣的演變脈絡與全局商品的分佈特徵，具備主動構建內容序列的全局視野與推理能力。

不僅如此，這種演算法的轉變，更解鎖了傳統架構無法企及的**四大優勢**：

### 一、統一目標，消除內耗與歸因難題
生成式架構採用單一強大的端到端模型，直接根據用戶上下文輸出最終的推薦列表，而非如傳統多階段級聯架構般逐層篩選。由於模型擺脫了分階段優化不同局部目標的妥協，改由單一模型對同一終極目標進行優化，因而能直接對全局最優解負責。同時，由於不再受限於多階段的複雜過濾規則，問題案例的歸因變得極為純粹——成效優劣皆源於該統一模型的權重與訓練數據，徹底消滅了系統偵錯的黑盒現象。

### 二、消除系統 IO，讓計算回歸計算
採用單一強大端到端模型的另一項顯著優勢在於：此範式徹底省去了跨網路傳輸、繁雜的特徵拼接與多輪檢索。資訊的流轉、用戶興趣的捕捉以及商品的精準匹配，皆在單一模型的一次<information concept="concept.forward_pass">前向傳播</information>中，經由隱藏層權重運算瞬間完成。至此，系統的 IO 瓶頸被徹底打破，時間預算得以全數挹注於核心的模型計算之上。

### 三、硬體親和性與 Scaling Law 的真正釋放
由於生成式架構的底層骨幹網路（如 <information concept="concept.transformer">Transformer</information>）具備高度同質化的結構，其核心運算幾乎全是大規模的 <information concept="concept.gemm">GEMM</information>，完美契合了現代 GPU 的底層設計，因而得以充分釋放 <information concept="concept.scaling_law">Scaling Law</information> 的紅利。

在軟硬體高度對齊的優勢下，投入的每一分算力都能無縫轉化為模型規模的擴展，這使得推薦系統徹底擺脫了低 <information concept="concept.roi">ROI</information> 的泥沼，正式迎來「算力越大、能力越強」的全新範式。

### 四、全面繼承 LLM 的技術生態
當推薦系統轉向標準的 Transformer 自迴歸架構後，另一個巨大的隱藏紅利在於：**不再需要重複造輪子**。

在工程層面，推薦系統可以直接「無縫接入」LLM 領域極度成熟的工程優化——無論是 <information concept="concept.flash_attention">FlashAttention</information>、<information concept="concept.kv_cache">KV Cache</information>、<information concept="concept.vllm">vLLM</information> 推理加速，還是 <information concept="concept.megatron">Megatron</information> 的分散式訓練框架。

更重要的是，在演算法層面，推薦系統也能直接吃滿大模型的技術紅利。例如，透過引入 LLM 前沿的<information concept="concept.alignment">對齊技術</information>——如 <information concept="concept.rlhf">RLHF</information> 或 <information concept="concept.dpo">DPO</information>，系統可以直接借鑑這些框架，跳脫短視的<information concept="concept.ctr">點擊率</information>（CTR）指標，建立動態的獎勵模型來優化用戶的長期滿意度。這讓推薦系統的迭代速度得以與全球頂尖的 AI 工程社群正式接軌，全面繼承這波大模型基建爆發的技術紅利。

<callout>
title: 探索機制的範式轉移：從外掛啟發式到原生解碼採樣
icon: compass
content:
當推薦系統走向端到端生成時，過去許多經典難題的解題思維也發生了本質上的轉變。以**探索機制**為例：

- **傳統級聯架構：** 過去為了解決<information concept="concept.cold_start">冷啟動</information>與<information concept="concept.filter_bubble">資訊繭房</information>問題，多在排序後以規則強插新商品、或引入簡單的隨機探索策略。這種方式與模型本體解耦，本質上只是事後的啟發式補救。
- **端到端生成範式：** 探索機制被優雅地融入模型本身的**解碼過程**。透過調整 <information concept="concept.temperature">Temperature</information>、<information concept="concept.top_k">Top-$K$</information> 或 <information concept="concept.top_p">Top-$p$</information> 等採樣參數，模型在<information concept="concept.autoregressive">自迴歸</information>生成下一個商品 Token 時，天生即帶有基於全局機率分佈的適度隨機性與多樣性。

這並非代表生成式探索在所有維度上絕對優於傳統外掛，而是將「探索與利用」的權衡從繁雜的外部規則，轉化為模型內建的採樣特性，提供了一種更渾然天成、與模型能力完全對齊的解法。
</callout>

## 3. 結語：算法、硬體與生態共振的未來

從級聯漏斗到自迴歸生成的演進，本質上是推薦系統架構重新對齊現代硬體物理特性的必然結果。過去十幾年來，業界在多階段漏斗架構上持續進行局部優化，雖然支撐了業務規模的擴張，但也使系統日益繁複，逐漸觸及效能與投資報酬率（ROI）的成長天花板。

轉向端到端自迴歸生成，不僅解決了碎片化模組帶來的內部損耗與通訊開銷，更讓推薦系統的底層運算契合了現代硬體的天性。藉由將任務統一於 Transformer 架構下，系統得以擺脫記憶體頻寬的限制，真正釋放 Scaling Law 的潛能，同時無縫銜接大語言模型的成熟工業基建。

對工程與研發團隊而言，這場範式轉移標誌著核心焦點的轉變：從過去繁瑣的跨模組調優與歸因排查，回歸到模型與數據本身的建設。隨著底層架構的重塑，未來的推薦引擎將不再只是被動的過濾篩選器，而是具備全局視野與推理能力的內容生成中樞。

<reviewkit>
<takeaways>
- **傳統級聯架構的效能死胡同：** 多階段漏斗不僅帶來了優化目標錯位（局部最優 $\neq$ 全局最優）與龐大的 IO 通信開銷，更致命的是，其充滿碎片化邏輯與 Embedding 查找的特性，屬於「記憶體頻寬受限」任務。這與現代 GPU 追求「算力密集」的天性嚴重互斥，導致系統陷入低 ROI 的 Scaling 陷阱，更淪為錯失大模型基建紅利的技術孤島。
- **從「判別」到「生成」的思維昇華：** 推薦任務從預估單點互動機率的被動「打分題」$P(\text{action} \mid u, i)$，轉變為直接生成最適合商品序列的「開放式申論題」$P(\text{items} \mid u, c)$。這迫使模型不再依賴多級過濾，而是直接掌握全局商品分佈，從源頭統一了優化目標並消滅了歸因黑盒。
- **軟硬體對齊與生態大一統（以 OneRec 為例）：** 端到端自迴歸架構徹底打破了 IO 瓶頸。其底層 Transformer 架構將運算統一為大規模矩陣乘法（GEMM），完美契合 GPU 物理特性。這不僅讓推薦系統真正解鎖了「算力越大、能力越強」的 Scaling Law，更能無縫繼承 FlashAttention、vLLM 等頂尖 LLM 工業級基建，實現演算法、硬體與生態的全面共振。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料（References）

### 技術文章（Technical Articles）

1. [知乎：从原理到落地详细解读生成式推荐OneRec](https://zhuanlan.zhihu.com/p/2011387251351908741)