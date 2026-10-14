<meta>
Title: LLM Rollout 系統地圖：veRL、Resharding、SGLang 與 Ray
Summary: 從「產生回答後更新模型」的一次循環出發，理解 veRL 3D-HybridEngine 的權重重分片、SGLang DSL 與 RadixAttention，以及 Ray 的分散式協調角色。
Slug: llm-rollout-systems-verl-sglang-ray-zh-tw
Output: notes/llm-rollout-systems-verl-sglang-ray/llm-rollout-systems-verl-sglang-ray-zh-tw.html
CanonicalId: llm-rollout-systems-verl-sglang-ray
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: llm systems, verl, sglang, radixattention, ray, kv cache
Status: drafting
LastModified: 2026-10-11
</meta>

# LLM Rollout 系統地圖：veRL、Resharding、SGLang 與 Ray

LLM 的線上強化學習要反覆做兩件事：**用目前策略產生回答（rollout），再根據回答更新模型（training）**。兩個階段使用同一組策略權重，但對 GPU 的需求不同。生成階段關心同時處理多少 prompt 和 KV cache；訓練階段還要放梯度、optimizer state，並執行反向傳播。這個差異是理解下列系統名詞的共同起點。

## veRL 3D-HybridEngine：切換的是權重布局

「3D」指 pipeline、tensor、data 三種平行維度（PP／TP／DP）。訓練時可能讓四張 GPU 各存模型的一部分，一起訓練；生成時則可能改為每兩張 GPU 組成一份可推論的模型，形成兩組同時服務不同 prompt。**Resharding** 是從訓練布局轉成生成布局、再轉回來時，把權重重新分配到各張 GPU；模型的數值與任務沒有因此改變。

為減少切換成本，HybridFlow 論文安排生成階段的 GPU 分組，使每張 GPU 盡量沿用原本訓練時已有的權重塊，只交換缺少的部分。論文所稱的「zero memory redundancy」是指**因訓練／生成布局切換而多保留的權重冗餘**，不是整個訓練過程不需要重複權重，更不是 KV cache、梯度或 optimizer state 都不佔記憶體。重新分片仍需要通訊。veRL 現有文件也列出 FSDP 與 vLLM 之間的權重轉換管理。

## SGLang：生成流程的描述與執行

SGLang 原論文把系統分成兩層：前端 DSL（domain-specific language，特定領域語言）描述多次模型呼叫、選擇與分支；後端 runtime 真正執行生成。DSL 的 `gen`、`select`、`fork` 等概念讓「先生成，再依結果分支，最後彙整」變得易寫。**DSL 是編排語意，不是 GPU kernel，也不是 veRL 的重分片機制。** 實際 API 隨專案版本可能演進，這裡描述的是原論文的設計。

生成時，不同請求可能有完全相同的前綴，例如共用 system prompt，或一段對話歷史後分成兩條回覆。相同 token 前綴的 KV cache 可以重用。SGLang 的 **RadixAttention** 用 radix tree 對前綴與 KV cache 建立索引，配合淘汰及排程政策，減少前綴重算。這是**精確前綴重用**；兩個 prompt 語意相似但 token 不同，不能因此直接共用 cache。它也不改變 attention 的數學定義。

## Ray：讓工作在多個 worker 上跑

Ray 提供分散式 task、actor、資源排程等基礎能力。veRL 可透過 Ray worker 協調 actor、rollout 等工作在不同程序或機器上執行。Ray 知道「這個工作需要哪些資源、要在哪裡運行」，但**具體如何分片權重是 veRL／訓練與推論後端的邏輯；如何管理 KV cache 是推論引擎的邏輯**。

## 一次循環怎麼串起來？

1. Ray 協調分散式 worker；veRL 安排訓練與生成階段的工作。
2. 若採用共置的 HybridEngine，veRL 在生成前把 actor 權重轉成適合推論的布局。
3. 推論引擎產生回答；若選用 SGLang，其 RadixAttention 可在前綴命中時重用 KV cache。應用程式也可能使用 DSL 描述多輪或分支生成流程。
4. veRL 收集回答與獎勵，把權重轉回訓練所需布局，再更新 actor。

這是**可以組合的一個例子**：veRL 也可搭配其他 rollout 後端；使用 SGLang runtime 不代表一定要寫它的 DSL，使用 Ray 也不代表一定有 RadixAttention。

## 複習時自問

1. Resharding 轉移的是權重還是模型學到的知識？
2. RadixAttention 何時能重用 cache？語意相似是否足夠？
3. Ray 與 veRL 各自負責哪一層？

## References

- [HybridFlow：3D-HybridEngine 與 resharding](https://arxiv.org/html/2409.19256)
- [veRL：Engine Workers](https://verl.readthedocs.io/en/latest/workers/engine_workers.html)
- [veRL：FSDP Backend 與 sharding manager](https://verl-doc.readthedocs.io/en/latest/workers/fsdp_workers.html)
- [SGLang：DSL 與 RadixAttention 原論文](https://arxiv.org/html/2312.07104)
- [Ray：Core Concepts](https://docs.ray.io/en/latest/ray-core/key-concepts.html)

<reviewkit>
<takeaways>
- veRL 的 resharding 調整訓練與生成階段間的權重布局；「零冗餘」有明確的切換成本範圍。
- SGLang 原論文的 DSL 描述多次生成流程；RadixAttention 重用精確共享前綴的 KV cache。
- Ray 管分散式工作與資源協調，權重重分片與 KV cache 政策由上層系統實作。
</takeaways>
<qprompt/>
</reviewkit>
