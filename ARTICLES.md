# ARTICLES (筆記與文章創作/優化清單)

本文件為 Ludwigia 的**寫作與筆記主題專用追蹤清單（Writing & Notes Backlog）**。  
所有與工程、架構、系統功能、UI 樣式無關的「文章撰寫、論文深度研讀、筆記重構、思考散文與比喻種子」，統一收錄於此，保持 `TODO.md` 專注於工程與站點架構交付。

---

## 一、大語言模型推理加速與投機解碼系列（LLM Inference Acceleration & Speculative Decoding）

### 1. DSpark: Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation
- [ ] 規劃並撰寫 DSpark 深度技術筆記
  - **核心主題**：置信度調度（Confidence-Scheduled）投機解碼與半自迴歸生成（Semi-Autoregressive Generation, SAR）。
  - **研究重點**：
    - 如何利用目標模型或 draft 過程中的動態置信度評估，自適應調度投機步數與驗證長度。
    - Semi-Autoregressive (SAR) 機制如何在保證自迴歸解碼目標分佈精確無損（Lossless Distribution Matching）的前提下，突破傳統逐字串行生成的時間瓶頸。
    - 與典型 Speculative Decoding（如 SpecInfer、Medusa）在接受率（Acceptance Rate）與 Memory-bound 緩解上的對比。
  - **References**：
    - [知乎專欄解析](https://zhuanlan.zhihu.com/p/2054489873655002015)
    - [arXiv:2607.05147](https://arxiv.org/abs/2607.05147)

### 2. EAGLE-3: Feature-Level Speculative Decoding Evolution
- [ ] 規劃並撰寫 EAGLE-3 架構深度筆記
  - **核心主題**：EAGLE 家族第三代加速推理技術，深入 Feature-Level 投機與高階 Draft Tree。
  - **研究重點**：
    - EAGLE-1/2 到 EAGLE-3 的演進脈絡：為何在 Feature/Hidden-State 空間進行投機比直接在 Token ID 空間更具魯棒性與預測力。
    - EAGLE-3 的輕量級 Draft Head 設計與非自迴歸特徵融合機制。
    - 動態樹狀驗證（Tree Attention）在不同 Batch Size、硬體頻寬（A100/H100）下的實測加速比與工程落地實踐。
  - **References**：
    - [知乎專欄解析](https://zhuanlan.zhihu.com/p/29007609465)
    - [arXiv:2503.01840](https://arxiv.org/pdf/2503.01840)

### 3. FastMTP: Accelerating LLM Inference with Enhanced Multi-Token Prediction
- [ ] 規劃並撰寫 FastMTP 原理與實務筆記
  - **核心主題**：Multi-Token Prediction (MTP) 架構在推測解碼與 LLM 推理加速中的實踐與增強。
  - **研究重點**：
    - 傳統 MTP（如 DeepSeek-V3 / Meta MTP）在多步預測時的表徵漂移與長程依賴退化瓶頸。
    - FastMTP 如何透過增強表徵、注意力結構修正或輔助損失，提升未來多個 Token 的預測準確度與接受率。
    - MTP 與獨立 Draft Model 投機解碼的算力/顯存開銷折衷（Trade-off）分析。
  - **References**：
    - [知乎專欄解析](https://zhuanlan.zhihu.com/p/1956000400772686421)
    - [arXiv:2509.18362](https://arxiv.org/abs/2509.18362)

### 4. EntMTP: Accelerating LLM Inference with Entropy Guided Multi Token Prediction
- [ ] 規劃並撰寫 EntMTP 原理與調度機制筆記
  - **核心主題**：基於生成上下文局部熵（Local Generation Entropy）動態調度 MTP 注意力樹狀拓撲的推測解碼加速架構。
  - **研究重點**：
    - 傳統 MTP / Self-speculative 解碼採用靜態樹狀注意力拓撲（Static Tree-based Attention Topology）的結構性缺陷：高熵語意邊界推測過深導致驗證開銷浪費，低熵流暢區域推測過淺未能吃滿吞吐收益。
    - EntMTP 如何透過運行時（Running Estimate）計算局部生成熵，自適應在 Pareto-optimal 樹狀拓撲集合中動態切換推測深度。
    - 訓練免調（Training-free scheduler）架構在多種基準（Humaneval, ShareGPT, GSM8k）下的實測表現，以及相較 Hydra / Medusa 的加速比增益。
  - **References**：
    - [arXiv:2606.27550](https://arxiv.org/abs/2606.27550)
    - [arXiv HTML](https://arxiv.org/html/2606.27550v1)

### 5. Direct Multi-Token Decoding (DMTD): Late-Layer Multi-Token Generation
- [ ] 規劃並撰寫 DMTD 架構與分層特徵機制筆記
  - **核心主題**：揭示 Transformer 前中後層職責分離特性，實現免額外參數、免 Draft Model、免後驗證的直接多 Token 解碼（Direct Multi-Token Decoding, DMTD）。
  - **研究重點**：
    - Transformer 垂直層次的分工假說：前層聚焦上下文理解（Input Context）、中層處理任務特徵（Task-specific Processing）、後層負責將抽象表徵映射至輸出 Token（Representation-to-Token）。
    - DMTD 機制：一旦前中層完成特徵抽取，僅依賴後層（Late Layers）直接連續生成多個 Token，免除自迴歸過程中重複穿越前中層的龐大計算開銷。
    - 與典型投機解碼（Speculative Decoding）的本質區別：零新增參數量、無獨立 Draft Model 顯存佔用、無需額外驗證步驟（Lossless/Low-loss trade-off）。
    - 在 Qwen3-4B 等模型上的 2x 加速比實證與 Scaling 潛力。
  - **References**：
    - [arXiv:2510.11958](https://arxiv.org/abs/2510.11958)

### 6. 觀點篇：投機解碼（Speculative Decoding）與「我對投機開訓練 Job 的理解」
- [ ] 撰寫技術反思散文《投機解碼與投機開 Job 的資源配置哲學》
  - **文章目標**：不只介紹 `speculative decoding` 的標準流程，而是把它和我自己在實際研究 / 實作時對「哪些訓練 job 值得先投機地開、哪些不值得」的判斷連起來。
  - **問題意識**：
    1. `speculative decoding` 到底在省什麼、賭什麼、什麼情況下真的有效？
    2. 這種「先用便宜 draft / proxy 去換大模型吞吐」的思路，如何影響我對訓練 job 啟動時機、風險與資源配置的理解？
  - **論述主線**：先講 `draft model -> verify model` 的基本機制，再把重點轉到它背後更一般化的思維模式：不是所有 expensive path 都該直接硬跑，而是要先找可不可以用便宜近似去過濾、加速或提前淘汰明顯不值得的路徑。
  - **寫作角度**：偏第一視角反思，結合技術直覺、accept/reject 成本結構、draft quality 與 speedup 的 trade-off，映射到訓練階段的 proxy experiment / small-scale dry run / cheap signal first。
  - **一句話摘要**：`speculative decoding` 不只是 inference 技巧，它也提醒我：在昂貴實驗前，先設計一層便宜但有資訊量的近似驗證，往往比直接把最貴的 job 全開下去更重要。

---

## 二、開源前沿大模型與架構演進系列（Frontier Foundation Models & Architecture Innovations）

### 1. DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning
- [ ] 規劃並撰寫 DeepSeek-R1 大規模純強化學習與推理湧現深度筆記
  - **核心主題**：利用純強化學習（Large-Scale RL）激發大語言模型深度推理能力、自反思（Self-Reflection）與測試期計算（Test-time Compute）擴展範式。
  - **研究重點**：
    - **R1-Zero 與純 RL 湧現**：在缺乏人類 SFT 標註數據的前提下，直接在 Base 模型上透過純 RL（Pure RL without SFT）引導出超長 Chain-of-Thought（CoT）、自驗證（Verification）、動態策略調整與「Aha Moment」認知頓悟。
    - **GRPO（Group Relative Policy Optimization）演算法**：徹底移除傳統 PPO 中的 Critic 網絡，改以群組相對打分估計優勢函數（Advantage），大幅削減訓練顯存開銷與通信瓶頸。
    - **規則驅動獎勵（Rule-based Rewards）**：利用編譯器代碼測試與數學精確匹配（Accuracy Reward）結合格式約束（Format Reward，強制 `<think>` 標籤規範），從根源杜絕神經網絡 Reward Model 的獎勵作弊（Reward Hacking）。
    - **全鏈路兩階段多步管線（DeepSeek-R1 Pipeline）**：冷啟動小數據（Cold-start data） $\to$ 推理導向 RL $\to$ 拒絕採樣（Rejection Sampling）與通用數據 SFT $\to$ 次級全場景 RL 對齊。
    - **小模型知識蒸餾（Distillation vs Direct RL）**：將 671B R1 湧現出的高階推理軌跡蒸餾至 Qwen（1.5B/7B/14B/32B）與 Llama（8B/70B），實證「大模型 RL 湧現 + 小模型蒸餾」遠勝於小模型直接單獨跑純 RL。
  - **References**：
    - [arXiv:2501.12948](https://arxiv.org/abs/2501.12948)
    - [arXiv PDF](https://arxiv.org/pdf/2501.12948)
    - [GitHub: DeepSeek-AI/DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1)

### 2. DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence
- [ ] 規劃並撰寫 DeepSeek-V4 架構技術解析筆記
  - **核心主題**：百萬長文本（Million-Token Context）與極限推理成本優化的大規模 MoE 架構。
  - **研究重點**：
    - 混合注意力架構（Hybrid Attention）：壓縮稀疏注意力（Compressed Sparse Attention, CSA）與深度壓縮注意力（Heavily Compressed Attention, HCA）如何將 1M 上下文下的 KV Cache 壓低至 DeepSeek-V3.2 的 10%、單 Token 推理 FLOPs 降低 73%。
    - 流形約束超連接（Manifold-Constrained Hyper-Connections, mHC）：重構傳統殘差連接（Residual Connections），在高層特徵流形上施加約束以提升超深層模型穩定性。
    - Muon 優化器在大規模預訓練（32T+ Tokens）中的快速收斂與超參數魯棒性。
    - Post-training 深度推理模式（DeepSeek-V4-Pro-Max）與長程推理（Long-horizon reasoning）能力湧現。
  - **References**：
    - [arXiv:2606.19348](https://arxiv.org/abs/2606.19348)
    - [arXiv PDF](https://arxiv.org/pdf/2606.19348)
    - [HuggingFace Collection](https://huggingface.co/collections/deepseek-ai/deepseek-v4)

### 3. MiniMax-01: Scaling Foundation Models with Lightning Attention
- [ ] 規劃並撰寫 MiniMax-01 閃電注意力與線性 MoE 筆記
  - **核心主題**：線性注意力機制（Lightning Attention）與大規模稀疏混合專家（MoE, 456B 總參數 / 45.9B 激活）的融合落地。
  - **研究重點**：
    - 線性注意力（Linear Attention / Lightning Attention）在數學原理與工程實現上的突破，突破 Softmax 二次複雜度瓶頸，維持推論時常數級/低成本狀態維護。
    - 長文本原生支持：預訓練 100 萬 Token，推理無損外推至 400 萬 Token（4M Context Window）。
    - 系統級軟硬體優化：針對 Lightning Attention + MoE 的通訊-計算重疊（Overlap）與分散式並行策略。
    - 多模態擴展：MiniMax-VL-01 的 512B 視覺-語言持續預訓練與跨模態理解。
  - **References**：
    - [arXiv:2501.08313](https://arxiv.org/abs/2501.08313)
    - [GitHub: MiniMax-AI](https://github.com/MiniMax-AI)

### 4. MiMo: Unlocking the Reasoning Potential of Language Model -- From Pretraining to Posttraining
- [ ] 規劃並撰寫小米 MiMo-7B 推理模型全流程筆記
  - **核心主題**：專為深度推理打造的小鋼砲開源模型（小米 MiMo-7B），貫穿「預訓練強化 $\to$ 強化學習（RL）後訓練」全鏈路架構設計。
  - **研究重點**：
    - 預訓練創新：25T Tokens 高品質數據管線、三階段數據混合策略（Data Mixing Strategy），以及原生整合 Multi-Token Prediction (MTP) 目標增強推理與解碼吞吐。
    - 後訓練（Post-training）突破：130K 可驗證數學與程式題目庫，提出測試難度驅動的代碼獎勵機制（Test-Difficulty-Driven Code-Reward Scheme），從根本緩解 RL 探索中的稀疏獎勵（Sparse-reward）瓶頸。
    - 7B 小尺寸跨越式能力：在代碼與數學推理上超越部分 32B 模型與 OpenAI o1-mini，驗證小模型高密度推理的極限。
  - **References**：
    - [arXiv:2505.07608](https://arxiv.org/abs/2505.07608)
    - [GitHub: XiaomiMiMo/MiMo](https://github.com/xiaomimimo/MiMo)

### 5. Gemma 系列：實用尺度下的模型架構精粹與知識蒸餾（Google Gemma 1 / 2 / 3）
- [ ] 規劃並撰寫 Google Gemma 系列架構與蒸餾技術筆記
  - **核心主題**：Google 開源模型家族在「實用參數量（Practical Size）」下的精準架構取捨與端側部署工程。
  - **研究重點**：
    - Gemma 2 的關鍵架構演進：滑動窗口注意力（Sliding Window Attention, SWA）與全域注意力的交替堆疊、Logit Soft-capping（避免激活值極化）、Pre-and-Post RMSNorm 數值穩定性設計。
    - 知識蒸餾（Knowledge Distillation）在開源基礎模型預訓練與微調中的核心角色：如何藉助超大參數量 Teacher 模型（Gemini）傳遞暗知識，使 2B/9B/27B 取得越級性能。
    - Gemma 3 與 PaliGemma：向視覺語言與多模態的自然延伸，以及端側推理效率與記憶體頻寬平衡。
  - **References**：
    - [Gemma 2 Technical Report (arXiv:2408.00118)](https://arxiv.org/abs/2408.00118)
    - [Gemma 1 Paper (arXiv:2403.08295)](https://arxiv.org/abs/2403.08295)

---

## 三、大模型安全、對齊與機器遺忘系列（LLM Safety, Alignment & Machine Unlearning）

### 1. Wisdom is Knowing What not to Say: Hallucination-Free LLMs Unlearning via Attention Shifting
- [ ] 規劃並撰寫 LLM 機器遺忘與 Attention Shifting 筆記
  - **核心主題**：大語言模型選擇性機器遺忘（Selective Machine Unlearning）與注意力偏移（Attention Shifting, AS）機制。
  - **研究重點**：
    - 傳統 Unlearning 的雙難困境（Dilemma）：激進遺忘會劇烈損害模型通用能力（Utility Loss），而保守遺忘則易在被詢問遺忘知識時產生荒謬幻覺（Hallucination）。
    - Attention Shifting (AS) 的雙核心機制：
      1. 上下文保留抑制（Context-Preserving Suppression）：降低對敏感/目標事實 Token 的注意力權重，同時保持語法與通用語境結構完好。
      2. 抗幻覺響應塑形（Hallucination-Resistant Response Shaping）：面對遺忘知識查詢時，引導模型給予穩健拒絕或真實替代，而非胡亂編造。
    - 雙損失聯合優化（Dual-loss Objective）：在表徵疊加（Representation Superposition）條件下畫出軟邊界（Soft Boundary），隔離目標知識。
    - 基準測試與聯動：在 ToFU 與 TDEC 基準上取得顯著優勢，後續可與 NUS CS5562 Trustworthy Machine Learning（對抗魯棒性、隱私與安全性）建立深度交叉引用。
  - **References**：
    - [arXiv:2510.17210](https://arxiv.org/abs/2510.17210)
    - [arXiv HTML](https://arxiv.org/html/2510.17210v1)

---

## 四、啟發式優化、組合搜索與演算法理論（Metaheuristics, Combinatorial Optimization & Search Algorithms）

### 1. Iterated Local Search (ILS): 經典元啟發式算法框架與擾動搜索理論
- [ ] 規劃並撰寫 Iterated Local Search 系統性架構筆記
  - **核心主題**：組合優化（Combinatorial Optimization）經典元啟發式算法「迭代局部搜索」（Iterated Local Search, ILS）的系統性本質。
  - **研究重點**：
    - ILS 四大核心基石：Initial Solution（初始解） $\to$ Local Search（局部精細搜索） $\to$ Perturbation（非破壞性擾動以跳出局部最優） $\to$ Acceptance Criterion（接受準則：決定是貪婪、保留或退火接受）。
    - 探索（Exploration / Diversification）與利用（Exploitation / Intensification）的微妙動態平衡：擾動過大退化為隨機重啟，擾動過小易被困於同一吸引盆（Basin of Attraction）。
    - 經典問題實踐：旅行商問題（TSP）、流水車間調度（Flow-Shop Scheduling）及圖分割。
    - 與機器學習與離散優化的現代交匯：聚類中心優化（K-Medoids / K-Means 局部搜索擴展）、離散特徵選擇、以及 LLM Agentic Planning 中的推測-修正搜索類比。
  - **References**：
    - [arXiv:math/0102188](https://arxiv.org/abs/math/0102188)

---

## 五、NUS 碩士專業課程筆記整理系列（NUS Courseware Series）

目前 `notes/` 目錄中已有大量修課原始筆記（Raw Notes），需依 Ludwigia 標準規範（`<reviewkit>`、多語 metadata、核心 Takeaways、數學公式與圖表）進行模組化重構、提煉與發布。

### 1. NUS CS5246: Text Mining
- [ ] 重構並結構化發布 `notes/NUS CS5246 Text Mining/`
  - **現況**：已有 5800+ 行豐富筆記（涵蓋自然語言處理基礎、詞向量、主題模型、語義解析、資訊抽取、LLM 與文本生成）。
  - **待辦事項**：
    - 拆分章節單元，評估是否建立主題式子筆記（如 Word Representation, Sequence Labeling, Topic Models, Transformer in NLP）。
    - 規範化標題層級與 LaTeX 公式，補齊每篇的 `<takeaways>` 與 `<reviewkit>` 驗證題庫。

### 2. NUS CS5228 Knowledge Discovery and Data Mining
- [ ] 整理並發布 `notes/NUS CS5228 Knowledge Discovery and Data Mining/`
  - **核心內容**：資料前處理、關聯規則挖掘（Apriori / FP-Growth）、分類算法、聚類方法、離群點檢測與高維數據降維。
  - **待辦事項**：將原始講義轉化為系統性知識架構，與既有機器學習分群系列筆記建立站內連結。

### 3. NUS CS5242: Neural Networks and Deep Learning
- [ ] 整理並發布 `notes/NUS CS5242 Neural Networks and Deep Learning/`
  - **核心內容**：神經網絡基礎數學原理、反向傳播梯度推導、卷積神經網絡（CNN）、循環神經網絡（RNN/LSTM）、注意力機制與 Transformer 架構演進、正規化技巧（Dropout, BatchNorm, LayerNorm）。
  - **待辦事項**：萃取精煉直觀推導，補齊概念本質說明與代碼實踐重點。

### 4. NUS CS5223: Distributed Systems
- [ ] 整理並發布 `notes/NUS CS5223 Distributed Systems/`
  - **核心內容**：分散式系統時間同步（Logical/Vector Clocks）、一致性模型（Linearizability, Sequential Consistency）、共識協議（Paxos, Raft）、拜占庭容錯（BFT）、分散式儲存與事務處理（2PC/3PC）。
  - **待辦事項**：與已發布的 SMR / Paxos 筆記建立雙向引用，補充分散式通訊與容錯機制的整體脈絡。

### 5. NUS CS5562: Trustworthy Machine Learning
- [ ] 整理並發布 `notes/NUS CS5562 Trustworthy Machine Learning/`
  - **核心內容**：對抗性攻擊與防禦（Adversarial Robustness）、模型可解釋性（XAI, LIME/SHAP）、差分隱私（Differential Privacy）、算法公平性（Algorithmic Fairness）與模型水印。
  - **待辦事項**：提煉核心定義與度量指標，建立針對現代大模型安全與對齊的批判性思考。

### 6. NUS IS5126: Hands-on with Applied Analytics
- [ ] 整理並發布 `notes/NUS IS5126 Hands-on with Applied Analytics/`
  - **核心內容**：商業與實務數據分析工作流、特徵工程實戰、預測模型評估、時間序列分析與 A/B Testing 架構。
  - **待辦事項**：收斂實務分析經驗與工程踩坑紀錄，提煉為可重用的分析方法論。

### 7. NUS CS5224: Cloud Computing
- [ ] 整理並發布 `notes/NUS CS5224 Cloud Computing/`
  - **核心內容**：雲端計算基礎、NIST 參考架構、負載均衡與資源池化架構、資料中心硬體與散熱能耗（PUE）、虛擬化技術（全虛擬化/二進位翻譯、類虛擬化/Hypercalls、硬體輔助虛擬化 VT-x/VMCS、Type 1/2 虛擬機監視器與攻擊面）、容器與 Docker 架構（Namespaces、Cgroups、客戶端-服務端架構與映像檔生命週期）、雲服務交付模型（IaaS/PaaS/SaaS）、多租戶架構（Provider vs Consumer 視角、租戶隔離六大特徵、資料層隔離模式），以及雲端應用架構與 RESTful 設計。
  - **待辦事項**：已彙整為以 Week 1–6 劃分的大師筆記，包含完整硬體抽象模型、Popek-Goldberg 定理證明、Docker 內部核心機制與多租戶資料庫工程取捨。

### 8. NUS CS5446: Reinforcement Learning and Sequential Decision Making
- [ ] 整理並發布 `notes/NUS CS5446 Reinforcement Learning and Sequential Decision Making/`
  - **核心內容**：感知-決策閉環與狀態空間搜尋、古典符號規劃（STRIPS/PDDL/SATPlan）、啟發式搜尋與階層任務網路（HTN）、不確定性下的理性決策（決策論、效用論、博弈論）、馬可夫決策過程（MDP）、無模型強化學習（Model-Free RL）、價值函數近似（Function Approximation）、深度 Q 網路（DQN）、策略梯度定理（Policy Gradients / REINFORCE）、行動者-評論家架構（Actor-Critic / A2C / SAC）、信賴域進階策略搜尋（TRPO / PPO），以及獎勵塑造（Reward Shaping: 勢能獎勵塑造 PBRS 策略不變性證明、計數與偽計數探索獎勵、隨機網路蒸餾 RND 與 Noisy-TV 困境、瓶頸拓撲與樹狀展開、大語言模型過程獎勵模型 Math-Shepherd 與 RLHF 偏好對齊，以及前沿多智能體與自適應獎勵架構 ReLara、CenRA、SASR）。
  - **待辦事項**：已彙整 Week 1–6 大師筆記，包含完整演算法推導、Widrow-Hoff 與梯度下降對比、SARSA 與 Q-learning 探索安全性分析、Deadly Triad、PPO 截斷目標函數、PBRS 伸縮求和不變性證明、RLHF Bradley-Terry 損失與多智能體獎勵蒸餾架構。

### 9. NUS CS5234: Algorithms at Scale
- [ ] 整理並發布 `notes/NUS CS5234 Algorithms at Scale/`
  - **核心內容**：亞線性時間與查詢演算法（Sublinear-Time & Query Algorithms）、機率集中不等式（Markov, Chebyshev, Chernoff, Union Bound）、變異數縮減與中位數技巧（Mean Trick & Median Trick）、圖邊數與連通分量亞線性估計、決策樹計算模型與 Yao 氏極小極大定理（Yao's Minimax Principle）、性質測試框架（Property Testing: Monotonicity, Uniformity, Bipartiteness）、串流計算與水塘抽樣（Reservoir Sampling）、Morris 對數計數演算法、圖串流連通性與 $(2k-1)$-Spanners 稀疏跨角圖、度量分群（Metric $k$-Center 2-近似與 Dominating Set NP-Hardness 下界、格點串流分群）、階層式 $k$-Median Coreset 樹（Guha et al.）與最小外接球（MEB）幾何核心集（Bădoiu-Clarkson Core-Sets）。
  - **待辦事項**：已彙整 Lecture 1–6 為 Week 1–6 大師筆記，包含完整數學嚴格證明、隨機化下界、性質測試器、串流演算法與核心集架構分析。

---

## 六、現有筆記重構與深度優化（Notes Refactoring & Deep-Dives）

### 1. 重構與深化《Discovering Hidden Structures: What Clustering Really Does》
- [ ] 重構核心邏輯與動態思維
  - **現有問題**：`notes/discovering-hidden-structures-what-clustering-really-does/` 雖然提及三類 Clustering 家族，但在「分群的根本動機」與「Representative Point 的哲學定義」上尚可精準深化；同時 Centroid-based 篇幅比重偏大。
  - **重構重點**：
    1. **開頭重新定義分群根本動機 (Motivations)**：釐清「求同 (Core Archetype)」與「求連貫/關聯 (Manifold Continuity)」的本質差異。
    2. **閾值決定機制與完備性 (Thresholding & Partitioning)**：絕對閾值 (Absolute Threshold, e.g. DBSCAN $\epsilon$，不完備分群) vs 相對比較 (Relative Assignment, e.g. K-Means，完備分群)。
    3. **「Representative Point」的深層哲學與 GMM / EM 演算法連結**：
       - **Inside-Out (起源/藍圖)**：*「先有點，再有群」*。代表點是生成整個 Cluster 的本質起源或核心藍圖。
       - **Outside-In (統計平均/計算捷徑)**：*「先有群，再有中心」*。代表點純粹是數學平均值，是提高計算效率的手段。
       - **EM 雙向迭代邏輯**：E-step 依 Inside-Out 算責任度；M-step 依 Outside-In 重新估計參數。
       - **符號規則與物理現象的解耦**：EM 與 K-Means 本質是純粹數學優化規則，公式並非天然自帶物理語意，而是現實現象極致抽絲剝繭後「恰好對齊」。對接專文 <content-link canonical="first-principles-symbols-and-rules">《第一性原理的終極型態》</content-link>。
    4. **Density-based (DBSCAN) 的流形動機與幾何意義**：追求局部連貫性（Continuity / Connectivity），探討流形空間在實際應用的意義。
    5. **Hierarchical Clustering 的多尺度樹狀層次**：Linkage 規則如何改變分群哲學（Single, Complete, Average/Ward）。

### 2. 重構《從級聯漏斗到自迴歸生成：推薦系統的範式重塑》的寫作焦點
- [ ] 純粹收斂在「系統架構層 (System Pipeline Architecture)」
  - **主線聚焦**：說明從分階段級聯漏斗（召回 -> 粗排 -> 精排 -> 重排）走向端到端大一統（如 OneRec）的根本原因，在於全鏈路共享同一套 Transformer Backbone。
  - **局部 vs 全局放大效應**：傳統級聯單一模組用 Transformer 仍會被跨模組 RPC/IO、特徵拼接與異構非 GEMM 階段所瓶頸；只有收斂為單一 Backbone 時，Scaling Law、GEMM 硬體親和性、LLM 生態繼承才能從局部擴大到全系統。
  - **逐段精簡**：精簡 Memory-bound 計算細節與演算法數學公式，導流至新模型篇。

### 3. 規劃與撰寫《從判別式打分到自迴歸生成：推薦模型的範式轉移》
- [ ] 新建專注文於「模型演算法建模層 (Model Formulation & Algorithmic Paradigm)」的深度筆記
  - **數學與任務定義**：判別式單點打分 $P(\text{action} \mid u, i)$（是非題/打分題）vs 自迴歸序列生成 $P(\text{items} \mid u, c)$（開放式申論題）。
  - **物品表示（Item Tokenization）**：原子 ID (Atomic ID) 散列與高維稀疏 Embedding Table vs Semantic ID / RQ-VAE 殘差量化編碼（Model-as-Index）。
  - **硬體親和性與算力分配**：記憶體頻寬受限 (Memory-bound) 的異構小模型 vs 算力密集 (Compute-bound) 的大規模 GEMM 矩陣乘法。
  - **生態繼承與模型對齊**：DPO / RLHF 對齊用戶長期滿意度，無縫繼承 FlashAttention、KV Cache、vLLM、Megatron。
  - **探索機制演進**：從事後規則強插與啟發式外掛轉向解碼原生採樣（Temperature, Top-$k$, Top-$p$）。

### 4. 深化《生成式推薦的基石：Semantic ID 如何破解海量商品 Token 化難題》
- [ ] 精準化類比與理論觀點
  - **分類類比檢討**：否定生物分類/郵遞區號樹，確立 RQ-VAE 本質為「幾何殘差向量逼近 (Residual Vector Approximation)」。後續 Token 是方向補償而非語意子集（GPS 地標位移 / 畫師幾何筆觸）。由粗到細反映幾何座標逼近精度。
  - **為什麼不能直接生成 Continuous Item Embedding**：自迴歸 Transformer 擅長離散空間 Next-Token 機率預測。Atomic ID 無語意且極度依賴歷史互動；Semantic ID 因子化拆分實現冷啟動繼承。
  - **共享統計強度與 TIGER 消融實驗**：實證 Random ID 遠遜於 RQ-VAE，證明由粗到細語意對齊的重要性。
  - **RQ-VAE 碼本崩塌防禦**：First-batch K-means 初始化與 Cluster Features EMA 更新。
  - **碼本更新質心與 VQ-VAE 穩定性紅利**：計算誤差質心逐步修正，有效防禦 Mode Collapse。
  - **廣泛下游應用**：數據壓縮 (Data Compression) 與語音/NLP 離散特徵提取。

### 5. 規劃與撰寫《K-Means 聚類演算法：從牧師-村民模型、調優改進到 EM 收斂證明》
- [ ] 新增專注於 K-Means 的完整結構化筆記（`notes/k-means-clustering-algorithm-and-em-proof/`）
  - **算法介紹**：牧師-村民模型 (Priest-Villager Model)、算法步驟、時間與空間複雜度分析、虛擬代碼。
  - **演算法優缺點**：計算線性優勢 vs $K$ 值預設敏感、離群點敏感、硬劃分與非凸幾何劣勢。
  - **算法調優與改進**：數據標準化、手肘法、Gap Statistic 方法（Tibshirani 論文與蒙特卡洛模擬）、核函數 (Kernel K-means)、初始點改進 (K-means++ / K-means||)、動態聚類 (ISODATA)。
  - **EM 算法框架下的收斂性證明**：E-step 硬分配求期望，M-step 偏導數為 0 導出中心為質心 $\mu_k = \frac{1}{|C_k|} \sum x_i$，解釋局部極小值成因。

---

## 七、思考、方法論與觀點散文（Essays & Methodologies）

### 1. 寫作框架與技術傳播方法論
- [ ] **Writing：整理幾種可重用的寫作框架 / scaffold**
  - 定義 3-5 種常用結構（觀點論述型、教學拆解型、反思札記型、比較分析型、讀書/研究摘要型），讓 writing 新文可快速起稿。
- [ ] **Writing：Survey 型文章如何和 introduction / per-technique notes 串成一條內容鏈**
  - 拆解為三層體系：`Introduction`（問題定義） $\to$ `Related techniques`（單一技術 deep-dive） $\to$ `Survey / Comparison`（橫向決策矩陣） $\to$ `Summary`（高層視野）。以 Clustering 為具體落地範例。
- [ ] **Writing：先用寫作架構與 raw info 協作，再交給 Agent / LLM 補內容，最後全盤 proofread**
  - 架構先行幫助 refine；前面的整理、填充、重組皆可委派，但最後的人類全盤審閱絕不能省略。

### 2. 機器學習與推薦系統洞見
- [ ] **Writing：寫一篇關於 `pairwise vs listwise ranking` 的文章**
  - 核心主張：`pairwise` 學的是局部相對順序 $s(i) > s(j)$；`listwise` 則是把 pair 放回整個 list 的 context 裡，由整體目標與 metric sensitivity 決定哪些 pair 的錯序真正傷害整體排序品質。以 LambdaRank 為例深入淺出。

### 3. Vibe-coding 與 Agentic AI 時代的反思
- [ ] **Writing：Doc-driven vibe-coding（Workflow 篇：如何用文檔整理 repo，讓 vibe-coding 可持續）**
  - 文檔分層（Contract / Spec / Rules / Dev / How-to）、記錄決策理由的價值、任務可驗收化（Agent-friendly 委派原則）。
- [ ] **Writing：Doc-driven vibe-coding（Reflection 篇：為什麼文檔爆炸、協作如何改變自學與寫作習慣）**
  - 為什麼有 Agent 後文檔必然變多、寫作與自學習慣的遷徙、Single Source of Truth 逼出的好架構。
- [ ] **Writing：Vibe-coding / Agentic AI 的效率與疲憊（Automation 帶來的決策疲勞）**
  - AI 自動化大量實作後，工程師日常轉向「高頻關鍵決策 + 高頻 context switch」，探討決策疲勞的成因與節奏調節機制。
- [ ] **Writing：為什麼在 Agent 時代，我越來越不想用 Notion 記錄 codebase**
  - Code 本體在 Agent 協作下成為真正唯一的 SSOT；分析同步 codebase 到 Notion 的重工成本，釐清 Notion 真正該沉澱什麼（日誌、決策理由、takeaways）。

### 4. 認知心理學與思維模型
- [ ] **Writing：理解新事物時，為什麼先知道分類更好吸收**
  - 探討「分類先行」如何提供高層、辨識度高的認知骨架，避免細節成為孤島，加速知識掛載。
- [ ] **Writing：Brainstorming 的 BFS / DFS**
  - 探討發散探索（BFS）與收斂深挖（DFS）之間的拉扯，如何避免深挖時忘記原本展開的分支。

---

## 八、寫作靈感與比喻種子（Writing Seeds & Ideas）

- [ ] **Writing seeds：`recognition-vs-active-recall`**
  - 探討認知心理學中的「再認（Recognition）」與「主動提取（Active Recall）」在機器學習、推薦系統表徵學習與人類大腦抄捷徑模式之間的深刻對照。
