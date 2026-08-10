# Timeline, Skills & Credentials 新增與維護指南 (Data Authoring Guide)

本指南詳細說明 Ludwigia 網站中 **Timeline（時間軸）**、**Skills（專業能力與 Stack）** 與 **Credentials（學業資歷、檢定與榮譽）** 三大資料驅動區塊的 Schema 契約、寫作範例與自動化多語翻譯工作流。

---

## 1. 架構總覽與 SSOT 單一真相來源

Ludwigia 的資料區塊採 **Data-Driven / Source-Driven** 架構設計：

1. **單一真相來源 (SSOT)**：
   - 資料統一存放於 `data/` 目錄下：
     - Timeline: [data/Timeline/timeline.json](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/data/Timeline/timeline.json)
     - Skills: [data/Skills/skills.json](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/data/Skills/skills.json)
     - Credentials: [data/Credentials/credentials.json](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/data/Credentials/credentials.json)
   - 前端 Runtime (`about-timeline.js`, `about-skills.js`, `about-credentials.js`) 負責非同步載入 JSON、正規化、多語切換與 DOM 動態渲染。

2. **高內聚 Inline 多語物件 (Localized Text Objects)**：
   - 所有文案欄位（如 `title`, `summary`, `detail`, `name`, `desc`, `issuer`）均支援 `{ "zh-Hant": "...", "en": "...", "zh-Hans": "..." }` 物件。
   - 作者新增資料時，**只需填寫預設語言（如 `zh-Hant`）**，其餘語系可透過 CLI 指令自動補齊。

---

## 2. Timeline 時間軸維護 (`data/Timeline/timeline.json`)

### 2.1 事件類型 (Event Types)

#### A. 單點事件 (`point`)
適合表達某個特定時間發生的 milestone、考試成績、論文發表或入學/畢業等轉折點：

```json
{
  "id": "gre-general-test-2024",
  "type": "point",
  "scale": "meso",
  "category": "work",
  "at": "2024-09",
  "title": {
    "zh-Hant": "GRE 通用考試 (V160 / Q170)"
  },
  "summary": {
    "zh-Hant": "取得 Quantitative 170 滿分與 Verbal 160 高分成果。"
  },
  "detail": {
    "zh-Hant": "於台北考場完成 GRE General Test 測驗。"
  },
  "references": [
    {
      "label": { "zh-Hant": "查看成績報告" },
      "href": "assets/images/credentials/gre-score-report.png"
    }
  ]
}
```

#### B. 階段事件 (`period`)
適合表達一段持續發生的 phase（如大學求學、碩士求學、實習任期）：

```json
{
  "id": "ntu-pt-undergraduate",
  "type": "period",
  "scale": "macro",
  "category": "education",
  "start": "2019-09",
  "end": "2020-08",
  "title": {
    "zh-Hant": "國立臺灣大學：物理治療學系"
  },
  "summary": {
    "zh-Hant": "2019 年 9 月進入國立臺灣大學物理治療學系，2020 年 8 月辦理休學。"
  }
}
```

> 💡 **進行中階段 (`end: "present"`)**：
> 若該階段**目前仍在持續中**，請將 `end` 設定為 `"present"`：
> `"start": "2025-08", "end": "present"`
> Runtime 會自動將其投影為「至今 / Present」與當下時間點，不需手動更新今天日期。

### 2.2 尺度規範 (`scale`)
- `"macro"` (宏觀)：人生主線 / 大階段轉折。會同時出現在 Macro、Meso、Micro 三個尺度檢視中。
- `"meso"` (中觀)：關鍵轉折點。會出現在 Meso、Micro 檢視中。
- `"micro"` (微觀)：細節事件。僅出現在 Micro 檢視中。

### 2.3 分類標籤 (`category`)
- `"education"` (學歷)
- `"internship"` (實習)
- `"work"` (工作)

---

## 3. Skills 專業能力維護 (`data/Skills/skills.json`)

### 3.1 Schema 結構與範例

```json
{
  "version": 1,
  "categories": [
    {
      "id": "machine-learning-ai",
      "title": {
        "zh-Hant": "機器學習與 AI"
      },
      "icon": "fa-solid fa-brain",
      "items": [
        {
          "id": "generative-retrieval",
          "name": {
            "zh-Hant": "生成式檢索與推薦系統"
          },
          "level": "Proficient",
          "percentage": 90,
          "badge": "Core Focus",
          "desc": {
            "zh-Hant": "深研 Semantic ID Tokenizer (RQ-VAE / RQ-KMeans) 與 End-to-End 生成式推薦架構。"
          }
        }
      ]
    }
  ]
}
```

### 3.2 欄位說明
- `icon`: FontAwesome 圖示 class（例如 `"fa-solid fa-code"`, `"fa-solid fa-server"`）。
- `percentage`: 0~100 的數字，控制前端技能條的長度。
- `level`: 文字等級描述（如 `"Proficient"`, `"Experienced"`）。
- `badge`: 技能卡片右上角的標籤。

---

## 4. Credentials 憑證與榮譽維護 (`data/Credentials/credentials.json`)

### 4.1 種類 (`types`) 與 領域 (`categories`)

#### 種類 (`type`) 允許值：
1. `"offer"`: 錄取通知 (Admission Offer)
2. `"certificate"`: 學位證書與結業證明 (Degree & Diploma)
3. `"transcript"`: 歷年成績單 (Academic Transcript)
4. `"exam"`: 語言與能力檢定 (Test & Examination)
5. `"award"`: 獎項榮譽 (Honor & Award)
6. `"competition"`: 競賽參賽證明 (Competition)

#### 領域 (`category`) 允許值：
1. `"tech"`: 資訊工程與技術 (Engineering & CS)
2. `"academic"`: 學術與研究 (Academic & Research)
3. `"language"`: 語言 (Language)

### 4.2 雙層媒體架構 (PNG 預覽 + PDF 全螢幕檢視)

為了兼顧 **「首頁與縮圖列極速載入」** 與 **「全螢幕多頁 PDF 閱讀」**，Credentials 採用雙層媒體分工：

```json
{
  "id": "nus-mcomp-ai-offer",
  "title": {
    "zh-Hant": "國立新加坡大學 人工智慧碩士錄取通知"
  },
  "type": "offer",
  "category": "tech",
  "date": "2025-05",
  "issuer": {
    "zh-Hant": "國立新加坡大學 (NUS) 資訊學院"
  },
  "image": "assets/images/credentials/nus-mcomp-ai-offer.png",
  "thumbnail": "assets/images/credentials/nus-mcomp-ai-offer.png",
  "document": "assets/documents/credentials/nus-mcomp-ai-offer.pdf",
  "summary": {
    "zh-Hant": "國立新加坡大學 (NUS) 資訊學院 Master of Computing in Artificial Intelligence (MComp in AI) 人工智慧碩士正式錄取通知書。"
  }
}
```

> 💡 **媒體分工契約 (Media Hierarchy Contract)**：
> 1. **`image` & `thumbnail` (PNG / JPG)**：專門負責 **Showcase 主卡片預覽** 與 **底欄縮圖選單列**。載入極速、無視窗溢出干擾。
> 2. **`document` (PDF)**：專門負責 **點開全螢幕 (Modal Lightbox)** 的原生多頁 PDF 閱讀器與「下載檔案 (Download Document)」功能。支援多頁滾動與頁碼翻頁。

---

## 5. 自動化多語翻譯與驗證工作流 (Automated Workflow)

### 步驟一：手寫資料檔主語言
在 `data/Timeline/timeline.json`、`data/Skills/skills.json` 或 `data/Credentials/credentials.json` 中加入新條目，**只需填寫 `zh-Hant`（繁體中文）**。

### 步驟二：執行 CLI 自動補齊多語 (`cli.py translate-data`)
利用整合好的翻譯 CLI 工具自動呼叫 Gemini API 補齊英文 (`en`) 與簡體中文 (`zh-Hans`)：

```bash
# 自動補齊全站資料檔 (skills, credentials, timeline) 的缺語系
python3 cli.py translate-data --data-file all

# 預覽翻譯結果（不安裝/不修改檔案）
python3 cli.py translate-data --data-file all --dry-run
```

### 步驟三：執行單元測試驗證
```bash
python3 cli.py test
```

確定全數測試通過且 JSON 格式正確後即可提交版控！
