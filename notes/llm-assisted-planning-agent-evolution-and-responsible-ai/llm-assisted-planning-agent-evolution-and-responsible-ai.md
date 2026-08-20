<meta>
Title: 大模型輔助規劃、Agent 演進與可信決策：從理論到負責任 AI 治理
Summary: 本文探討現代 AI Agent 的演進歷程與大語言模型（LLM）驅動的全新規劃範式。從 1980 年代符號 Agent、2000 年代增強學習 Agent 到現代 LLM 語言推理與多 Agent 協作，詳細剖析大模型與古典符號規劃器結合的 4 大前沿範式（LLM 導引 PDDL 生成與修正、LLM 與 MCTS 混合子目標規劃、LLM 啟發式 Python 代碼合成、全自動泛化規劃）。同時論述 Rational Agent 的感知-決策-行動閉環，以及可信與負責任 AI（Responsible AI）在安全、隱私、公平、可解釋性與政策法規監管下的權衡與開發生命週期（SDLC）實踐。
Slug: llm-assisted-planning-agent-evolution-and-responsible-ai
Output: notes/llm-assisted-planning-agent-evolution-and-responsible-ai/llm-assisted-planning-agent-evolution-and-responsible-ai.html
CanonicalId: llm-assisted-planning-agent-evolution-and-responsible-ai
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: ai agents, llm planning, responsible ai, automated planning, mcts, agentic ai
Status: drafting
Published: 2026-08-19
LastModified: 2026-08-19
</meta>
<draft>
- 1. AI Agent 的四代演進歷史與理性 Agent 環節
    - 從 1980s Symbolic 到 2000s RL, 2020s LLM (ReACT) 到 2030s Multi-Agent
    - Rational Agent 的感知、建模、推理與決策閉環
    - 規劃問題的維度矩陣（簡單 vs 複雜：可觀察度、確定性、動態性、單/多 Agent）
- 2. 大模型與符號規劃器結合的四大前沿範式
    - 範式一：LLM 導引 PDDL 生成與閉環修正（Mahdavi et al., NeurIPS 2024）
    - 範式二：任務分解與 LLM-MCTS 混合子目標規劃（Kwon et al., ICRA 2025）
    - 範式三：LLM 啟發式代碼合成（Corrêa et al., ArXiv 2025）
    - 範式四：全自動泛化規劃與 CoT 程式碼生成（Silver et al., AAAI 2024）
- 3. 工業級規劃框架與開源生態
    - AIPlanning4EU (Unified Planning library)
    - PANDA Framework（HTN、HDDL、PANDADealer）
- 4. 可信與負責任 AI 規劃與決策（Responsible AI）
    - Human-Aware AI 與 Trustworthy AI 核心原則
    - 準確度（Accuracy）與負責任特性（Responsible Features）的 Trade-off
    - 系統開發生命週期（SDLC）內的決策融入與全球法規趨勢（EU AI Act 等）
</draft>

# 大模型輔助規劃、Agent 演進與可信決策：從理論到負責任 AI 治理

隨著大語言模型（LLM）與基礎模型（Foundational Models）的爆發式成長，人工智能正在經歷從「單純的文本生成與常識答疑」向「具備主動目標規劃、工具使用與自我糾錯能力」的 **Agentic AI（Agent 化人工智能）** 跨越。

然而，單靠 LLM 的常識推理往往容易產生幻覺（Hallucination），缺乏嚴密的符號邏輯保證；而傳統古典規劃器雖然具備百分之百的正確性，卻受限於手工構建 PDDL 模型的高昂成本。**將大模型的常識與語言理解能力，與古典規劃器的嚴密符號推理深度結合**，成為當前 AI 規劃領域最受矚目的突破點。

本文將梳理 AI Agent 的四代演進歷程，深入剖析 LLM 輔助規劃（LLM-Assisted Planning）的四大前沿技術範式，並進一步論述可信與負責任 AI（Responsible AI）在實際系統部署與治理中的關鍵框架。

---

## 1. AI Agent 的四代演進歷史與理性 Agent 環節

### 1.1 四代 Agent 技術範式演進

回顧人工智能的發展歷史，Agent 的心智模型與核心驅動引擎經歷了四個階段的重大演進：

```
+------------------+     +------------------+     +------------------+     +------------------+
|    1980s Agent   |     |    2000s Agent   |     |    2020s Agent   |     |    2030s Agent   |
|   Symbolic AI    | --> | Reinforcement L. | --> |    LLM Agent     | --> | Tool-Using Multi |
| Logic & PDDL     |     | Trial & Error RL |     | ReACT & CoT LLM  |     | Agent Ecosystem  |
+------------------+     +------------------+     +------------------+     +------------------+
```

1. **1980s 符號 AI Agent（Symbolic Agent）**：依賴人工定義的邏輯規則與符號規劃器（如 STRIPS）。具備嚴密的邏輯推理能力，但缺乏對不確定性環境的適應力與常識理解。
2. **2000s 強化學習 Agent（Reinforcement Learning Agent）**：透過試錯（Trial & Error）與獎勵訊號（Reward Signals）學習最佳策略函數（Policy $\pi(a \mid s)$）。在特定封閉領域（如圍棋、電玩）表現優異，但採樣效率低且難以泛化至未見任務。
3. **2020s LLM Agent（Large Foundation Model Agent）**：以預訓練大語言模型為腦髓，利用 <information context="Reasoning and Acting Paradigm">ReACT</information>（Reasoning + Acting）與 Chain-of-Thought（CoT）實現自然語言推理與步驟規劃。
4. **2030s 多 Agent 協作生態（Tool-Using Multi-Agent）**：結合外部工具 API、長期記憶體系統（Memory Systems）與分工明確的多 Agent 團隊，具備複雜任務委派與動態協調能力。

### 1.2 理性 Agent（Rational Agent）架構與問題複雜度維度

一個完整的**理性 Agent（Rational Agent）**，必須在環境中形成「感知-建模-推理-規劃-行動」的閉環：

- **感知（Perception & Sensing）**：接收環境的多模態觀察。
- **建模與推理（Modeling & Reasoning）**：維護內部世界模型（World Model）與常識推導。
- **規劃與決策（Planning & Decision Making）**：評估目標與價值，產生動作序列。
- **行動與溝通（Acting & Communicating）**：執行動作並與環境或人類協作。

環境複雜度矩陣決定了規劃器所需的技術組態：

| 環境維度 | 簡單場景（Toy Problems） | 複雜現實場景（Real-Life Problems） |
| :--- | :--- | :--- |
| **可觀察性** | 完全可觀察（Fully Observable） | 部分可觀察（Partially Observable, POMDP） |
| **動作空間** | 離散動作（Discrete） | 連續控制（Continuous Control） |
| **動態轉移** | 確定性轉移（Deterministic） | 非確定性 / 隨機性（Stochastic / Dynamic） |
| **主體數量** | 單一 Agent（Single Agent） | 多 Agent 競爭與協作（Multi-Agent / Game Theory） |

---

## 2. 大模型輔助規劃的四大前沿範式

近年來，學界與業界探索出將 LLM 與符號規劃（Symbolic Planning）結合的四大核心範式：

```
                             [ Natural Language Goal & Domain ]
                                             |
                                             v
                           +-----------------------------------+
                           | Large Language Model (LLM Engine) |
                           +-----------------------------------+
                                             |
       +-----------------------+-------------+-------------+-----------------------+
       | Paradigm 1            | Paradigm 2                | Paradigm 3            | Paradigm 4
       v                       v                           v                       v
[ LLM-Guided PDDL ]   [ Subgoal Decomposition ]   [ Heuristic Code Synthesis ] [ Generalized Planning ]
(Model Generation &   (Symbolic Planner +         (Python Code Heuristics    (Program Generation &
 Env Feedback VAL)     LLM-Policy MCTS)            for Pyperplan/GBFS)        Automated Debugging)
```

### 範式一：LLM 導引 PDDL 自動生成與閉環修正（LLM-Guided PDDL Creation）

- **代表研究**：Mahdavi et al., NeurIPS 2024 (*LLM-Guided PDDL Creation and Refinement*)。
- **運作機制**：
  1. LLM 根據自然語言描述自動草擬 PDDL 領域模型（Domain）與問題定義（Problem）。
  2. 將生成的 PDDL 送入符號驗證工具（如 <information context="Validator for PDDL Plans">VAL</information>）與求解器（Fast Downward）進行環境模擬測試。
  3. 若發現語法錯誤或無法求解，將環境反饋資訊（Feedback）回傳給 LLM 進行疊代修正。
- **實證效果**：引入環境反饋閉環後，任務解決率大幅提升至 **66%**（遠高於僅靠 GPT-4 內部 Chain-of-Thought 推理的 29%）。

### 範式二：任務分解與 LLM-MCTS 混合子目標規劃（Task Decomposition & Subgoal Planning）

- **代表研究**：Kwon et al., ICRA 2025 (*Hybrid Symbolic + MCTS Planning*)。
- **運作機制**：
  1. LLM 發揮常識優勢，將複雜的高階目標分解為多個子目標（Subgoals）。
  2. 對於中等複雜度的子目標，交由傳統符號規劃器（Fast Downward）迅速精確求解。
  3. 當遇到符號代價過高或複雜度超出預期的子問題時，系統自動切換至基於 **蒙地卡羅樹搜尋（MCTS）** 的 LLM 規劃器，利用 LLM 作為 Rollout Policy（L-Policy）引導搜尋。
- **優勢**：結合了符號規劃的速度與 MCTS/LLM 在高維空間的突破能力，顯著降低規劃時間並提升擴展性。

### 範式三：LLM 領域專屬啟發式程式碼合成（Heuristic Generation via LLMs）

- **代表研究**：Corrêa et al., 2025 (ArXiv)。
- **運作機制**：
  1. 不直接讓 LLM 輸出動作序列，而是讓 LLM 閱讀 PDDL 領域規格後，**自動編寫 Python 語言實現的域專屬啟發式函數代碼**。
  2. 將合成的啟發式代碼動態載入至傳統古典規劃器（如 Pyperplan）中，搭配貪婪最佳優先搜尋（GBFS）引導搜尋方向。
- **優勢**：生成的啟發式大幅減少了搜尋過程中探索的狀態節點數，效能顯著超越標準的域獨立啟發式（Domain-Independent Heuristics）。

### 範式四：基於 LLM 的全自動泛化規劃（Generalized Planning in PDDL Domains）

- **代表研究**：Silver et al., AAAI 2024 (*Generalized Planning in PDDL Domains with Pretrained LLMs*)。
- **運作機制**：
  1. 給定 PDDL 領域描述與僅僅 2 個訓練任務範例。
  2. LLM 透過 CoT 提取領域內部的廣義解題策略，直接合成能解決該領域**任意新任務**的通用 Python 規劃程序（Solver-like Code）。
  3. 透過 Automated Debugging 閉環，根據驗證結果不斷 Prompt LLM 修正程式碼。
- **實證效果**：在 7 個標準 PDDL 領域中，僅需 2 個訓練任務，LLM 生成的通用程序效能即可媲美甚至超越傳統求解器基線。

---

## 3. 工業級規劃框架與開源生態

在理論研發之外，開源社群也推出了多項將現代規劃技術工程化的統一框架：

- **AIPlanning4EU (Unified Planning Library)**：歐洲 AI 規劃專案，提供統一的 Python 介面，讓開發者能以簡潔程式碼定義 Fluent 與 Action，並一鍵切換後端異構求解器（如 Fast Downward、Tamer 等）。
- **PANDA Framework**：德國烏爾姆大學開發的分層規劃框架（PANDA Network Decomposition Architecture），完整支援 HDDL（Hierarchical Domain Definition Language），其下的 **PANDADealer** 奪得 IPC 2023 分層規劃競賽冠軍。

---

## 4. 可信與負責任 AI 規劃與決策（Responsible AI）

隨著 AI Agent 開始接管醫療診斷推薦、自動駕駛、金融貸款審核與公共福利發放等高風險決策，**負責任 AI（Responsible AI）** 成為不可迴避的核心課題。

```
                    +------------------------------------+
                    |     Rational Decision Making       |
                    |  (Optimizing Objective & Utility)  |
                    +------------------------------------+
                                      |
         +----------------------------+----------------------------+
         | Trade-off & Balance                                     |
         v                                                         v
+---------------------------------+               +---------------------------------+
|      Performance Metrics        |               |      Responsible Features       |
|  - Accuracy & CTR / CVR         |               |  - Safety & Privacy             |
|  - Speed & Throughput           |               |  - Fairness & Transparency      |
|  - Resource Efficiency          |               |  - Accountability & Governance  |
+---------------------------------+               +---------------------------------+
```

### 4.1 可信 AI 的核心治理原則

一個具備理性與負責任特性的 Agent 系統，必須在設計中貫徹以下原則（參考 Russell & Norvig Ch. 27）：

1. **安全性（Safety）**：保證 Agent 執行的動作序列絕不會侵犯物理或邏輯安全邊界（ Fail-safe Mechanisms）。
2. **隱私保護（Privacy）**：在狀態感知與數據學習中嚴格保護用戶敏感資訊。
3. **公平性（Fairness）**：避免決策策略產生對特定群體的偏見或歧視。
4. **透明度與可解釋性（Transparency & Explainability）**：Agent 需能對其產生的規劃方案給出人類可理解的理由（Why this action sequence?）。
5. **問責制與歸因性（Accountability & Attribution）**：明確 Agent 決策鏈路中的責任歸屬。

### 4.2 準確度與負責任特性的權衡（Trade-offs）

在工程實踐中，系統設計者永遠面臨著**效能/準確度與負責任特性之間的權衡（Trade-off）**：
- 加入嚴格的隱私保護（如差分隱私）或可解釋性約束，可能會限制模型的表徵能力，帶來少許準確度下降。
- 引入安全審查與合規檢查機制，會增加推斷延遲與算力成本。

因此，負責任 AI 的決策不應是事後的補救措施，而必須**貫穿於軟體工程的完整生命週期（SDLC）**：從需求分析、架構設計、代碼實作、測試驗證，到上線後的運營監控與政策審查（Policy and Governance）。同時，全球立法趨勢（如歐盟 **EU AI Act**、美國 **AI Bill of Rights**）正逐步將這些原則轉化為具備法律約束力的強制規範。

<reviewkit>
<takeaways>
- **AI Agent 四代演進：** 從 1980s 符號 AI（規則/PDDL）、2000s 增強學習（試錯/獎勵）、2020s LLM Agent（ReACT/語言推理）走向 2030s 多 Agent 工具協作生態。理性 Agent 需完成感知、建模、推理、規劃與行動閉環。
- **LLM-Assisted Planning 四大範式：** （1）LLM+VAL 環境反饋閉環生成 PDDL（NeurIPS 2024，成功率 66%）；（2）LLM 任務分解 + MCTS/Fast Downward 混合規劃（ICRA 2025）；（3）LLM 合成 Python 啟發式代碼導引 GBFS（ArXiv 2025）；（4）LLM 基於 2 個範例生成通用 PDDL 解題程序（AAAI 2024）。
- **工業級開源生態：** AIPlanning4EU 提供 Unified Planning 統一介面；PANDA Framework（PANDADealer）主導了 HDDL 分層規劃競賽。
- **負責任 AI 治理（Responsible AI）：** 規劃與決策系統必須平衡效能（Accuracy/Speed）與可信特性（Safety, Privacy, Fairness, Transparency, Accountability）。負責任 AI 必須融入 SDLC 全生命週期，並對齊 EU AI Act 等全球監管法規。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料（References）

1. Mahdavi, S., et al. (2024). LLM-guided PDDL creation and refinement. In *Advances in Neural Information Processing Systems (NeurIPS 2024)*. [arXiv:2410.03570](https://arxiv.org/abs/2410.03570)
2. Kwon, M., et al. (2025). Hybrid symbolic and MCTS planning with large language models. In *IEEE International Conference on Robotics and Automation (ICRA 2025)*.
3. Silver, T., Dan, S., Srinivas, K., Tenenbaum, J. B., Kaelbling, L., & Katz, M. (2024). Generalized planning in PDDL domains with pretrained large language models. In *Proceedings of the AAAI Conference on Artificial Intelligence*, 38(18), 20006-20014. [arXiv:2305.11014](https://arxiv.org/abs/2305.11014)
4. Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct: Synergizing reasoning and acting in language models. In *International Conference on Learning Representations (ICLR)*. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
