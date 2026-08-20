<meta>
Title: Paxos Made Moderately Complex 結構化筆記
CanonicalId: paxos-made-moderately-complex-structured-notes
Tags: Paxos, Multi-Paxos, Consensus, State Machine Replication, Fault Tolerance, Distributed Systems, Raft, System Design
Summary: 從 SMR 問題設定、Replica/Leader/Acceptor invariants、Scout/Commander 分工，到 PMMC 與 Raft 的對照整理。
Slug: paxos-made-moderately-complex-structured-notes-zh-tw
Output: notes/paxos-made-moderately-complex-structured-notes/paxos-made-moderately-complex-structured-notes-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: false
Status: drafting
LastModified: 2026-06-24
</meta>

<draft>
TLDR: 這篇筆記把 Paxos Made Moderately Complex 放回 State Machine Replication 的主線裡，重點不是背 phase，而是理解 Replica、Leader、Acceptor 如何一起維持 safety。
MainFlow: 先講 SMR 想解的問題與非同步/崩潰失敗模型，再整理 Replica invariants、Acceptor invariants、Leader/Scout/Commander 分工，最後補上 fault tolerance sizing 與 Raft 對照。
Scope: PMMC 的問題背景、角色職責、state variables、R/A/C invariants、安全性鏈條、ballot、fault tolerance、Raft 對照。
OutOfScope: Paxos 證明細節、實際程式碼 walkthrough、網路 partition 下的工程細節、性能優化 benchmark。
FollowUps: 可以再拆一篇只講 ballot / quorum intersection，也可以再拆一篇專講 PMMC 與 Raft / Viewstamped Replication 的對照。
</draft>

# Paxos Made Moderately Complex 結構化筆記

這份筆記的目標不是把 Paxos 的訊息流程硬背起來，而是先抓住一條更穩的主線：

- 我們想在 **asynchronous environment + crash failures** 的條件下，做出 **State Machine Replication (SMR)**
- SMR 要求多個 replicas 對外看起來像同一台 state machine
- 因此真正要守住的核心不是「每個人都收過同一批訊息」，而是「所有 replicas 最後都以同樣順序執行同樣的 commands」

## 一、PMMC 在解什麼問題

`Paxos Made Moderately Complex` 可以視為把 `Paxos Made Simple` 往 Multi-Paxos / SMR 的方向再推進一步。它關心的不是單次 consensus 的抽象定義而已，而是：

1. 如何把一連串 client commands 放進 log / slots
2. 如何讓多個 replicas 依同樣順序執行這些 commands
3. 如何在 leader 失敗、replica 失敗、訊息延遲不可預期時，仍然守住 safety

### 問題設定

- **State Machine**：一台 deterministic 的狀態轉移機器；給同樣的初始狀態與同樣的 command sequence，就要得到同樣結果
- **Asynchronous Environment**：通訊延遲、節點執行速度、clock 都沒有上界保證
- **Crash Failure**：節點可能直接停掉，不再回應訊息

### 為什麼 SMR 麻煩

如果只有一個 replica，client 送進來什麼 command，就照收到的順序執行即可。但多 replicas 的情況下：

- 不同 replicas 可能先後收到不同 commands
- 同一個 client 連到壞掉的 replica 時，系統仍要能繼續服務
- 若不同 replicas 對同一個 slot 做出不同決定，整個 state machine 就分叉了

所以 PMMC 的真正責任，是把「多台機器看到世界的順序不同」收斂成「多台機器執行的 log 順序相同」。

<block>
title: 一個穩定的 mental model
content:
把 PMMC 想成「用一串 Paxos instances 來保護一條 state machine log」會比單獨背 Prepare / Accept 容易很多。每個 slot 都像一個 Paxos instance，而 Multi-Paxos / PMMC 的價值，就是讓穩定 leader 把 phase 1 的成本 amortize 掉。
</block>

## 二、系統角色與資料流

### 角色分工

| 角色 | 主要責任 | 你可以怎麼理解 |
| --- | --- | --- |
| Client | 發送 command，接收 result | 外部使用者 |
| Replica | 維護 state machine、log slots、執行 commands | 對外服務的機器 |
| Leader | 驅動 proposals 進入 consensus | 協調者 / distinguished proposer |
| Acceptor | 保存 ballot 與 accepted pvalues | fault-tolerant memory |

### 基本訊息形狀

- Client 發 request：`<k, cid, operation>`
- Replica 對 leader 發 proposal：`<proposal, slot, c>`
- Acceptor 接受的值可以視為 `pvalue = <ballot-number, slot, command>`

### PMMC 與一般 Paxos 的關係

- 單次 Paxos：解一個 value 的 agreement
- Multi-Paxos / PMMC：把很多個 Paxos instances 串成 slots
- 每個 client operation 對應到某個 slot
- 若 leader 穩定，phase 1 不必每個 slot 都重跑

## 三、Replica：SMR 的落地位置

Replica 是最接近「真正 state machine」的地方。它不是只負責收 decision，而是要把 decision 轉成可執行的 command sequence。

### Replica state variables

- `state`：state machine 內部狀態
- `in-slot`：下一個可以 proposal 的 slot
- `out-slot`：下一個正在等 decision 的 slot
- `requests`：尚未 proposal / 尚未決定的 client requests
- `proposals`：目前 outstanding proposals
- `decisions`：已知的 decided proposals
- `leaders`：目前 leader 集合

### Replica invariants

| Invariant | 重點 |
| --- | --- |
| `R1` | 同一個 slot 不能有兩個不同 commands |
| `R2` | 到 `out-slot` 為止的 slots 都必須已在 `decisions` 裡 |
| `R3` | `state` 必須等於依序套用已決定 commands 的結果 |
| `R4` | `out-slot` 只能往前，不能倒退 |
| `R5` | 只能在已知 configuration 的 slots 上 proposal，通常用 `WINDOW` 控制 |

### Replica functioning 的直觀理解

- `R2`、`R3`、`R4`、`R5` 幾乎是 replica 執行流程自然會維持的
- 真正最難的是 `R1`
- `R1` 不是 replica 單靠自己保證的，而是來自 leader + acceptor 的 safety 鏈條

換句話說，replica 負責「按決定執行」，但是否只有一個合法 decision，則仰賴更底層的 consensus machinery。

## 四、Ballot 與 Acceptor：PMMC 的記憶核心

PMMC 裡的 ballot 可以看成 Paxos proposal number 的結構化版本，常寫成 `(leader, seqnum)`。

### Ballot 的作用

- 辨認哪個 leader / 哪一輪嘗試比較新
- 讓 acceptor 能拒絕過時領導者
- 讓 preempted leader 知道自己已經落後

### 為什麼要分配 sequence

如果多個 proposers / leaders 都自己往上加號碼，很容易撞號或互搶。常見做法是把序列切開，例如：

- `P0 -> 0, 4, 8, 12`
- `P1 -> 1, 5, 9, 13`
- `P2 -> 2, 6, 10, 14`
- `P3 -> 3, 7, 11, 15`

這樣不同 leader 產生 ballot 時更容易保證全域唯一且單調遞增。

### Acceptor state variables

- `ballot-number`：目前 acceptor 承認的 ballot
- `accepted`：這個 acceptor 接受過的 `pvalues` 集合

### Acceptor invariants

| Invariant | 直觀含義 |
| --- | --- |
| `A1` | ballot numbers 必須嚴格遞增 |
| `A2` | acceptor 只會接受當前 ballot 的 `<b, s, c>` |
| `A3` | 一旦接受過的 `pvalue`，不能從 `accepted` 裡刪掉 |
| `A4` | 若兩個 acceptors 都接受了同 ballot、同 slot 的值，command 必須相同 |
| `A5` | 若某個 slot 的 command 已被多數接受，之後更高 ballot 不可改成不同 command |

<callout>
icon: lightbulb
style: regular
title: A5 為什麼是 Paxos 安全性的核心
content:
A5 的本質是 quorum intersection。只要兩個 majorities 一定交集，新的 leader 在 phase 1 收集資訊時，就不可能完全看不到舊 majority 已經接受過的值。因此它不能在高 ballot 上偷偷換掉同一 slot 的 command。
</callout>

## 五、Leader、Scout、Commander：誰在保護什麼

Leader 不是只做「提出新值」這麼單純。它的責任是既要推進系統，也要保證自己提出的東西不會破壞過去已經形成的安全性。

### Leader state variables

- `ballot-number`：單調遞增
- `active`：是否已成功取得領導權
- `proposals`：slot -> command 的 proposal map

### Leader functioning

1. 從 replicas 收 proposals
2. 先做 phase 1，確認自己是不是合法 leader
3. 成為 active leader 後，對各 slots 做 phase 2
4. 如果任何階段遇到更高 ballot，就收到 `<preempted, b-return>`，代表系統裡已經有更「新」的 leader

### Scout 在做什麼

Scout 是 leader 內部負責 **phase 1** 的過程。它的核心目的不是「宣示主權」而已，而是：

- 向 acceptors 蒐集目前被接受過的資訊
- 幫 leader 找出某個 slot 是否已經在舊 ballot 中有被接受過的 command
- 迫使新 leader 尊重既有歷史，而不是任意重寫

### Commander 在做什麼

Commander 是 leader 針對某個 slot 生成的 phase 2 process。它負責把 `<slot, command>` 推到 acceptors 上，等到 majority `ACCEPT` 後形成 decision。

Commander 要守住兩個關鍵性質：

- `C1`：同一個 ballot / slot 最多只能有一個 command
- `C2`：如果舊 ballot 曾經為這個 slot 接受過某個 command，新的 commander 必須沿用它

### 為什麼要把 Scout 與 Commander 拆開

- Scout 專心處理「我是不是合法 leader，以及歷史上這個 slot 先前接受過什麼」
- Commander 專心處理「在既有安全約束下，把這個 slot 推到被多數接受」

這樣拆開之後，leader 的責任邊界會更清楚，也更容易理解為什麼 phase 1 與 phase 2 在 Multi-Paxos 中可以被不同程度地 amortize。

## 六、安全性鏈條：從 C1 / C2 一路推到 R1

這篇文章最值得記住的，不是單一 invariant 的文字，而是它們之間的推導關係：

1. `C1` 與 `C2` 讓 commander 不會在同 ballot / slot 上亂換 command，也不會覆寫舊 ballot 已被接受的值
2. 這進一步推出 acceptor 層的 `A4` 與 `A5`
3. `A5` 再往上保證 replica 層的 `R1`
4. 所以最後可以得到：**同一個 slot 不會出現兩個互相衝突的 decided commands**

這條鏈就是 PMMC / Paxos safety 的主幹。

<block>
title: 一句話記住 safety
content:
只要某個 slot 已經被 quorum 鎖到某個 command，未來任何更高 ballot 想對這個 slot 前進，都只能延續那個 command，而不能改寫它。
</block>

## 七、Fault Tolerance 要多少節點

如果系統要容忍 `f` 個 failures，常見 sizing 如下：

- **Replicas**：至少 `f + 1`
- **Leaders**：至少 `f + 1`，但任一時刻只需要 `1` 個 active leader
- **Acceptors**：至少 `2f + 1`

### 為什麼 acceptors 是 `2f + 1`

因為你需要在 `f` 個 acceptors 掛掉後，仍然能拿到 majority。若只有 `2f`，掛掉 `f` 個後只剩 `f`，你就拿不到超過一半的 quorum 了。

更重要的是：

- Paxos 依賴 majority intersection
- 兩個多數集合一定要有交集
- 這個交集是舊決議能被新 leader 看見的根本

## 八、PMMC 與一般 Multi-Paxos 的工程理解

### 單次 Paxos 的痛點

如果每個 operation 都完整跑一次 prepare + accept：

- 每個 request 都要兩輪通訊
- 你得決定新 operation 應該投在哪個 instance / slot
- log 可能會有 gaps
- 多 proposer 同時競爭時很容易互搶

### PMMC 的收斂方式

- 先選出 distinguished leader
- leader 在一開始做 phase 1
- 一旦 leader active，穩態時每個 proposal 只需做 phase 2
- 若 leader 失敗，再重新做 election / phase 1

所以 Multi-Paxos / PMMC 的效率提升，並不是因為 consensus magically 變簡單，而是因為 **穩定 leader 讓 phase 1 的成本被攤平**。

## 九、和 Raft 放在一起看時，該抓什麼

Raft 可以被視為和 Viewstamped Replication、Multi-Paxos 同一家族的 SMR 協定，但它把理解路徑重新整理過了。

### Raft 的核心心智模型

- 單一 server role，但有三個 states：`Leader`、`Follower`、`Candidate`
- 用 `term` 做領導權分段
- 穩態由 leader 複製 log 給 followers
- election restriction 會保證新 leader 擁有所有 committed entries

### PMMC vs. Raft

| 面向 | PMMC | Raft |
| --- | --- | --- |
| 理解切法 | 角色拆得更細：replica / leader / acceptor / scout / commander | 單一 server role + 三種狀態 |
| 安全性語言 | ballot、accepted pvalues、quorum intersection、invariants 鏈條 | term、up-to-date log、AppendEntries / RequestVote |
| 穩態成本 | 穩定 leader 後主要跑 phase 2 | 穩定 leader 後主要做 log replication |
| 可理解性 | 概念完整但較重 | 明顯偏向教學與實作可理解性 |

### 兩者共通的底層想法

- 都是在做 crash-fault SMR
- 都依賴 majority / quorum intersection
- 都要保證 committed / chosen 的 log entry 不會被未來 leader 改掉
- 都讓 replicas / followers 最終以同一順序執行 commands

## 十、Lab / Implementation 視角

如果你是在實作課或 Lab 裡碰到這類協定，常見的簡化是：

- 把 replica / leader / acceptor 合併成同一個 server process
- 用單一節點型別承擔所有角色
- 對已執行 commands 做 garbage collection

這些簡化不會改變 safety 主線，但會讓實作上少掉很多 process / role mapping 的複雜度。

## Summary

PMMC 難的地方，不是 phase 多，而是它把 SMR、leader election、quorum memory、slot-level consensus 都拆成了不同物件與 invariant。真正比較穩的讀法是：

1. 先知道它要做的是 SMR
2. 再知道 replica 想守的是同一條 command log
3. 再看 acceptor 如何透過 ballot 與 accepted set 保護歷史
4. 最後再看 leader / scout / commander 如何在不破壞歷史的前提下推進新 proposals

當你用這條路徑理解時，`R1`、`A5`、`C2` 這些 invariants 就不再只是要背的字串，而會變成「為什麼同一 slot 不能被改寫」的不同視角。

<reviewkit>
title: Review Kit
id: pmmc-review-kit
toc: false
<takeaways>
- PMMC 的核心任務是在 asynchronous environment 與 crash failures 下實現 state machine replication。
- Replica 真正想守住的是同一條 log 與同一個 state transition 結果，而不只是收到同樣的訊息。
- `R1` 是 replica safety 的核心，但它其實建立在 leader 與 acceptor 的 invariant 鏈條之上。
- Acceptor 透過 `ballot-number` 與 `accepted` 集合保存歷史，`A5` 是多數決歷史不可被更高 ballot 改寫的關鍵。
- Scout 做 phase 1，核心責任是讓新 leader 看見舊歷史；Commander 做 phase 2，核心責任是把單一 slot 推向多數接受。
- `C1`、`C2` 會推出 `A4`、`A5`，而 `A5` 又會推出 `R1`。
- Multi-Paxos / PMMC 的效率來自穩定 leader 把 phase 1 成本攤平，而不是放棄 safety。
- Raft 與 PMMC 在 safety 保證上屬於同一家族，但 Raft 用更容易教學與實作的語言重新整理了心智模型。
</takeaways>
<qquiz src="questions.zh-Hant.json" title="PMMC 複習測驗"/>
<qprompt/>
</reviewkit>

## 參考資料（References）

1. Van Renesse, R., & Altinbuken, D. (2015). Paxos made moderately complex. *ACM Computing Surveys (CSUR)*, 47(3), 1-28. [ACM Digital Library](https://doi.org/10.1145/2673577)
2. Ongaro, D., & Ousterhout, J. (2014). In search of an understandable consensus algorithm (Raft). In *2014 USENIX Annual Technical Conference (USENIX ATC 14)* (pp. 305-319). [USENIX](https://www.usenix.org/conference/atc14/technical-sessions/presentation/ongaro)
3. Multi-Paxos / State Machine Replication Course Notes & System Architecture References.
