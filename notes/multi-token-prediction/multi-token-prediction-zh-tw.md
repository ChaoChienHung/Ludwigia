<meta>
Title: Multi-Token Prediction：從更好的訓練到更快的生成
Summary: 從 next-token prediction 出發，理解 MTP 如何以未來位置的額外監督影響主模型，如何搭配候選驗證加速生成，以及 LLM 與生成式推薦的代表方法與閱讀入口。
Slug: multi-token-prediction-zh-tw
Output: notes/multi-token-prediction/multi-token-prediction-zh-tw.html
CanonicalId: multi-token-prediction
Style: default
ContentDir: notes
Lang: zh-Hant
Tags: large language models, multi-token prediction, speculative decoding, generative recommendation
Status: drafting
LastModified: 2026-10-07
EstimatedReadingTime: true
</meta>

<draft>
- 定位：系列入口，先建立問題、機制與方法地圖；各方法推導與工程細節留在獨立筆記。
- 待作者 proofread：確認例子、術語與範圍；深入筆記目前以 References 資源蒐集為主。
- 證據邊界：資料核對至 2026-10-06；不把作者機制假說當定理，不把不同硬體的速度數字當排名。
</draft>

# Multi-Token Prediction：從更好的訓練到更快的生成

大語言模型能接續一段文字、完成一段程式，背後常有一個共同的訓練任務：根據已經出現的 token，預測下一個。這就是 Next-Token Prediction（NTP，下一個 token 預測）。它看起來簡單，卻能讓模型從大量文字與程式中反覆練習如何接續前文。

## NTP 的力量，以及它留下的兩個問題

假設一段文字被切成 `A B C D`。以 NTP 訓練時，模型會看 `A` 預測 `B`、看 `A B` 預測 `C`，再看 `A B C` 預測 `D`。一段訓練序列的許多位置都能提供監督；任務也與自迴歸生成時「根據前文決定下一個 token」的形式相符。NTP 並非只讓整段文字產生一個答案，也不是無法學到長距離關係。

但仍有兩個值得追問的空間。**第一，同一個位置的直接預測目標只有下一個 token：如果也要求模型預測更遠的未來，會不會提供有用的額外監督？** 第二，生成一段回答時，模型還不知道自己下一步會選什麼，必須先產生它，才能沿著這條路繼續寫；能不能減少反覆等待主模型的時間？第二個問題來自自迴歸解碼的序列依賴，不能簡單歸咎於 NTP 的訓練 loss。

訓練時，正確的 `B C D` 已經存在。模型可以一次讀入序列，透過 causal attention mask 讓每個位置只使用當前及之前的資訊，平行計算各位置的預測與 loss。生成時沒有未來的正確答案，要先選出 `B`，才能把它接回前文決定 `C`。**訓練能平行計算許多位置，並不表示生成也能直接一次決定整段文字。**

## MTP：共同的問題，不同的實作

Multi-Token Prediction（MTP，多 token 預測）從第一個問題出發：在某個前文位置，除了下一個 token，也嘗試預測後面更多位置。它可以讓主模型接收額外的未來位置監督；如果這些預測還能便宜地提出合理候選，也可能服務第二個問題。不過，**MTP 是一個方法家族，不是一套固定的 heads、loss 或解碼流程**；兩種用途可以結合，也可以分開。[Gloeckle et al., 2024](https://proceedings.mlr.press/v235/gloeckle24a.html)；[DeepSeek-V3, §2.2](https://arxiv.org/html/2412.19437v2)

沿用 `A B C D` 的例子：看見 `A` 後，除了預測 `B`，還可以增加對 `C`、`D` 的預測。但要理解任何一種實作，還得問三件事：

1. **預測什麼？** 是分別預測幾個未來位置，還是建模整段候選的關係？到了推薦系統，token 甚至可能代表商品編碼或不同商品。
2. **較遠的預測看見什麼？** 可以讓多個 head 都只依賴同一段前文，也可以讓後續模組接上中間 token 或前一步的表示。這會改變候選之間的一致性與計算方式。
3. **額外訓練更新誰？** 若 loss 回傳到共享主模型，它可能改變 backbone 學到的表示；若凍結主模型、只訓練附加 heads，主要得到的是候選預測能力，不能直接宣稱主模型本身變強。

例如，<content-link canonical="multi-token-prediction-gloeckle-2024">Gloeckle 等人的 MTP</content-link>以共享主幹與獨立 heads 研究多未來位置監督；<content-link canonical="deepseek-v3-mtp">DeepSeek-V3</content-link>改用逐層相接的 MTP 模組，保留中間 token 的因果鏈。這兩種設計都能回答「能否多預測幾步」，卻不能共用同一張架構圖或同一個 loss 公式。[Gloeckle et al., 2024, §2](https://arxiv.org/html/2404.19737v1)；[DeepSeek-V3, §2.2](https://arxiv.org/html/2412.19437v2)

## 為什麼可能讓主模型學得更好？

若同一個表示除了要預測下一步，還要支援更遠的位置，它可能更需要保留對後續有用的資訊。例如程式中的分支選擇會影響後面一串 token；未來位置的 loss 可能讓相關線索得到更多直接監督。這是理解 MTP 可能有用的直覺，不是所有任務都會改善的保證。

不能因此直接說「模型學會規劃」。<content-link canonical="multi-token-prediction-gloeckle-2024">Gloeckle 等人的研究</content-link>同時討論這種機制假說，並用程式與其他任務測試；不同任務的收益並不一致。入口篇先保留這個證據邊界，架構、實驗與機制討論放到該篇細讀。[Gloeckle et al., 2024, §3–5](https://arxiv.org/html/2404.19737v1)

也要記得前一節的梯度問題。<content-link canonical="medusa">Medusa</content-link>同時討論凍結 backbone 只訓練 heads，以及共同調整主模型的路線；兩者可能改善的對象不同。[Cai et al., 2024](https://proceedings.mlr.press/v235/cai24b.html)

所以「提升訓練效率」至少要拆成同資料量的表現、達到同表現所需的 token 數，以及 FLOPs／實際 GPU 時間。額外任務會增加成本；資料利用更好，不代表訓練時間自動更短。每篇方法筆記會分開核對這些指標，而不是把它們合成一個「更有效」。

## 多 token 候選，如何變成更快的生成？

現在回到推論：如果附加 heads 或模組能先提出 `B C D`，主模型就有機會一次評估這段候選，再依選定的規則接受其中可用的前綴。錯誤位置之後的候選不能直接沿用，需要修正並重新提出。<content-link canonical="blockwise-parallel-decoding">Blockwise Parallel Decoding</content-link>是理解「先猜一段、再驗證」的早期入口；減少的主要是主模型必須依序執行的輪次，總 FLOPs 未必減少。[Stern et al., 2018](https://papers.nips.cc/paper/8212-blockwise-parallel-decoding-for-deep-autoregressive-models)

速度收益取決於候選有多便宜、每輪平均能接受多少 token，以及驗證、排程與硬體執行成本。**候選越多，不一定越快。** 具體的候選樹、接受規則與延遲數字，適合回到各方法筆記比較。

這裡也能看清 MTP 與 speculative decoding 的關係：前者描述多步預測的模型或訓練設計，後者描述「提出候選、驗證與接受」的解碼程序。Speculative decoding 可以使用獨立小模型作為 drafter，不必採用 MTP；MTP 也可以只在訓練中使用。[Leviathan et al., 2023](https://proceedings.mlr.press/v202/leviathan23a.html)

最後，**保留 greedy 結果、保留採樣分布、維持評測品質，是三種不同保證。** <content-link canonical="speculative-decoding-leviathan-2023">Leviathan 等人的 speculative decoding</content-link>討論如何保留目標採樣分布；<content-link canonical="medusa">Medusa</content-link>的 typical acceptance 則採不同取捨。閱讀「品質不下降」的加速報告時，不能自動補上分布完全相同的結論。[Leviathan et al., 2023](https://proceedings.mlr.press/v202/leviathan23a.html)；[Medusa, §2.3](https://arxiv.org/html/2401.10774v3)

## 代表模式：先看它解決什麼問題

這些案例不是同一架構的不同品牌。入口篇只標出各自想解的問題與關鍵差異；運作細節、收益和實驗條件留在對應分篇。

- <content-link canonical="multi-token-prediction-gloeckle-2024">Gloeckle 等人的 MTP</content-link>：讓共享主幹同時接收多個未來位置的監督，研究這會如何影響主模型；另探索已訓練 heads 的推論用途。
- <content-link canonical="deepseek-v3-mtp">DeepSeek-V3</content-link>：用相依的 MTP 模組保留預測的因果鏈；輔助目標參與訓練，模組在一般推論可移除，也能用於候選生成。[DeepSeek-V3, §2.2](https://arxiv.org/html/2412.19437v2)
- <content-link canonical="medusa">Medusa</content-link>：聚焦既有模型的多步候選與驗證；比較只訓練 heads 和共同調整模型的路線。[Cai et al., 2024](https://proceedings.mlr.press/v235/cai24b.html)
- <content-link canonical="mimo-7b-mtp">MiMo-7B</content-link>：把聯合預訓練與凍結主模型後的額外 head 訓練分成階段，分別服務主模型與候選品質。[MiMo, §2.2](https://arxiv.org/html/2505.07608v1)

<content-link canonical="qwen3-next-mtp">Qwen3-Next</content-link>、<content-link canonical="glm-5-mtp">GLM-5</content-link> 等模型也提供工程採用案例，但模型同時改變了架構、資料與訓練流程，不能把整體提升全部歸因 MTP。加速 RL rollout 又是另一種「訓練效率」：更快生成訓練樣本，不等於學到同能力所需資料更少。[Qwen 官方文章](https://qwen.ai/blog?id=qwen3-next)；[GLM-5](https://arxiv.org/abs/2602.15763)

## 生成式推薦：先問 token 代表什麼

在推薦系統中，多 token 可能是同一件商品的多個編碼，也可能代表多個商品或未來互動。理解這個差異，可以先讀 <content-link canonical="semantic-id-in-generative-recommendation">Semantic ID：生成式推薦如何表示商品</content-link>。

<content-link canonical="rpg-generative-recommendation">RPG</content-link> 把一個商品表示為無序的長 Semantic ID，平行預測其各個組件，並用圖約束解碼避免無效 ID。它解決的是同一商品的編碼生成，不是預測使用者接下來多次互動，也不等同於 LLM 的 draft-and-verify。[Hou et al., 2025](https://arxiv.org/abs/2506.05781)

<content-link canonical="gpr-generative-recommendation">GPR</content-link> 則以 MTP 表達多個興趣方向，再接價值對齊與策略優化；作者報告已部署於騰訊微信視頻號廣告系統。這是產業採用案例，但整體業務收益不能單獨歸因給 MTP。<content-link canonical="echorec">EchoRec</content-link> 的研究方向又不同：以未來多個商品的監督輔助主模型。**推薦領域的「多」究竟指編碼組件、並存興趣，還是時間上連續的商品，必須逐篇確認。** [Zhang et al., 2025](https://arxiv.org/abs/2511.10138)；[EchoRec](https://arxiv.org/abs/2608.14011)

## 收益的邊界，決定我們該怎麼比較

未來越遠，不確定性通常越大；增加 heads、loss 權重或預測距離，都需要在額外監督與任務難度之間取捨。候選之間的依賴也會影響接受率，並行預測並非唯一答案。Curriculum 研究甚至觀察到，主模型品質較好的配置不一定保留同樣的 self-speculative 加速收益。[Aynetdinov & Akbik, 2025](https://arxiv.org/abs/2505.22757)

因此，後續每篇筆記都沿著四個問題展開：預測什麼、每一步看見什麼、loss 更新哪些參數，以及推論如何使用與驗證。先對齊這些契約，再比較資料效率、表現與實際延遲，才能理解不同設計各自解決的問題。

## 訓練目標與預測架構的深入筆記

以下是系列的資源筆記，正文待補；先保留論文、官方文章與程式來源，之後逐篇完善。

- <content-link canonical="multi-token-prediction-gloeckle-2024">2024 MTP：共享表示與多未來位置監督</content-link>
- <content-link canonical="prophetnet">ProphetNet：future n-gram 預訓練</content-link>
- <content-link canonical="tensor-decomposition-mtp">Tensor decomposition：多 token 聯合分布</content-link>
- <content-link canonical="efficient-llm-inference-mtp">既有 NTP 模型的 MTP 適配限制</content-link>
- <content-link canonical="mtp-pretraining-curriculum">MTP 的預訓練 curriculum</content-link>
- <content-link canonical="your-llm-knows-the-future">Your LLM Knows the Future：後訓練 MTP</content-link>
- <content-link canonical="post-training-mtp-heads">Post-Training MTP Heads：對齊目標分布</content-link>

## 模型採用與工程實作的深入筆記

這一組比較已核對的模型版本；家族中其他版本不因名稱相近就自動視為採用。

**確認原生採用、確認主模型訓練改善，以及確認推論加速，是三種證據強度。** 模型卡提供 MTP 啟用指令，能支持特定 checkpoint 的部署能力；沒有 loss／梯度描述與消融實驗時，就不能額外推導其主模型收益。完整模型同時改變的資料、架構、訓練流程也很多，整體性能或吞吐提升不能全歸因給 MTP。下表記錄選讀版本與來源，避免把家族名稱當作所有 checkpoint 的共同契約。

| 模型／主要資源 | 日期／版本 | 已核對的 MTP 用法 | 應保留的證據邊界 |
| --- | --- | --- | --- |
| [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) | 2024 初稿；2025 v2 | §2.2 sequential modules 與 auxiliary objective；§4.5.1 主模型訓練消融；可移除模組或用於 speculative decoding | 訓練收益與 decoding 數據分開引用；實際配置只有一個額外未來 token |
| [MiMo: Unlocking the Reasoning Potential of Language Model -- From Pretraining to Posttraining](https://arxiv.org/abs/2505.07608) | 2025；研究細節據 v1 §2.2 | MiMo-7B 聯合預訓練使用 MTP，再凍結主模型與第一層，訓練新增 heads | 階段不同，優化對象不同；head acceptance 不等於 backbone 改善 |
| [GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models](https://arxiv.org/abs/2508.06471) | 2025 v1 | GLM-4.5／Air 各一層 MoE MTP layer，支援 speculative decoding | 採用明確；所讀架構段落不足以建立獨立訓練改善的因果主張 |
| [Qwen3-Next: Towards Ultimate Training & Inference Efficiency](https://qwen.ai/blog?id=qwen3-next) | 官方文章 2025-09-10 | 原生 MTP、多步訓練與推論對齊；釋出 Base／Instruct／Thinking | 官方描述，非單獨 MTP 消融；總體 hybrid architecture 吞吐不能當 MTP 淨收益 |
| [MiMo-V2-Flash Technical Report](https://arxiv.org/abs/2601.02780) | 2026 v1；模型 2025-12 釋出 | 輕量 head、後訓練多步複製與 self-speculative decoding；兼顧 RL rollout | 比較需保留 input/output 長度、batch、接受長度；不是固定三倍的通用保證 |
| [Qwen3.5-397B-A17B 官方模型卡](https://huggingface.co/Qwen/Qwen3.5-397B-A17B) | 2026-02 | MTP multi-step training；模型卡提供 SGLang／vLLM 部署方式 | 特定模型卡支持採用，不能延伸到整個 Qwen3 家族 |
| [GLM-5: from Vibe Coding to Agentic Engineering](https://arxiv.org/abs/2602.15763) | 2026 v1 | 一組共享參數做三個 MTP training steps；也加速 RL rollout | training steps 與實體 layer count 不同；rollout 速度不是 sample efficiency |
| [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://arxiv.org/abs/2606.19348) | 2026 v1；官方 release 2026-04-24 | Pro／Flash 保留 V3 的 MTP modules/objectives，depth=1 | 用作家族延續案例，不能因其他架構變動推論 MTP 本身新增機制 |
| [Nemotron 3 Ultra: Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Model for Agentic Reasoning](https://arxiv.org/abs/2606.15007) | 2026 v1 | 預訓練共享 MTP heads；MTP Boosting 凍結 backbone，以 forward-KL 對齊 head；serving 與 rollout | backbone supervision、head alignment 與 rollout 系統收益分列；跨模型總速度不是單獨 MTP 消融 |

這些案例最適合建立「**聯合訓練 → 主模型凍結後對齊候選 → 推論服務／RL rollout**」的階段圖。以 MiMo-7B 與 Nemotron 3 Ultra 為例，同一個系統的 MTP 可以在不同階段更新不同參數，因此文章不能只貼一個「有 MTP」標籤。DeepSeek-V3 的可移除模組則提供另一個重要觀察：訓練目的與部署選擇可以分開。([MiMo](https://arxiv.org/abs/2505.07608), [Nemotron 3 Ultra](https://arxiv.org/abs/2606.15007))

**公開資料未確認，不等於模型沒有使用。** 本輪不足以確認 GPT、Claude、Gemini 的原生 MTP 設計。原始 Kimi K2 可作對照：GLM-4.5 報告的架構表列其 MTP layer=0；這個版本資訊不能延伸到所有 Kimi 後續型號。R1／R1-Distill 也不能因 backbone 或 teacher 關係就自動列入原生採用名單。Nemotron 3 Super 尚待獨立核對原始報告；MiMo-V2.5 等近期型號未完整查核，暫不放入已驗證表。([GLM-4.5](https://arxiv.org/html/2508.06471v1), [Kimi K2 官方 repo](https://github.com/MoonshotAI/Kimi-K2))

- <content-link canonical="deepseek-v3-mtp">DeepSeek-V3：訓練與推論雙用途</content-link>
- <content-link canonical="mimo-7b-mtp">MiMo-7B：聯合預訓練與 head 微調</content-link>
- <content-link canonical="glm-4-5-mtp">GLM-4.5：原生 MTP layer</content-link>
- <content-link canonical="qwen3-next-mtp">Qwen3-Next：多步訓練與推論對齊</content-link>
- <content-link canonical="mimo-v2-flash-mtp">MiMo-V2-Flash：輕量候選與 rollout</content-link>
- <content-link canonical="qwen3-5-mtp">Qwen3.5：模型卡與部署入口</content-link>
- <content-link canonical="glm-5-mtp">GLM-5：共享參數的多步 MTP</content-link>
- <content-link canonical="deepseek-v4-mtp">DeepSeek-V4：MTP 契約的延續</content-link>
- <content-link canonical="nemotron-3-ultra-mtp">Nemotron 3 Ultra：MTP Boosting 與生成效率</content-link>

## 推論加速與驗證的深入筆記

這一組從候選設計延伸到解碼規則；驗證能保證什麼，是閱讀速度數據的前提。

- <content-link canonical="blockwise-parallel-decoding">Blockwise Parallel Decoding：多步猜測與前綴驗證</content-link>
- <content-link canonical="speculative-decoding-leviathan-2023">Speculative Decoding：保留目標採樣分布</content-link>
- <content-link canonical="medusa">Medusa：多預測頭與候選樹</content-link>
- <content-link canonical="hydra-decoding">Hydra：候選之間的序列依賴</content-link>
- <content-link canonical="p-eagle">P-EAGLE：平行 drafting 與可擴展訓練</content-link>
- <content-link canonical="bebop-mtp-rl-rollout">Bebop：拒絕採樣、TV loss 與 RL rollout 加速</content-link>

相關背景也可參考原始 [EAGLE](https://arxiv.org/abs/2401.15077) 與 [EAGLE-3](https://arxiv.org/abs/2503.01840)；不能把整個 EAGLE 家族一概等同於獨立 MTP heads。

## 生成式推薦的深入筆記

推薦領域另保留 token／item 語意、順序約束與產業證據；新近預印本與已報告部署的系統會分開標示。

**一件商品的多個編碼、同一情境中的多個興趣，以及時間上連續的未來商品，不能套用同一個 MTP 方程。** 第一種解決 Semantic ID 的表示與生成成本；第二種表達一次互動情境中的多種選擇；第三種以未來行為提供額外監督。這些目標都可能被作者稱為 MTP，但 loss、條件資訊與 serving 用法需要逐篇還原。([RPG](https://arxiv.org/abs/2506.05781), [GPR](https://arxiv.org/abs/2511.10138), [EchoRec](https://arxiv.org/abs/2608.14011))

| 模型／原始資料 | Token 或 target 的意義 | 使用方式與證據 |
| --- | --- | --- |
| [Generating Long Semantic IDs in Parallel for Recommendation（RPG）](https://arxiv.org/abs/2506.05781) | 同一商品無序 Semantic ID 的組件 | Hou et al.；KDD 2025。獨立預測各組件，圖約束避免無效 ID；有公開程式，未核對生產部署 |
| [GPR: Towards a Generative Pre-trained One-Model Paradigm for Large-Scale Advertising Recommendation](https://arxiv.org/abs/2511.10138) | 多個興趣方向對應的商品 SID 路徑 | Zhang et al.；2025 preprint，v3 2026。作者報告微信視頻號廣告全面部署；四 heads 詳細架構讀自 v1，不能假設所有細節於 v3 不變 |
| [PinRec: Outcome-Conditioned, Multi-Token Generative Retrieval for Industry-Scale Recommendation Systems](https://arxiv.org/abs/2504.10507v1) | 連續實值的 item representation／短視窗多個互動 | Badrinath et al.；2025 v1 的歷史 MTP 設計；Pinterest 產業實驗。最新 v7 改題與內容，不能把 v1 結論悄悄轉移到 v7 |
| [GReF: A Unified Generative Framework for Efficient Reranking via Ordered Multi-token Prediction](https://arxiv.org/abs/2510.25220) | 推薦 slate 中有順序的多個商品 | Lin et al.；CIKM 2025。Ordered MTP 與 Rerank-DPO；作者報告快手部署。任務是重排，不是開放商品庫檢索 |
| [EGA-V2: An End-to-end Generative Framework for Industrial Advertising](https://arxiv.org/abs/2505.17549) | 廣告／POI 編碼與創意圖像 token | Zheng et al.；2025 preprint。MTP 框架中的聯合解碼；已核對的是工業資料離線實驗，沒有已證實 production rollout |
| [UniSGR: Unified Framework for Semantic ID Generation and Ranking](https://arxiv.org/abs/2607.04068) | 多個同 session 商品，各有階層 SID | Sun et al.；2026 preprint。Value-aware PMTP；單商品內 causal、不同目標間互相不可見；作者報告 Lazada 首頁線上 A/B |
| [EchoRec: Multi-Item Prediction-Empowered Generative Recommendation via Cycle-Consistent Preference Alignment](https://arxiv.org/abs/2608.14011) | 時間上接續的未來商品 | Ma et al.；2026 preprint。順序 auxiliary branches 與偏好對齊；普通推論可丟棄輔助組件，未核對 production deployment |
| [Towards Generalizable and Efficient Large-Scale Generative Recommenders](https://arxiv.org/abs/2605.23312) | 帶時間衰減權重的未來高價值行為集合 | Qiuling Xu, Ko-Jen Hsiao, Moumita Bhattacharya；RecSys 2026，v2 2026-08-06；[DOI](https://doi.org/10.1145/3773078.3831905)。Netflix case study，以共享 decoding head 做 future-set objective；production-shadow evaluation 不等於 live A/B |

入口篇最適合先用 RPG 與 GPR 作對照：前者是單商品編碼平行化，後者是產業多興趣生成。EchoRec 可作訓練輔助未來商品監督的研究分支；UniSGR 提醒讀者，同 session 多目標不等於時間接續的多步預測。部署證據需保留「作者報告」措辭，並將離線測試、線上 A/B、shadow evaluation 與全面部署分開。GPR 的線上迭代同時加入 MTP 與其他方法，不能把組合收益當 MTP-only 消融；Netflix 的整體結果同樣混有模型規模與其他改動。([GPR](https://arxiv.org/html/2511.10138v1), [UniSGR](https://arxiv.org/abs/2607.04068), [Netflix case study](https://arxiv.org/abs/2605.23312))

TIGER、HSTU、OneRec／OneRec-V2、COBRA、ACERec 是重要背景與 baseline，**但本輪未驗證它們採用上述 MTP 目標**。例如 OneRec-V2 用多個 hierarchical SID token 並以 causal attention 訓練，這本身仍可以是一般 NTP；生成多 token 並不自動表示有 future-offset auxiliary heads。Knowledge-Geometry Decoupling 的 arXiv 記錄已撤稿，即使歷史摘要宣稱 Behavioral MTP 與產業部署，也不納入正面採用證據。([TIGER](https://arxiv.org/abs/2305.05065), [HSTU](https://arxiv.org/abs/2402.17152), [OneRec-V2](https://arxiv.org/html/2508.20900v1), [COBRA](https://arxiv.org/abs/2503.02453), [ACERec](https://arxiv.org/abs/2602.13573), [撤稿記錄](https://arxiv.org/abs/2608.02738))

- <content-link canonical="rpg-generative-recommendation">RPG：平行生成同一商品的長 Semantic ID</content-link>
- <content-link canonical="gpr-generative-recommendation">GPR：多興趣 MTP 與廣告生成</content-link>
- <content-link canonical="pinrec">PinRec：短視窗多商品生成與版本差異</content-link>
- <content-link canonical="echorec">EchoRec：未來商品監督與偏好對齊</content-link>
- <content-link canonical="unisgr">UniSGR：價值感知的平行多目標預測</content-link>
- <content-link canonical="gref-generative-recommendation">GReF：保留順序的多商品重排</content-link>
- <content-link canonical="ega-v2">EGA-V2：廣告與創意的生成框架</content-link>
- <content-link canonical="netflix-generative-recommenders-mtp">Netflix：未來行為集合與快取服務</content-link>

## 系列文獻地圖與閱讀指引

## 入口篇用機制鋪路，個別筆記保留可追溯資源

系列入口採取「NTP 的監督與生成依賴 → MTP 改變條件資訊 → 梯度如何影響共享表示 → 候選如何透過驗證節省工作 → 模型與推薦的方法地圖」的知識順序。這個順序先建立共同地基，再分出訓練與推論的兩條收益，不讓讀者在尚未理解 prefix 與中間 token 的差別前就進入多頭架構名詞。各方法推導、loss 配置、工程調參與失敗條件留在獨立筆記，入口文只講到足以定位角色。

每篇資源筆記的 References 應優先保留原始題目、作者、已核對 venue、版本與 abstract／publisher 頁面，再加官方模型卡、文章與作者程式。附註指出值得閱讀的 section 與證據邊界，比單列連結更能支持後續補稿。PinRec 特別需要固定 v1 的歷史設計；GPR 需區分最新版部署描述與 v1 架構細節。主張訓練「更有效」時，記錄同資料表現、sample efficiency、FLOPs、wall-clock；主張生成「更快」時，記錄 batch、硬體、輸入輸出長度、接受率／接受長度與驗證模式。([PinRec version history](https://arxiv.org/abs/2504.10507), [GPR version history](https://arxiv.org/abs/2511.10138))

本輪採取一手資料優先，因此技術文章以模型團隊官方說明為主，沒有為了填滿清單引入未核對的社群解讀。直接可用的工程資源包括 [DeepSeek-V3 官方 repo](https://github.com/deepseek-ai/DeepSeek-V3)、[MiMo-V2-Flash 官方 repo](https://github.com/XiaomiMiMo/MiMo-V2-Flash)、[Qwen3.5 官方文章](https://qwen.ai/blog?id=qwen3.5)、[Qwen3.5 模型卡](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)，以及 [RPG 作者程式](https://github.com/facebookresearch/RPG_KDD2025)。部署命令可以作使用入口，方法主張仍回到報告或論文核對。

## 後續寫作的判斷

這個系列的比較軸應從「哪篇更快」改成「哪一個瓶頸、在哪個階段、以什麼代價獲得改善」。共同骨架建立後，新的模型報告可以放入既有分類，而不需要每遇到一個 MTP 名詞就重寫整個入口；新的推薦方法也先確認 target unit，再決定它與語言模型方法共享多少機制。

資源蒐集已足以支持第一版入口與分篇閱讀路徑，但各筆記仍應保持 drafting。後續逐篇補稿時，最值得花力氣的是還原條件依賴與梯度契約，以及確認效果測量真正控制了哪些變因；這能讓系列成為可用的理解框架，而不只是一份按年份累積的 paper 清單。最後仍需作者全盤 proofread，才完成知識文章的驗收。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://proceedings.mlr.press/v235/gloeckle24a.html). *ICML 2024, Proceedings of Machine Learning Research*, 235.

    閱讀重點：§2 的 trunk／heads 與 loss；§3–5 的實驗／機制假說；Appendix C 的實測訓練成本。

2. Cai, T., et al. (2024). [Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://proceedings.mlr.press/v235/cai24b.html). *ICML 2024, Proceedings of Machine Learning Research*, 235.

    閱讀重點：Frozen／joint training、tree attention 與 typical acceptance；需區分評測品質與分布保證。

3. Stern, M., Shazeer, N., & Uszkoreit, J. (2018). [Blockwise Parallel Decoding for Deep Autoregressive Models](https://papers.nips.cc/paper/8212-blockwise-parallel-decoding-for-deep-autoregressive-models). *NeurIPS 2018*.

    閱讀重點：多步 proposal 與最長前綴驗證的早期方法；exact 指保留 greedy 結果，原始任務不是聊天 LLM。

4. Leviathan, Y., Kalman, M., & Matias, Y. (2023). [Fast Inference from Transformers via Speculative Decoding](https://proceedings.mlr.press/v202/leviathan23a.html). *ICML 2023, Proceedings of Machine Learning Research*, 202.

    閱讀重點：接受、拒絕與修正採樣如何保留 target distribution；draft model 不必使用 MTP。

5. DeepSeek-AI, et al. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). *Technical report; arXiv preprint*, v2 (2025).

    閱讀重點：§2.2 的 sequential MTP、§4.5.1 訓練消融與 §5.4.3 推論用途；固定 v2 作細節來源。

6. LLM-Core Xiaomi, et al. (2025). [MiMo: Unlocking the Reasoning Potential of Language Model -- From Pretraining to Posttraining](https://arxiv.org/abs/2505.07608). *Technical report; arXiv preprint*.

    閱讀重點：§2.2 的聯合預訓練與新增 head 微調分階段；本文細節核對 v1，abstract 入口可查版本紀錄。

7. Ankner, Z., et al. (2024). [Hydra: Sequentially-Dependent Draft Heads for Medusa Decoding](https://arxiv.org/abs/2402.05109). *COLM 2024*.

    閱讀重點：後續 head 條件依賴已提出 token 的設計；用來理解候選一致性與並行程度取捨。

8. Basharin, A., Chertkov, A., & Oseledets, I. (2024). [Faster Language Models with Better Multi-Token Prediction Using Tensor Decomposition](https://arxiv.org/abs/2410.17765). *arXiv preprint*.

    閱讀重點：Rank-r CP 機率分解與 joint prediction；表達能力增加不等於無成本加速。

9. Aynetdinov, A., & Akbik, A. (2025). [Pre-Training Curriculum for Multi-Token Prediction in Language Models](https://arxiv.org/abs/2505.22757). *ACL 2025*.

    閱讀重點：Forward／reverse curriculum 的小模型實驗；主模型品質與 self-speculative 收益可以分離。

10. Hou, Y., et al. (2025). [Generating Long Semantic IDs in Parallel for Recommendation](https://arxiv.org/abs/2506.05781). *KDD 2025*.

    閱讀重點：同一商品的無序長 SID、獨立組件 loss 與圖約束解碼；不是多個未來互動的預測。

11. Zhang, J., et al. (2025). [GPR: Towards a Generative Pre-trained One-Model Paradigm for Large-Scale Advertising Recommendation](https://arxiv.org/abs/2511.10138). *arXiv preprint*, v3 (2026).

    閱讀重點：最新摘要確認 MTP 與作者報告部署；多興趣 heads 架構讀自 v1 §3.1，不將組合線上收益歸因 MTP 單一因素。

其餘模型與方法的完整書目、官方文章、版本與程式入口收在各自資源筆記，以免入口篇變成重複的文獻清單。

### 技術文章（Technical Articles）

1. [Qwen: Qwen3-Next: Towards Ultimate Training & Inference Efficiency](https://qwen.ai/blog?id=qwen3-next).

### 開源專案與代碼（Open Source Code）

1. **[DeepSeek-V3 / GitHub](https://github.com/deepseek-ai/DeepSeek-V3)**.
2. **[RPG_KDD2025 / GitHub](https://github.com/facebookresearch/RPG_KDD2025)**.

<reviewkit>
<takeaways>
- NTP 對訓練序列各位置提供監督；訓練平行不代表生成已經沒有序列依賴。
- MTP 增加未來位置的預測任務；是否改善主模型，要看 loss 是否更新 backbone 與實驗結果。
- 資料效率、計算成本與 GPU 時間必須分開衡量；額外監督不是免費的。
- 多 token 候選需要適當驗證；接受長度與總成本共同決定是否加速。
- 保留 greedy 結果、保留採樣分布與維持評測品質，是不同保證。
- 生成式推薦中的 token 可能代表商品編碼或商品本身；比較前先確認預測單位。
</takeaways>
<qprompt/>
</reviewkit>
