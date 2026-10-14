<meta>
Title: GRPO、Dr. GRPO、GSPO、ARPO：四個改動各在解什麼問題
Summary: 以採樣、loss 權重、重要性比率與工具互動四條差異軸，對照 GRPO、Dr. GRPO、GSPO、ARPO 的核心機制與證據邊界。
Slug: llm-policy-optimization-comparison-zh-tw
Output: notes/llm-policy-optimization-comparison/llm-policy-optimization-comparison-zh-tw.html
CanonicalId: llm-policy-optimization-comparison
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: reinforcement learning, grpo, dr-grpo, gspo, arpo, rlhf
Status: drafting
LastModified: 2026-10-11
</meta>

# GRPO、Dr. GRPO、GSPO、ARPO：四個改動各在解什麼問題

先固定基本場景：同一題讓舊策略生成 $G$ 個回答，逐個取得獎勵，再用相對優勢更新模型。從這裡開始，至少有三個可分開修改的環節：**在哪裡多採樣、各 token 的梯度給多大權重、舊／新策略的機率比率在哪個尺度計算**。四個名稱的差異主要落在這些位置，而非四套完全無關的訓練流程。

## 先畫出差異地圖

| 方法 | 主要改動 | 想處理的問題 |
| --- | --- | --- |
| GRPO | 同題多回答，以組內獎勵建優勢；常以 token 級重要性比率與 clipping 更新。 | 不另訓一個 value model。 |
| Dr. GRPO | 移除每個回答自己的長度除數，以及組內獎勵標準差除數。 | 避免特定 loss 寫法引入長度及題目難度相關的額外權重。 |
| GSPO | 用整段回答的平均 log 機率差形成序列級比率，按整段回答 clipping。 | 降低 token 級比率的波動，尤其關注長序列及 MoE 訓練。 |
| ARPO | 在工具回饋後的高熵步驟增加局部分支，並處理共享路徑的優勢歸因。 | 固定預算下，更有效探索多輪工具使用。 |

表中的 GRPO 只做定位；詳細基線可讀 <content-link canonical="grpo-group-relative-policy-optimization">GRPO 專篇</content-link>。

## Dr. GRPO：長度除數究竟改了什麼？

原本若每個回答各自平均 token loss，形式是 $\frac1G\sum_i\frac1{L_i}\sum_t\ell_{i,t}$。同一回答越長，每個 token 的係數越小；於是**不同回答的 token 收到不同權重**。Dr. GRPO 原論文改用訓練期間固定的生成長度預算 $C$ 作共同分母：

$$\frac{1}{GC}\sum_{i=1}^{G}\sum_{t=1}^{L_i}\ell_{i,t}.$$

它不再讓同一組裡的短回答 token 因自己的 $1/L_i$ 而得到較大係數。你之前指出「共用分母本質上只是常數」是對的：**固定 $C$ 的具體數值主要設定整體梯度尺度；真正改變組內相對權重的是移除每篇各自的 $1/L_i$**。論文也說可選其他固定常數，配合學習率與 batch 尺度處理；不能把它說成唯一合理的 normalization。

若改用組內平均長度 $\bar L=\sum_iL_i/G$ 當分母，則 $1/(G\bar L)=1/\sum_iL_i$，也就是全組有效 token 的平均。這在**同一組內**仍讓每個 token 權重相同，但 $\bar L$ 會隨組別改變，因此不完全等同原論文用固定 $C$ 的 Dr. GRPO。若某個寫法出現 $\bar L/(\sum_iL_i)$，你算得對，它就精確等於 $1/G$；那個長度因子已在代數上抵銷。

另一項改動是優勢中不再除以該題組內的獎勵標準差：$A_i=R_i-\bar R$。因為不同題的獎勵標準差不同，除以它也會改變題目之間的相對權重。這些是對特定 GRPO loss 的批判，不表示「模型變長一定全由 GRPO 造成」。

## GSPO：為什麼改成整段回答的比率？

若第 $t$ 個 token 的新舊策略比率是 $r_{i,t}$，GSPO 對回答 $i$ 使用

$$s_i=\exp\!\left(\frac1{L_i}\sum_{t=1}^{L_i}\log r_{i,t}\right).$$

這是逐 token 比率的**幾何平均**，再對整段回答做 clipping。長度除數在這裡是為了把比率放在可比較的數值尺度，與上節 loss 裡「每篇回答除以自身長度」的權重問題並非同一件事。

論文觀察到 GSPO 被 clip 的 token 比例比 GRPO 高約兩個數量級，**這個數字本身不代表越高越好**。作者的證據是：在該實驗配置下，即使排除更多更新，GSPO 的訓練表現仍較好；這支持「留下的序列級訊號可能更可靠」的解讀，卻不能單靠 clipping 比例證明泛化或 OOD 表現。序列平均也較能容忍單一 token 的機率估計波動，但不是對所有 rollout／training 精度差異都免疫。

## ARPO：固定預算要在哪裡分叉？

一般 GRPO 會從題目起點獨立採多條完整軌跡。ARPO 先保留一部分**全局採樣**，再把一部分 rollout 預算留給工具回饋後的局部續寫。若回饋後前幾個 token 的熵變高，就從那個共享前綴分出多條後續路徑；分支名額用完便停止局部擴展。這仍需要為各條最終軌跡打分與更新策略，改動重點在採樣配置與共享前綴的歸因。

共享前綴只有一條實際歷史，卻可能出現在多個分支樣本中。Hard 版本明確平均其優勢；Soft 版本保留 GRPO 形式，使相同前綴 token 的機率比率相同，讓多條軌跡的優勢在該位置合成訊號。這不等於「模型看見高熵就自動學得更好」：仍要檢查工具成本、分支品質與獎勵設計。

## 複習時自問

1. $1/L_i$ 與 $1/\bar L$ 在同一組回答中改變了什麼相對權重？
2. GSPO 的序列級 clipping 何以可能比 token 級 clipping 穩定？「clip 更多」本身能證明什麼？
3. ARPO 的全局採樣與局部分支共用哪部分計算、消耗哪部分預算？

## References

- [DeepSeekMath：提出 GRPO](https://arxiv.org/abs/2402.03300)
- [Understanding R1-Zero-Like Training：Dr. GRPO](https://arxiv.org/abs/2503.20783)
- [Group Sequence Policy Optimization](https://arxiv.org/abs/2507.18071)
- [Agentic Reinforced Policy Optimization](https://arxiv.org/abs/2507.19849)

<reviewkit>
<takeaways>
- Dr. GRPO 改的是梯度加權方式；GSPO 改重要性比率與 clipping 的單位；ARPO 改工具互動時的採樣位置與歸因。
- 共用長度分母主要設定尺度；去掉各回答自己的長度分母才會消除組內那種相對權重差異。
- GSPO clip 更多是論文中的觀察；是否有益要連同學習表現與泛化測試一起判斷。
</takeaways>
<qprompt/>
</reviewkit>
