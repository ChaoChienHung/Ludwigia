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
LastModified: 2026-10-06
EstimatedReadingTime: true
</meta>

<draft>
- 定位：系列入口，先建立問題、機制與方法地圖；各方法推導與工程細節留在獨立筆記。
- 待作者 proofread：確認例子、術語與範圍；深入筆記目前以 References 資源蒐集為主。
- 證據邊界：資料核對至 2026-10-06；不把作者機制假說當定理，不把不同硬體的速度數字當排名。
</draft>

# Multi-Token Prediction：從更好的訓練到更快的生成

語言模型通常接著已有文字，預測下一個 token。既然最後需要生成整段回答，能不能讓模型在同一個位置多看幾步，同時為接下來的 token 做準備？Multi-Token Prediction（MTP，多 token 預測）就是圍繞這個問題的一族設計。

它有兩條值得分開理解的用途：**訓練時，以額外預測任務監督主模型；推論時，以便宜的多 token 候選減少昂貴的生成步驟。** 兩者可以共存，也可以只採其一。本文先建立共同直覺，再接到論文、模型與生成式推薦的深入筆記。

## 先分清楚：訓練看得到答案，生成還沒有答案

假設一段文字被切成 `A B C D`。Next-Token Prediction（NTP）會讓模型看 `A` 預測 `B`、看 `A B` 預測 `C`，再看 `A B C` 預測 `D`。因此，一段訓練序列的許多位置都會提供監督，並不是整段文章只有一個答案。

訓練時，正確的 `B C D` 已經存在。模型可以一次讀入序列，透過 causal attention mask 讓每個位置只使用當前及之前的資訊，再平行計算各位置的預測與 loss。生成時則不同：模型還不知道自己會選哪個 `B`，必須先產生它，才能把它放入 context 決定 `C`。**訓練中的平行計算，與生成時的序列依賴，是兩件事。** [Gloeckle et al., 2024](https://proceedings.mlr.press/v235/gloeckle24a.html)

這個差別同時帶出兩個問題：同一個 prefix 能否提供更豐富的學習訊號？推論時又能否預先猜一小段，減少主模型反覆執行？MTP 的兩條用途由此展開。

## 多預測幾步，究竟增加了什麼？

先看一個最容易理解的版本：共享 backbone 產生 `A` 的表示，再交給不同預測頭。第一個 head 預測 `B`，第二個 head 預測 `C`，第三個 head 預測 `D`。與 NTP 相比，預測 `C` 的第二個 head 此時尚未看到正確的 `B`，必須從更早的資訊估計較遠的未來。

這個**獨立預測頭版本**可簡化寫成：

$$
\mathcal{L}_{\mathrm{NTP}}=-\sum_t\log p(x_{t+1}\mid x_{\leq t}),
$$

$$
\mathcal{L}_{\mathrm{MTP}}=-\sum_t\sum_{k=1}^{K}\lambda_k\log q_k(x_{t+k}\mid x_{\leq t}).
$$

其中 $k$ 是預測距離，$\lambda_k$ 控制各任務權重。共同訓練時，各 head 的誤差會透過共享表示回傳到 backbone；因此，改變的不只有輸出數量，也包括主模型受到的學習壓力。[Gloeckle et al., 2024, §2](https://arxiv.org/html/2404.19737v1)

但這不是所有 MTP 的通式。有些設計讓後續預測依賴中間 token 或前一個模組，有些研究直接建模多 token 的聯合分布。獨立 heads 各自猜到機率最高的 token，也不代表拼起來就是一致的延續。比較方法前，必須先問：**每一步究竟看到了哪些資訊？** [Hydra](https://arxiv.org/abs/2402.05109)；[Tensor decomposition MTP](https://arxiv.org/abs/2410.17765)

## 為什麼可能讓主模型學得更好？

只要求預測下一步時，一些局部線索就足以降低 loss；要求同一表示支援更遠的預測，則增加了保留相關結構的壓力。例如程式中某個分支選擇會影響後續多個 token，未來位置的監督可能讓這個選擇得到更多學習訊號。

這是合理的機制解釋，但不能直接跳成「模型學會規劃」。Gloeckle 等人把部分原因討論明確列為推測，並以程式生成與合成任務實驗檢查效果；自然語言任務並非全面改善。**機制假說說明我們為何期待有效，實驗才說明在哪些條件下觀察到有效。** [Gloeckle et al., 2024, §3–5](https://arxiv.org/html/2404.19737v1)

另一個必要區分是梯度流向。如果 backbone 凍結，只訓練新 heads，改善的是候選生成能力；不能據此宣稱主模型被訓練得更好。Medusa-1 與 Medusa-2 分別展示 frozen-backbone 與 joint-training 路線。[Cai et al., 2024](https://proceedings.mlr.press/v235/cai24b.html)

所以「提升訓練效率」至少要拆成同資料量的表現、達到同表現所需的 token 數，以及 FLOPs／實際 GPU 時間。額外任務會增加成本；資料利用更好，不代表訓練時間自動更短。2024 MTP 論文的實測訓練時間仍高於其 NTP baseline，幅度也隨模型規模而異；作者將部分成本歸因於 FSDP 通訊與計算重疊的實作，因此不能把它當成所有 MTP 實作的固定代價。[Gloeckle et al., 2024, Appendix C](https://arxiv.org/html/2404.19737v1)

## 多 token 候選，如何變成更快的生成？

現在回到推論：如果便宜的 heads 能先提出 `B C D`，主模型可以一次對這段候選進行評估。驗證器依所選規則決定可接受的前綴；錯誤位置之後的候選不能直接沿用，需要修正並重新提出候選。減少的，是主模型必須依序執行的解碼輪次；總 FLOPs 未必減少。[Stern et al., 2018](https://papers.nips.cc/paper/8212-blockwise-parallel-decoding-for-deep-autoregressive-models)

速度直覺可用一個粗略成本式理解：

$$
\text{每個輸出 token 的時間}\approx
\frac{\text{候選生成成本}+\text{驗證成本}}{\text{每輪平均實際輸出的 token 數}}.
$$

候選越多，不一定越快；還要看接受前綴是否夠長、驗證是否昂貴，以及批次與硬體能否有效利用平行計算。這個式子只是教學近似，完整系統還有排程、記憶體與 kernel 開銷。

這裡也能看清 MTP 與 speculative decoding 的關係：前者描述多步預測的模型或訓練設計，後者描述「提出候選、驗證與接受」的解碼程序。Speculative decoding 可以使用獨立小模型作為 drafter，不必採用 MTP；MTP 也可以只在訓練中使用。[Leviathan et al., 2023](https://proceedings.mlr.press/v202/leviathan23a.html)

最後，**保留 greedy 結果、保留採樣分布、維持評測品質，是三種不同保證。** Exact speculative sampling 需要對應的接受與修正採樣規則；Medusa 的 typical acceptance 則允許改變原始採樣分布。閱讀「品質不下降」的加速報告時，不能自動補上分布完全相同的結論。[Leviathan et al., 2023](https://proceedings.mlr.press/v202/leviathan23a.html)；[Medusa, §2.3](https://arxiv.org/html/2401.10774v3)

## 用代表案例定位方法，而不是把所有模型混成一種

| 代表案例 | 最適合理解的問題 | 閱讀時的關鍵區分 |
| --- | --- | --- |
| Gloeckle 等人的 MTP | 多未來位置監督如何影響共享表示 | 預訓練目標與推論用途分開衡量 |
| DeepSeek-V3 | 原生 MTP 如何兼顧訓練與推論 | 輔助模組可在推論移除，保留主模型收益 |
| Medusa | 既有模型如何增加多步候選能力 | 凍結／共同訓練，以及驗證契約 |
| MiMo-7B | 不同訓練階段能否優化不同對象 | 聯合預訓練與後續 head-only fitting |
| Qwen3-Next、GLM-5 | 多步訓練如何對齊實際候選生成 | 官方採用描述不等於獨立訓練消融 |

DeepSeek-V3 是雙用途的清楚案例：MTP auxiliary objective 參與主模型訓練；推論時可移除，也可用於 speculative decoding。MiMo-7B 則把聯合預訓練與凍結主模型後的額外 head 訓練分成階段。[DeepSeek-V3, §2.2](https://arxiv.org/html/2412.19437v2)；[MiMo, §2.2](https://arxiv.org/html/2505.07608v1)

近年的 Qwen3-Next 與 GLM-5 也明確使用 MTP／多步訓練。這些資料適合追蹤工程方向，但整個模型同時改變的架構、資料與訓練流程很多，不能把總體性能提升全部歸因給 MTP。加速 RL rollout 又是另一種訓練效率：更快生成訓練樣本，不等於學到同能力所需資料更少。[Qwen 官方文章](https://qwen.ai/blog?id=qwen3-next)；[GLM-5](https://arxiv.org/abs/2602.15763)

## 生成式推薦：先問 token 代表什麼

在推薦系統中，多 token 可能是同一件商品的多個編碼，也可能代表多個商品或未來互動。理解這個差異，可以先讀 <content-link canonical="semantic-id-in-generative-recommendation">Semantic ID：生成式推薦如何表示商品</content-link>。

RPG 把一個商品表示為無序的長 Semantic ID，平行預測其各個組件，並用圖約束解碼避免無效 ID。它解決的是同一商品的編碼生成，不是預測使用者接下來多次互動，也不等同於 LLM 的 draft-and-verify。[Hou et al., 2025](https://arxiv.org/abs/2506.05781)

GPR 則以 MTP 表達多個興趣方向，再接價值對齊與策略優化；作者報告已部署於騰訊微信視頻號廣告系統。這是產業採用案例，但整體業務收益不能單獨歸因給 MTP。EchoRec 的研究方向又不同：以未來多個商品的監督輔助主模型。**推薦領域的「多」究竟指編碼組件、並存興趣，還是時間上連續的商品，必須逐篇確認。** [Zhang et al., 2025](https://arxiv.org/abs/2511.10138)；[EchoRec](https://arxiv.org/abs/2608.14011)

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

相關背景也可參考原始 [EAGLE](https://arxiv.org/abs/2401.15077) 與 [EAGLE-3](https://arxiv.org/abs/2503.01840)；不能把整個 EAGLE 家族一概等同於獨立 MTP heads。

## 生成式推薦的深入筆記

推薦領域另保留 token／item 語意、順序約束與產業證據；新近預印本與已報告部署的系統會分開標示。

- <content-link canonical="rpg-generative-recommendation">RPG：平行生成同一商品的長 Semantic ID</content-link>
- <content-link canonical="gpr-generative-recommendation">GPR：多興趣 MTP 與廣告生成</content-link>
- <content-link canonical="pinrec">PinRec：短視窗多商品生成與版本差異</content-link>
- <content-link canonical="echorec">EchoRec：未來商品監督與偏好對齊</content-link>
- <content-link canonical="unisgr">UniSGR：價值感知的平行多目標預測</content-link>
- <content-link canonical="gref-generative-recommendation">GReF：保留順序的多商品重排</content-link>
- <content-link canonical="ega-v2">EGA-V2：廣告與創意的生成框架</content-link>
- <content-link canonical="netflix-generative-recommenders-mtp">Netflix：未來行為集合與快取服務</content-link>

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
