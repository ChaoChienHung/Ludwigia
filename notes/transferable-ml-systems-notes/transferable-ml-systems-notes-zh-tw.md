<meta>
Title: 可遷移機器學習與系統設計筆記
Tags: ML, System Design, Scaling Laws, Sequence, Data, SNR, Quota, Dedup, Context, Chinchilla, Embedding, Sparsity, Attention, Memory, Engram, Orthogonality, LSH, Agent, LLM
Summary: 從數據/序列、Scaling Laws、記憶注入，到系統/Agent 邊界的可遷移原則。
Slug: transferable-ml-systems-notes-zh-tw
Output: notes/transferable-ml-systems-notes/transferable-ml-systems-notes-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: false
Status: drafting
</meta>

# 可遷移機器學習與系統設計筆記

這是一份為您深度提煉的知識點筆記。我已經過濾掉了單純的實驗數值和特定業務的 performance improvement，專注於提取可遷移（Transferable）與可泛化（Generalizable）的核心機器學習、模型架構與系統設計概念。

## 四個核心領域

- `1` 序列與數據建模
- `2` 模型架構與縮放定律
- `3` 記憶注入與特徵正交性
- `4` 系統設計與 Agent 邊界

## 一、序列與數據建模 (Data & Sequence Modeling)

### 1. 序列信噪比（SNR）控制與配額過濾 (Behavioral Quota Filtering)

<block>
title: 核心概念
content:
在處理長尾且極度不平衡的用戶行為序列時，低價值且高頻的行為（如 Impression/曝光）會迅速淹沒高價值但低頻的行為（如 Order/下單、Cart/加購），導致模型對深度轉化信號的建模能力退化。
</block>

<block>
title: 泛化應用
content:
構建任何時間序列或行為序列數據時，引入嚴格的優先級與硬性配額上限（Hard Quota）。高價值數據可向下順延填補空缺，但低價值噪音數據必須有絕對截斷閾值，等同於在數據層面強制提升信噪比（SNR）。
</block>

### 2. 上下文感知去重 (Context-Aware Deduplication)

<block>
title: 核心概念
content:
去重不應僅依賴 ID 精確匹配。同一個實體在不同場景（Scene）下出現，可能蘊含不同意圖信號。
</block>

<block>
title: 泛化應用
content:
只要在輸入前綴保留足夠的場景上下文，神經網絡可學會區分「無效重複」與「有效回訪」。長序列去重主鍵建議使用 `Context + ID`，而不是單純 `ID`。
</block>

## 二、模型架構與縮放定律 (Model Architecture & Scaling Laws)

### 1. Chinchilla Law 的參數口徑與 Embedding 本質

<block>
title: 核心概念
content:
評估模型參數規模與 FLOPs 時，Tie / Untie Embedding（輸入與輸出層共享權重）的處理方式很關鍵。
</block>

<block>
title: 泛化應用
content:
Tie Embedding 更像正則化（Regularization），不是新增「額外參數」。算力口徑下，Untied 輸入 Embedding 多是 lookup，通常不參與密集矩陣乘法。有效參數口徑可用 `N = body + V · H`，而不是把 embedding 算兩次，這會直接影響 Scaling Laws 的預測準確性。
</block>

### 2. 模型規模與稀疏性容忍度 (Sparsity Tolerance vs. Model Scale)

<block>
title: 核心概念
content:
在 Full Attention 與 Sliding Window Attention 的比例分配上，不同模型規模對稀疏度的容忍不同。
</block>

<block>
title: 泛化應用
content:
模型容量越大，越能吃下更高稀疏度：可維持少量 Full Attention 層不變，並提高 Sliding Window 層比例。小模型過度稀疏容易崩。結構化稀疏（Structural Sparsity）的 ROI 往往在大模型上更高。
</block>

## 三、記憶注入與特徵正交性 (Memory Injection & Orthogonality)

### 1. Engram Injection（記憶外掛與算力解放）

<block>
title: 核心概念
content:
透過 Gated Projection（類似殘差連接），把高頻模式（如固定 ID 組合）注入到模型淺層（Layer 0 之後）。
</block>

<block>
title: 泛化應用
content:
模型算力有限。若大量參數用於死記硬背高頻共現模式，會擠壓推理能力。把高頻模式交給外部 Engram 模塊可解放算力；並且不經 Attention 建模組合、直接 Gate 注入，在動力學上可視作增加有效深度（Effective Depth）。
</block>

### 2. 架構收益與特徵收益的正交性 (Orthogonal Gains)

<block>
title: 核心概念
content:
引入 Engram（架構層）與引入額外 Context（數據層特徵豐富）帶來的收益可疊加。
</block>

<block>
title: 泛化應用
content:
不同歸納偏置（Inductive Bias）的引入通常正交：改信息流路徑（架構修改）與提升輸入信息熵（特徵工程）常互補，是打破瓶頸的通用策略。
</block>

## 四、系統設計與 Agent 邊界 (System Design & Agent Limits)

### 1. LSH（局部敏感哈希）的應用邊界與召回深度博弈

<block>
title: 核心概念
content:
LSH 的優勢在於候選更小、排序更精確；但當召回配額極大時，粗暴 baseline 可能靠覆蓋率抹平優勢。
</block>

<block>
title: 泛化應用
content:
算法選擇強依賴系統約束（Constraints）。在小 Top-K、低延遲、高精度場景，精細算法價值更能兌現；在寬召回、大 Quota 場景，覆蓋率更重要，應選開銷最小的 baseline。沒有絕對領先算法，只有最匹配 operating regime 的策略。
</block>

### 2. Agentic Cycle 中 LLM 的「局部最優陷阱」

<block>
title: 核心概念
content:
在沒有足夠外部回饋與硬性約束時，LLM 很容易在局部語義空間裡反覆修飾、重寫與打轉，陷入看似有進展、實則沒有真正突破的局部最優陷阱。
</block>

<block>
title: 泛化應用
content:
Agentic workflow 不能只依賴「讓模型再想一次」。需要顯式 feedback signal、termination rule、以及 hard-stuck breaker。否則 loop 只會放大語言流暢性，卻不一定提高任務完成度。
</block>

## 可遷移總結

- 好的序列建模，核心不是保留最多資料，而是保留最高價值的訊號。
- 好的模型設計，不能只看參數量，還要看算力口徑、稀疏配置與可被釋放的有效深度。
- 好的記憶與特徵設計，常來自不同歸納偏置的正交疊加。
- 好的系統與 Agent 設計，關鍵不是單點技術最強，而是是否匹配 operating regime 與回饋機制。
