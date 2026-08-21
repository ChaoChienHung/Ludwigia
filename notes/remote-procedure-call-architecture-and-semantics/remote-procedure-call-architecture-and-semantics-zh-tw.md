<meta>
Title: 遠端程序呼叫 (RPC) 核心架構與透明度語意：從 Stub 到 Marshaling 運作機制
Summary: 本文深入解析遠端程序呼叫 (Remote Procedure Call, RPC) 的底層運作機制。從 IPC 與 RPC 的差異出發，剖析 Client/Server Stub、Parameter Marshaling（參數序列化）、RPC Daemon 監聽，以及達成網路透明度 (Location Transparency) 的完整 8 步呼叫生命週期。
Slug: remote-procedure-call-architecture-and-semantics-zh-tw
Output: notes/remote-procedure-call-architecture-and-semantics/remote-procedure-call-architecture-and-semantics-zh-tw.html
CanonicalId: remote-procedure-call-architecture-and-semantics
Style: default
Lang: zh-tw
Tags: distributed systems, rpc, ipc, networking, system architecture
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 前言與背景：從單機 IPC 到分散式 RPC 的演進
- IPC vs. RPC：共享記憶體的侷限與訊息傳遞 (Message Passing) 必然性
- 核心目標：位置透明度 (Location Transparency) 與語意
- RPC 關鍵元件解構：Client Stub、Server Stub 與 RPC Daemon
- 資料封裝機制：Parameter Marshaling 與 Unmarshaling
- 完整 8 步呼叫生命週期 (Step-by-Step Flow)
- 分散式環境下的潛在挑戰與語意權衡
</draft>

# 遠端程序呼叫 (RPC) 核心架構與透明度語意：從 Stub 到 Marshaling 運作機制

<callout type="info">
TL;DR: 在單機系統中，進程間通訊（IPC）可透過共享記憶體（Shared Memory）或訊息傳遞（Message Passing）完成。然而在分散式網路環境中，實體機器分離導致共享記憶體不可行。遠端程序呼叫（Remote Procedure Call, RPC）透過 **Client/Server Stub** 與 **Parameter Marshaling** 技術，隱藏網路訊息打包、埠號查找與通訊細節，讓呼叫遠端服務體驗如同呼叫本機函式般透明。
</callout>

## 1. 背景與演進：從 IPC 到 RPC

在作業系統與電腦網路中，進程間通訊（Inter-Process Communication, IPC）是建構模組化系統的基石：

- **單機 IPC (Local Communication)**：當所有進程運行於同一台實體機器時，系統可以透過**共享記憶體（Shared Memory）**或**系統內部訊息佇列（Message Passing）**高效交換數據。
- **跨網路通訊 (Remote Communication)**：當進程分佈於由網路連接的不同獨立機器時，硬體層級的共享記憶體已無法使用。此時通訊必須完全依賴**跨網路的訊息傳遞（Message-based Communication）**與 Socket 介面。

然而，直接使用原始 Socket 編寫網路傳遞邏輯繁瑣且容易出錯。程式員必須親自處理 Socket 連線、建立 Byte 流協定以及資料格式解析。

**RPC（Remote Procedure Call）** 的出現正是為了打破這一限制——它定義了一套高階通訊協定，將底層網路呼叫抽象化為高階程式語言中的「函式呼叫（Function Call）」。

---

## 2. RPC 的核心理念：位置透明度 (Location Transparency)

RPC 的設計宗旨是提供 **位置透明度（Location Transparency）**：

> **讓程式呼叫運行在遠端伺服器上的程序時，其語意與語法體驗與呼叫同機器的本機函式（Local Procedure Call）完全一致。**

```text
┌─────────────────────────────────────────────────────────────┐
│ Client Application                                          │
│   result = remote_sum(a, b);  ◄── 寫法如同普通本機函式呼叫      │
└──────────────┬──────────────────────────────────────────────┘
               │ (隱藏底層通訊細節)
               ▼
┌─────────────────────────────────────────────────────────────┐
│ RPC Subsystem (Client Stub ➔ Network ➔ Server Stub)         │
└─────────────────────────────────────────────────────────────┘
```

對客戶端程式員而言，不需要知道遠端主機的 IP 位址、通訊埠號（Port Number）或二進位序列化格式，所有的通訊複雜度皆被 RPC 子系統屏蔽。

---

## 3. RPC 架構的三大核心元件

為了達成透明度，RPC 架構引入了三種關鍵角色：

### 3.1 Stub（代理切片 / 根切塊）

Stub 是 RPC 架構中最關鍵的通訊中介代碼：

- **Client-side Stub（客戶端存根）**：
  - 在客戶端扮演遠端程序的「本地代理人（Proxy）」。
  - 暴露與遠端程序完全相同的介面。
  - 負責接收本機呼叫參數、尋找遠端服務埠號，並將參數進行 **Marshaling（序列化）**。
- **Server-side Stub（伺服器端存根 / Skeleton）**：
  - 在伺服器端接收 RPC 守護進程分發的二進位封包。
  - 負責 **Unmarshaling（反序列化）** 解封參數。
  - 真正的呼叫伺服器本機上的具體函數實作，並將執行結果打包回傳。

### 3.2 Parameter Marshaling（參數封裝與序列化）

由於不同機器可能使用不同的 CPU 架構、位元組順序（Big-Endian vs. Little-Endian）或資料對齊規則，參數不能以原始記憶體指標或結構直接發送。

- **Marshaling（序列化）**：客戶端 Stub 將高階資料結構與參數打包成適合在網路傳輸的標準結構化訊息（Structured Message）。
- **Unmarshaling（反序列化）**：伺服器端 Stub 將二進位封包解碼還原為伺服器語言可理解的物件或資料結構。

### 3.3 RPC Daemon（伺服器端守護進程）

在伺服器端，必須有一個長期運行的後台進程——**RPC Daemon**：
- 在特定的網路埠號（Port）上持續監聽（Listening）。
- 接收來自客戶端的 RPC 請求封包。
- 根據封包中的服務識別碼（Function Identifier / Service ID），將請求分發給對應的 Server-side Stub。

---

## 4. RPC 呼叫生命週期 (8 步完整流程)

下圖展示了一次完整的 RPC 呼叫流程：

```text
Client Application           Client Stub              Server Daemon / Stub          Server Execution
     │                            │                            │                           │
  1. │ 呼叫 remote_func(a,b)      │                            │                           │
     ├───────────────────────────►│                            │                           │
     │                            │ 2. 打包 Marshaling          │                           │
     │                            │ 3. 發送網路封包             │                           │
     │                            ├───────────────────────────►│                           │
     │                            │   (Message via Network)    │ 4. 接收並 Unmarshal       │
     │                            │                            ├──────────────────────────►│
     │                            │                            │                           │ 5. 執行真實函式
     │                            │                            │                           │    Compute result
     │                            │                            │ 6. 打包結果 Return Value  │
     │                            │◄───────────────────────────┼───────────────────────────┤
     │                            │   (Response via Network)   │                           │
     │ 8. 得到回傳值 (Transparent) │                            │                           │
     │◄───────────────────────────┤                            │                           │
```

1. **Step 1：客戶端呼叫**：客戶端應用程式發起正常的程序呼叫（如 `remote_func(a, b)`）。
2. **Step 2：Client Stub 接管**：客戶端 Stub 被觸發，接收呼叫參數。
3. **Step 3：Marshaling 與發送**：Client Stub 將參數進行序列化，封裝為結構化訊息，並透過底層網路介面發送給伺服器 RPC Daemon。
4. **Step 4：Server 接收與分發**：伺服器端 RPC Daemon 在指定 Port 收到訊息，將其交給相應的 Server Stub 進行 Unmarshaling 解包。
5. **Step 5：執行服務**：Server Stub 呼叫伺服器上的真實函數實作，完成計算。
6. **Step 6：結果打包回傳**：Server Stub 將執行結果（Return Values）序列化，透過網路發回客戶端。
7. **Step 7：Client 接收與解封**：Client Stub 接收網路回應訊息，解封出回傳值。
8. **Step 8：回傳結果**：Client Stub 將最終結果傳回客戶端呼叫者，完成一次透通的呼叫。

---

## 5. 分散式 RPC 的工程挑戰

雖然 RPC 提供了位置透明度，但在實際分散式系統中，**遠端呼叫與本機呼叫在物理特性上存在本質差異**：

- **網路斷連與延遲 (Network Partition & Latency)**：本機呼叫通常在納秒級完成且保證執行；遠端呼叫可能面臨毫秒級延遲、網路丟包甚至對端崩潰。
- **失敗語意 (Failure Semantics)**：當發生網路超時（Timeout）時，客戶端難以得知伺服器是「完全未收到請求」、「執行到一半崩潰」還是「已執行完畢但回應丟失」。
- **呼叫語意保障**：為應對失敗，分散式 RPC 通常提供以下執行語意保障：
  - *At-least-once（至少一次）*：重複重試，適用於等冪操作（Idempotent Operations）。
  - *At-most-once（至多一次）*：透過去重 ID 防止重複執行。
  - *Exactly-once（恰好一次）*：結合交易或狀態機的終極保證。

---

<reviewkit>
<qprompt/>
  <takeaways>
    - **從 IPC 到 RPC**：RPC 將本機程序呼叫擴展至分散式網路，透過訊息傳遞克服實體機器無法共享記憶體的限制。
    - **核心角色 Stub**：Client Stub 負責代理與 Marshaling；Server Stub 負責 Unmarshaling 與本機函式派送。
    - **位置透明度 (Transparency)**：封裝了 Socket 建立、埠號尋找與序列化傳輸，使遠端呼叫語意貼近本機呼叫。
    - **分散式挑戰**：由於網路延遲與不可靠性，RPC 必須處理網路斷連、重試與 At-most-once / At-least-once 語意保障。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. [YouTube: Remote Procedure Call (RPC)](https://www.youtube.com/watch?v=QmhTjsOOrlw)
