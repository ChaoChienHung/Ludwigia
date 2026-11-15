# Streaming Submodular Maximization Survey — 課堂要求與寫作計劃

> 本文件是課程作業的工作規劃。下方「課堂要求」整理自課程提供的 project 說明；「我們的計劃」是目前的寫作決策，可以隨閱讀與討論調整。正式論文草稿在 [`main.tex`](main.tex)，參考文獻資料在 [`references.bib`](references.bib)。

## 一、課堂要求（course requirements）

- **作業形式：**選一個與課程相關的主題，寫一篇 survey。可以參考 [sublinear.info](http://sublinear.info/) 的題目，也可以自行選擇相關主題。
- **分組：**每組最多 4 人。
- **篇幅：**約 10 頁，包含以下內容：
    1. 主題引言、問題的正式定義及背景。
    2. 目前已建立的結果：寫出正式結果，並說明證明的高層想法。
    3. 選一個認為最重要的結果，用自己的文字寫完整證明，或技術部分的 proof sketch。
    4. 潛在後續方向：此主題未來可以往哪裡走；若自己要研究，會嘗試什麼。
- **課程時間線：**
    - October 11（Week 8）：組隊。
    - October 25（Week 10）：選定主題及論文。
    - **November 15（Week 13）：完成 survey。逾期每天扣 2 分。**

上述四項內容及日期是課程要求；下方的主題、篇幅比例和研究方向是我們的規劃，並非教授公布的評分規準。

## 二、我們的主題與研究範圍

**Survey 題目：**Streaming Submodular Maximization under a Cardinality Constraint。

**核心問題：**元素以任意順序逐一到達，只能掃描一次、記憶體有限，且最多選出 $k$ 個元素。若目標函數 $f$ 為 monotone submodular，能在保證解的品質下，用多少記憶體及每筆更新成本完成選取？

**詳述論文：**Badanidiyuru et al., *Streaming Submodular Maximization: Massive Data Summarization on the Fly*（KDD 2014）。主要深入分析 Sieve-Streaming 的 threshold rule、$(1/2-\varepsilon)$ approximation、平行 OPT guesses，以及 lazy initialization 如何讓整個演算法維持 one-pass。

**比較文獻：**

1. Nemhauser, Wolsey, and Fisher（1978）：offline greedy 的 $1-1/e$ 基準。
2. Badanidiyuru et al.（2014）：arbitrary-order、one-pass 的 Sieve-Streaming。
3. Norouzi-Fard et al.（2018）：random-order 下超過 $1/2$ 的 SALSA，以及附帶條件的 arbitrary-order lower bound。
4. Kazemi et al.（2019）：Sieve-Streaming++ 的正式定理為 $(1/2-\varepsilon)$ approximation 與 $O(k/\varepsilon)$ 儲存量；固定 $\varepsilon$ 時，記憶體對 $k$ 呈線性。
5. Chen, Nguyen, and Zhang（2016）：sliding-window submodular maximization；用於定位 future directions。
6. Duetting et al.（2024）：維持解的品質時限制相鄰時間點的替換量；用於定位 future directions。
7. Feldman et al.（2020）：arbitrary-order、one-pass 模型中無條件的 $1/2$ barrier。
8. Agrawal, Shadravan, and Stein（2019）與 Liu et al.（2021）：random-order 模型逼近 $1-1/e$ 的結果。

**範圍界線：**先集中於 monotone objective、cardinality constraint、value-oracle 模型。Non-monotone、matroid constraint、完整的線上推薦系統實作都不是本文的主要分析對象。推薦只用來說明動機與後續研究問題；固定 $f$ 的定理不能直接宣稱適用於會變動的使用者偏好。

## 三、預計篇幅與每節要回答的問題

以下是**約 10 頁的篇幅分配**，包含參考文獻；百分比表示文章篇幅，而非作業分數。實際頁數以排版後的 PDF 為準。

| 章節 | 目標篇幅 | 比例 | 必須講清楚的事 |
| --- | ---: | ---: | --- |
| Introduction | 約 1 頁 | 10% | 為何有 streaming 限制？這個問題與課程的 sublinear 思路如何相連？ |
| Formal model and background | 約 1.5 頁 | 15% | $f$、marginal gain、monotonicity、submodularity、$k$、OPT、value oracle；用 coverage 例子建立直覺。 |
| Established results | 約 2 頁 | 20% | 正式列出 approximation、passes、arrival order、memory／update cost；每個重要結果附證明的高層想法。 |
| Detailed result: Sieve-Streaming | 約 3 頁 | 30% | 已知估計值 $v$ 時的 threshold proof、兩種結尾情況、OPT guesses、lazy one-pass 技巧；穿插課堂概念的比較與自己的理解。 |
| Comparison and limitations | 約 1 頁 | 10% | 說明 $1/2$ 邊界的條件、oracle 成本，以及「sublinear memory」不等於「sublinear total time」。 |
| Future directions | 約 1 頁 | 10% | 提出可形式化的 changing-objective／preference-drift 問題、初步方法、評估指標及真正的技術難點。 |
| Conclusion and references | 約 0.5 頁 | 5% | 收束主線並列出完整、可核對的引用。 |

**拿高分的自我檢查標準：**數學條件準確；定理之間的假設不混用；詳細結果的核心證明能讓讀者逐步跟上；比較不只是羅列數字；future direction 有明確問題與嘗試方法；全文引用正確且以我們自己的文字表述。這些是寫作品質目標，並非對教授評分方式的推測。

## 四、詳細證明的寫法

本文的主軸是「為什麼 threshold rule 能保證解的價值」，而非只介紹演算法步驟。

1. **先處理已知 OPT 估計 $v$ 的版本。**寫出接受條件

    \[
    \Delta_f(e\mid S)\geq\frac{v/2-f(S)}{k-|S|}.
    \]

2. **證明 invariant：**每次接受元素後，$f(S)\geq v|S|/(2k)$。明確寫出 induction step。
3. **分兩種結尾：**若 $|S|=k$，由 invariant 得到 $f(S)\geq v/2$；若 $|S|<k$，用拒絕條件及 submodularity 限制每個未選最優元素的 final marginal gain，最後得到 $f(S)\geq\operatorname{OPT}/2$。
4. **移除「已知 OPT」假設：**由最大 singleton value $m$ 推得 $m\leq\operatorname{OPT}\leq km$，再用幾何間距的 guesses 平行維護候選集合。
5. **移除「預先知道 $m$」假設：**解釋隨 stream 更新 $m_t$ 時，為何把活動 guesses 擴到 $[m_t,2km_t]$ 可以避免漏掉較早的重要元素。這一段需要特別仔細核對原論文的證明。

### 與課堂內容的連結：寫進技術分析，不另寫泛泛的應用段

我們選這篇的理由，是它把課堂介紹的 **streaming 限制** 推進到一個較難的最佳化問題。詳述結果時，每個連結都應指出它對演算法或證明的作用：

1. **One-pass 與有限記憶體。**對照 Lecture 5 的 streaming model，明確區分「每個元素只看一次」「儲存的元素數量」和「每筆更新需要多少 oracle calls」。Sieve-Streaming 的 sublinear 性質是相對於資料量 $n$ 的儲存需求，並不是完全不讀過 $n$ 筆資料。
2. **從 offline greedy 到 streaming threshold。**課堂的 Lecture 6 已指出 offline $k$-center greedy 難以直接搬到 streaming setting，改用逐筆到達時可執行的 threshold test。本文要比較：Sieve-Streaming 也避開反覆尋找最大 marginal gain，但它的 threshold 是由剩餘價值與剩餘名額決定；兩種結尾情況是其 submodular 保證的核心。
3. **Lecture 6 的平行 guesses：最直接的技術對照。**Streaming $k$-center 對未知 OPT 同時跑幾何間距的 $T$ guesses；Sieve-Streaming 同樣平行維護 guesses $v$。兩者都用更多狀態換取更接近 OPT 的估計，但前者是距離最小化與可行性測試，後者是集合函數最大化與 marginal-gain test。應明講相似的是設計模式，不可把 $k$-center 的證明當成本文的證明。Sieve-Streaming 的 guesses 數量為 $O(\log k/\varepsilon)$。
4. **Sampling、sketch 與 oracle 的界線。**Lecture 5 的 sampling、Lecture 7 的 distinct elements，以及 Lecture 9–10 的 sketches 提供不同的壓縮資料方法。Sieve-Streaming 在主定理中保存的是候選集合，並非用一個 sketch 直接估計 OPT；原論文另討論以抽樣近似依賴整個資料集的 objective。比較時要說清楚各方法壓縮的是什麼。
5. **Lower bound 的條件。**若提到 Lecture 8、12–13 的 communication complexity 或課堂的 streaming lower bounds，先核對 2018 論文的正式假設與證明技巧；至少精確寫出 arbitrary order、$>1/2$、僅查詢 feasible sets 及 $\Omega(n/k)$ memory，避免把有限制的下界說成全面不可能。

寫作上，每個連結以一小段推理或一句精確比較嵌在相關定理旁；不把課堂單元列成與主證明分離的清單，也不把這些類比誤寫成論文已證明的結論。

**教材重複性核對：**已檢查 Lecture 1–13 的投影片文字、Note 1–10，以及目前提供的 homework／exercise／quiz PDF 的可擷取文字，沒有看到直接教授 submodular maximization 或 Sieve-Streaming。最接近的已教技巧是 Lecture 6／Note 6 的 streaming $k$-center：threshold test、幾何 OPT guesses 和並行實例。因此報告應主動說明「相似的設計模式」與「不同的目標及證明」。

## 五、接下來的修改順序

- [x] 建立可編譯的 [`main.tex`](main.tex) 初稿及 [`references.bib`](references.bib)。
- [x] 確定核心結果與初步章節配置。
- [x] 核對主論文的定理條件、符號與證明，補上 lazy initialization 的關鍵不等式。
- [x] 補強 established results：每個主要結果都有正式敘述及高層證明想法；lower bound 標明 feasible-query 限制，並參照完整版的 INDEX reduction。
- [x] 補強與課程的連結：以 Lecture 6 的 streaming $k$-center 平行 guesses 為主要技術對照，再凸顯 one-pass、space complexity、per-item update cost 與 approximation trade-off。
- [x] 查證 future direction 的相關研究，將「偏好漂移」收斂成具體且不誇稱新穎性的研究問題。
- [x] 加入 Generative AI Acknowledgment，並在 TeX 原始檔提醒作者須先實際審閱再提交。
- [x] 確認 LaTeX 原始檔可編譯，且所有引用鍵都對應到 bibliography。
- [x] 補上 Feldman et al.（STOC 2020）的無條件 $1/2$ lower bound、random-order $1-1/e-\varepsilon$ 結果（Agrawal et al. 2019；Liu et al. 2021），以及 Sieve-Streaming pseudocode 與 Sieve-Streaming++ 的 $O(k/\varepsilon)$ 求和論證。
- [x] 對照原文核對新增三篇論文的定理敘述（特別是 Feldman et al. 的 $\Omega(\varepsilon n/k^3)$ 與 Agrawal et al. 的 window 直覺描述）。
- [x] 檢查預覽 PDF 的實際頁數及視覺排版；目標約 10 頁。（2026-11-15：含參考文獻共 10 頁，交叉引用皆已解析。）
- [x] 去除 AI 腔與重複段落：修正 §3.2「The same paper」指代、合併 §5.1 與結論重複的結果摘要、改寫 Introduction 中 space vs. time 一段。
- [ ] 由組員逐段人工 proofread，確認論述是自己的文字並符合課程要求。

## 六、目前草稿的狀態

[`main.tex`](main.tex) 已完成一輪完整的 survey：正式問題定義、主要結果與假設比較、Sieve-Streaming 的核心證明、課堂技術連結、具體 future direction、結論，以及 Generative AI Acknowledgment。已對照第一節的四項課堂要求逐項核對，皆有對應章節；PDF 含參考文獻共 10 頁。

實際篇幅與第三節的規劃略有出入：§5.1 的比較段在刪除重複內容後約半頁（比較已分散在 §3 各小節與 §4.4），參考文獻約占一頁。提交前仍須由作者逐段審閱數學、引用及全文措辭，並確認 acknowledgment 對實際審閱情況的敘述屬實；修改 `main.tex` 後需重新編譯 `main.pdf`。
