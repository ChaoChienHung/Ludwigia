<meta>
Title: Pairwise 與 Listwise Ranking：錯序發生在哪裡，重要嗎？
Summary: 從同一組候選的交換例子出發，區分 pairwise 的局部順序學習與 listwise 的整體列表目標，並用 RankNet、ListNet、LambdaRank 說明方法名稱與實際優化訊號之間的差異。
Tags: Recommender Systems, Ranking, Machine Learning, Information Retrieval
CanonicalId: pairwise-vs-listwise-ranking
Slug: pairwise-vs-listwise-ranking-zh-tw
Output: writing/pairwise-vs-listwise-ranking/pairwise-vs-listwise-ranking-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: true
Status: published
Published: 2026-11-27
LastModified: 2026-11-27
</meta>
<draft>
- TLDR：pairwise 提供誰應排在誰前面的局部約束；listwise 關心這些錯序在完整列表與評估指標中造成多大損失。兩者不是絕對分離，LambdaRank 用 pair 梯度承載列表指標的敏感度。
- NarrativeArc：候選列表例子 → pairwise 目標 → listwise 目標 → LambdaRank 橋接 → 實作與評估邊界。
- Scope：Learning to Rank 的訓練目標與列表指標。

- 引子｜同樣一個錯序，代價可能不同：用頂端與尾端交換的例子讓讀者先感受列表位置的影響。
    - 開頭：用列表頂端與尾端各錯序一次的對比建立問題。
    - 啟後：成對損失如何看待列表不同位置的錯誤？

- Pairwise｜把排序拆成相對偏好：用 RankNet 的分數差解釋成對目標，同時說明等權 pair 難以直接表達列表頂端的損失。
    - 承先：開頭的交換例子說明 pairwise 的用處與不足。
    - 啟後：把整張列表當學習單位會改變什麼？

- Listwise｜讓列表成為學習單位：用 ListNet 的列表分布說明候選如何相互影響，並提醒代理目標不等於 NDCG 本身。
    - 承先：成對打分引出候選彼此影響的列表視角。
    - 啟後：成對更新能否感知它對列表指標的影響？

- 交換與 LambdaRank｜讓 pair 感知列表位置：用 $|\Delta\mathrm{DCG}|$ 的交換式連結相關度差和位置折扣，再說明 LambdaRank 如何依指標變化調整成對梯度。
    - 承先：列表視角提示可用位置敏感的變化量調整 pair。
    - 證據：交換兩個位置帶來的 $|\Delta\mathrm{DCG}|$，把相關度差與位置折扣放進同一個例子。
    - 啟後：如何公平比較這些目標？

- 收束｜先定義同一張列表：固定 query、候選、標註與 top-$k$，並檢查曝光偏差；方法名稱不能取代評估設計。
    - 承先：不同目標需要相同 query、候選集合與評估條件。
    - 結尾：回到同一張列表與同一套評估條件，避免只按方法名稱比較。
</draft>

# Pairwise 與 Listwise Ranking：錯序發生在哪裡，重要嗎？

假設搜尋結果有三個候選：非常相關的 A、尚可的 B、無關的 C。排序模型把 A 和 B 顛倒，與把 B 和 C 顛倒，都是「一對商品順序錯了」。但讀者或使用者看到的影響不一定相同：頂端的交換通常更醒目，而不同相關度的差距也不同。

這就是 pairwise 與 listwise 的關鍵差異。**Pairwise 先問「這一對誰應該在前？」；listwise 把候選放回整張列表，問「整體排序因此差了多少？」** 差異不在輸入是不是兩件商品，而在訓練訊號是否考慮列表的位置、其他候選與最終指標。

## Pairwise：把排序拆成相對偏好

令 $s_i$ 是模型給候選 $i$ 的分數。如果 A 的相關度高於 B，我們希望 $s_A>s_B$。RankNet 以分數差 $s_A-s_B$ 建立偏好機率，再用成對的交叉熵訓練。[RankNet 原論文](https://www.microsoft.com/en-us/research/wp-content/uploads/2005/08/icml_ranking.pdf)

這個設計很直觀：無需替每個候選定義有意義的絕對分數，只要知道相對順序。把許多 pair 的梯度加總，模型最後仍輸出每件商品的單一分數，供整張列表排序。問題是，若每一對使用相同權重，模型只知道「A 應在 B 前」，不知道這次錯序是在列表最上方還是末端，也不知道交換後對業務或搜尋指標的傷害有多大。

Pairwise 不是只看一對就忘記其餘候選。訓練時一個 query 或請求可提供許多 pair；共享的打分函數也讓它們互相影響。它的**基本損失單位**仍是相對順序，所以「整體列表品質」通常要靠 pair 的選取與權重間接表達。

## Listwise：把整張列表當成學習單位

Listwise 方法直接把同一個 query 下的候選集合與其排序當成訓練單位。ListNet 例如從標註相關度與模型分數各建立一個列表上的機率分布，讓預測分布靠近標註分布；常用的 top-one 形式比較「每個候選排第一」的機率。[ListNet 原論文](https://www.cs.nccu.edu.tw/~mftsai/papers/icml2007_tsai.pdf)

這讓候選彼此成為同一個正規化空間的一部分。提高 A 的相對機率，會改變 B、C 的相對份額；而單獨訓練 A 對 B 的 pair 時，C 不會直接出現在該項損失裡。不過「listwise」也不是魔法標籤：ListNet 的 top-one 代理目標，與 NDCG 這類實際評估指標並不完全相同。選哪種列表分布、在哪個截斷位置計算品質，仍會影響學到的偏好。

## 一個交換例子：錯在頂端還是尾端

以 DCG 為例，每個位置有折扣 $d_r$，每個候選有相關性收益 $g_i$。在位置 $r$ 和 $t$ 交換 $i$、$j$，指標變化的絕對值是：

$$|\Delta\mathrm{DCG}_{ij}|=|(g_i-g_j)(d_r-d_t)|.$$

於是，同樣是把高相關候選排到低相關候選後面，若交換發生在折扣差距較大的位置，傷害就更大；相關性差距越大也一樣。NDCG 再依該 query 的理想 DCG 正規化。這個簡單式子把「pair 的偏好」與「列表的位置」接在一起：**不是所有正確的 pair 都同樣值得花力氣修正。**

## LambdaRank：用 pair 承載列表指標的敏感度

NDCG 對排序位置很敏感，但直接對離散名次微分並不方便。LambdaRank 的做法是仍從 pair 產生更新方向，卻依交換這一對後的指標變化調整梯度大小。若一對候選交換會顯著改變 NDCG，它的更新權重就更高。[LambdaRank 原論文](https://papers.neurips.cc/paper_files/paper/2006/file/af44c4c56f385c43f2529f9b1b018f6a-Paper.pdf)

這提醒我們，**pairwise 與 listwise 不是互斥的模型標籤**。LambdaRank 的計算仍沿著 pair 進行，但監督強度來自整張列表的排序指標。精確說法是「具有列表指標感知的成對更新」，而不是把它簡單歸為純粹的 listwise loss。它改善的是訓練訊號與指標的對齊程度；不保證任何資料集上都勝過所有其他方法。

## 選方法前，先定義列表邊界

在搜尋中，一張列表通常屬於同一個 query；在推薦中，可能是一個使用者的一次請求。跨 query 隨意組 pair，往往沒有共同的曝光情境，也不對應同一張可比較的列表。比較方法時，應固定候選集、標註口徑、負樣本來源和評估的 top-$k$；否則效果差異可能來自資料，而不是損失函數。

還有一個共同限制：點擊與購買資料受曝光位置影響。把「被點到」直接當作天生較相關，pairwise 和 listwise 都可能學到原有排序器的曝光偏差。列表感知只回答**如何使用已給定的偏好訊號**，不自動保證訊號無偏。

所以我會這樣記住三者：**RankNet 學 pair 的相對順序；ListNet 比較同一列表上的分布；LambdaRank 仍更新 pair，但讓列表指標決定哪些錯序更值得修。** 真正的選擇依據，是你要優化的列表品質、可取得的標註，以及線上服務願意承擔的計算成本。

## 參考資料

- [Burges et al., Learning to Rank using Gradient Descent（RankNet）](https://www.microsoft.com/en-us/research/wp-content/uploads/2005/08/icml_ranking.pdf)
- [Cao et al., Learning to Rank: From Pairwise Approach to Listwise Approach（ListNet）](https://www.cs.nccu.edu.tw/~mftsai/papers/icml2007_tsai.pdf)
- [Burges et al., Learning to Rank with Nonsmooth Cost Functions（LambdaRank）](https://papers.neurips.cc/paper_files/paper/2006/file/af44c4c56f385c43f2529f9b1b018f6a-Paper.pdf)
