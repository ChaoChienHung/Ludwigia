# Skills & Credentials Technical Specification

這份文件記錄在 `index.html` 首頁「關於我 (About Me)」下方與「Timeline」上方新增 **Skills（技能樹）** 與 **Credentials & Honors（榮譽與憑證）** 兩個資料驅動區塊的架構與技術契約。

---

## 1. 架構與定位

### 1.1 首頁版型位置
- 位於 `#about` section 內，於自我介紹文字 (`[data-about-copy]`) 之後、`#timeline` (`[data-about-timeline-root]`) 之前。
- 順序：`About Me (Intro text)` → `Skills` → `Credentials & Honors` → `Timeline`。
- 頂部 Navbar 的 `Home` 下拉選單提供獨立錨點：`#about`、`#skills`、`#credentials`、`#timeline`、`#contact`。

### 1.2 設計目標與原則
1. **可擴充性 (Scalability)**：無論技能與憑證項目增加到多少，都不會把頁面空間擠滿或導致垂直高度失控。
2. **單一真相來源 (SSOT)**：資料完全由 `data/Skills/skills.json` 與 `data/Credentials/credentials.json` 驅動，維護者只需編輯 JSON，前端 runtime (`about-skills.js` 與 `about-credentials.js`) 自動完成載入、投影與渲染。
3. **雙維度篩選與燈箱 (Credentials Showcase)**：憑證支援 `Type (種類)` 與 `Category (領域)` 雙維度切換，並提供主圖展示區、可滑動/切換的縮圖選單與全螢幕放大燈箱 Modal。
4. **主題與語系相容性 (Theme & Palette & i18n)**：全數吃全站 CSS Design Tokens (`var(--accent-color)`, `var(--card-bg)`, `var(--border-color)` 等)，並支援 `en` / `zh-Hant` / `zh-Hans` 多語動態切換。

---

## 2. 資料契約 (Data Contracts)

### 2.1 Skills Schema (`data/Skills/skills.json`)
```json
{
  "version": 1,
  "categories": [
    {
      "id": "languages",
      "title": { "en": "Languages", "zh-Hant": "語言能力" },
      "icon": "fa-solid fa-language",
      "items": [
        {
          "id": "traditional-chinese",
          "name": { "en": "Traditional Chinese", "zh-Hant": "繁體中文" },
          "level": "Native",
          "percentage": 100,
          "badge": "Native",
          "desc": { "en": "Mother tongue...", "zh-Hant": "母語..." }
        }
      ]
    }
  ]
}
```

### 2.2 Credentials Schema (`data/Credentials/credentials.json`)
```json
{
  "version": 1,
  "types": [
    { "id": "all", "label": { "en": "All Types", "zh-Hant": "全部項目" } },
    { "id": "offer", "label": { "en": "Admission Offer", "zh-Hant": "錄取通知" } },
    { "id": "transcript", "label": { "en": "Academic Transcript", "zh-Hant": "歷年成績單" } },
    { "id": "exam", "label": { "en": "Test & Examination", "zh-Hant": "能力檢定" } },
    { "id": "certificate", "label": { "en": "Degree & Diploma", "zh-Hant": "學位證書" } },
    { "id": "award", "label": { "en": "Honor & Award", "zh-Hant": "獎項榮譽" } },
    { "id": "competition", "label": { "en": "Competition", "zh-Hant": "競賽" } }
  ],
  "categories": [
    { "id": "all", "label": { "en": "All Domains", "zh-Hant": "全部領域" } },
    { "id": "tech", "label": { "en": "Engineering & CS", "zh-Hant": "資訊工程" } },
    { "id": "academic", "label": { "en": "Academic & Research", "zh-Hant": "學術研究" } },
    { "id": "language", "label": { "en": "Language", "zh-Hant": "語言" } }
  ],
  "items": [
    {
      "id": "nus-mcomp-ai-offer",
      "title": { "en": "NUS Master of Computing in AI Admission Offer", "zh-Hant": "國立新加坡大學 人工智慧碩士錄取通知" },
      "type": "offer",
      "category": "tech",
      "date": "2025-05",
      "issuer": { "en": "NUS School of Computing", "zh-Hant": "國立新加坡大學資訊學院" },
      "document": "assets/documents/credentials/nus-mcomp-ai-offer.pdf",
      "summary": { "en": "Official admission offer letter...", "zh-Hant": "正式錄取通知書..." }
    }
  ]
}
```

---

## 3. 前端 Runtime 規範

### 3.1 `assets/js/about-skills.js`
- 掛載於 `[data-about-skills-root]`。
- 負責載入 `data/Skills/skills.json`，提供類別切換頁籤與左右導向按鈕。
- 各類別共用相同的展示卡片容器，切換時以動態 transition 呈現進度條滑入。

### 3.2 `assets/js/about-credentials.js`
- 掛載於 `[data-about-credentials-root]`。
- 負責載入 `data/Credentials/credentials.json`，渲染 `Type` 與 `Category` 雙維度 Filter Chips。
- 展示區包含：
  - **主視覺區 (Main Showcase)**：顯示當前選擇憑證的圖片、發照單位、日期、標題與詳細描述。
  - **縮圖選單列 (Thumbnail Carousel Bar)**：提供縮圖卡片與左右滑動按鈕。
  - **燈箱檢視 (Lightbox Modal)**：點擊主圖片或「放大檢視 (Zoom / Full Preview)」按鈕可喚起 Modal，方便閱讀高解析度成績單或證書內容。
