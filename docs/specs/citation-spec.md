# Citation Specification (引用規格與核驗標準)

本文件定義 Ludwigia 全站筆記（`notes/`）與文章（`writing/`）中「參考文獻與延伸閱讀（References & Resources）」的標準結構、學術引用格式、真實性核驗 protocol 與語言留存規範。

---

## 1. 參考文獻區塊結構（Section Structure）

所有內容頁底部的參考文獻區塊，應採簡潔標題並按屬性分層：

* **主標題**：
  * 繁體中文/雙語頁面：`## 參考資料（References）`
  * 純英文頁面：`## References`
* **分類子標題**（當同時包含學術論文與技術文章時使用）：
  * **學術論文**：`### 學術論文（Academic Literature）`
  * **技術文章**：`### 技術文章（Technical Articles）`

---

## 2. 學術論文引用格式（Academic Citation Standard）

針對學術論文、會議論文與期刊，採用標準 APA / IEEE 混合格式：

### 格式範本
`作者群 (年份). 論文題目. *發表會議/期刊名稱 (Venue)*, 卷號(期號), 頁碼. [arXiv:xxxx.xxxxx](https://arxiv.org/abs/xxxx.xxxxx)` 或 `[DOI/Publisher](URL)`

### 關鍵欄位要求
1. **作者群 (Authors)**：列出主要作者（多於 5 人時可採用 `名, 姓., et al.`，否則列出全體作者）。
2. **年份 (Year)**：論文預印（arXiv）或正式出刊年份。
3. **論文題目 (Title)**：完整論文題目，句首大寫或標準 Title Case。
4. **發表會議/期刊 (Venue)**：必須標明頂尖會議（如 CVPR, NeurIPS, ICML, AAAI, ICRA, ICLR）或學術期刊（如 TPAMI, JAIR, ACM CSUR）。
5. **連結目標 (Link Contract)**：
   * **禁止**：直接連結 `.pdf` 二進位檔（如 `https://arxiv.org/pdf/2203.01941`）。
   * **必須**：連結至 Abstract / Overview 導覽頁面（如 `https://arxiv.org/abs/2203.01941`）或官方 DOI 連結（`https://doi.org/...`），以利讀者閱讀摘要與取得 BibTeX。

---

## 3. 技術文章與社群解讀格式（Technical Articles Standard）

針對知乎、微信公眾號、Medium、Substack 或官方技術文檔：

### 格式範本
`[平台/作者：文章原始標題](URL)`

---

## 4. 原始語言保留原則（Source Language Contract）

* **原則**：外部參考文獻（特別是文章標題與平台名稱）**必須嚴格保持原網址/原文獻的原始語言與用字**。
* **簡體中文**：若來源為簡體中文文章（如知乎「从原理到落地详细解读生成式推荐OneRec」），標題**不得**被強制改寫或轉換為繁體中文，必須維護原文真相。
* **英文/其他語言**：保持原文標題，不得自行翻譯論文題目。

---

## 5. 引用真實性與精準度核驗 Protocol（Verification Protocol）

在新增或編輯參考文獻時，Agent 與作者必須執行以下實體核驗（Verification Steps）：

1. **標題與作者對齊**：核對 paper title 與 author 名單是否精準一致。
2. **發表場合（Venue）查驗**：透過 arXiv、Google Scholar、DBLP 或 IEEE Xplore/ACM 確定論文實際發表的會議或期刊名稱，不得將 CVPR / NeurIPS 論文誤標為未發表預印本。
3. **網址有效性**：確保 arXiv 號碼、DOI 號碼與知乎/技術部落格網址正確無誤且可連線。
