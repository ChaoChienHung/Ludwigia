# Ludwigia 多語言 (i18n) 新增與擴充指南

本指南詳細說明 Ludwigia 網站的多語言 (i18n) 架構設計，以及未來若要新增一門全新語系（例如日文 `ja`、德文 `de` 或法文 `fr`）時的完整操作步驟與注意事項。

---

## 1. 架構設計與 SSOT 單一真相來源

Ludwigia 採用 **資料驅動 (Data-Driven)** 與 **Key-Based** 的可擴充多語言架構：

1. **SSOT 翻譯字典檔**：
   - 全站 UI 標籤、導覽列、頁面標題與動態組件文案統一存放在 [data/i18n/translations.json](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/data/i18n/translations.json)。
   - 技能與憑證的資料內容則分別存放在 [data/Skills/skills.json](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/data/Skills/skills.json) 與 [data/Credentials/credentials.json](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/data/Credentials/credentials.json)。

2. **聲明式 HTML 佔位符 (`data-i18n-key`)**：
   - HTML 中的元素可加上 `data-i18n-key="nav.skills"` 或 `data-i18n-attr="placeholder"`。
   - 由 [core/i18n.js](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/core/i18n.js) 負責載入字典並進行全自動 DOM 替換。

3. **統一前端 JS API (`window.LudwigI18n`)**：
   - 全站動態模組（如 `about-skills.js`, `about-credentials.js`, `copilot.js`）統一呼叫 `LudwigI18n.t('key.path', fallback)`。
   - 支援即時語系切換監聽 (`window.addEventListener('ludwig-language-changed')`)，無刷新動態重繪。

---

## 2. 新增一門新語言的 4 大步驟（以日文 `ja` 為例）

當你需要新增一門新的語言（例如日文 `ja`）時，請依序執行以下 4 個步驟：

### 步驟一：更新 `data/i18n/translations.json`

在 `supportedLanguages` 中註冊新語系，並在 `translations` 的每個 Key 下補上該語系的對應翻譯文案：

```json
{
  "version": 1,
  "supportedLanguages": [
    { "code": "en", "label": "English" },
    { "code": "zh-Hant", "label": "繁體中文" },
    { "code": "zh-Hans", "label": "簡體中文" },
    { "code": "ja", "label": "日本語" }
  ],
  "translations": {
    "nav": {
      "skills": { 
        "en": "Skills", 
        "zh-Hant": "技能樹", 
        "zh-Hans": "技能树", 
        "ja": "スキル" 
      }
    }
  }
}
```

### 步驟二：更新資料檔多語欄位 (`skills.json` & `credentials.json`)

在 `data/Skills/skills.json` 與 `data/Credentials/credentials.json` 的每個 `title`、`issuer`、`summary` 或 `label` 物件中補上 `"ja": "..."` 翻譯：

```json
{
  "id": "nus-deans-list-ay2526-sem2",
  "title": {
    "en": "NUS Dean's List (AY2025/2026 Semester 2)",
    "zh-Hant": "國立新加坡大學院長嘉許名單 (AY2025/2026 第二學期)",
    "zh-Hans": "国立新加坡大学院长嘉许名单 (AY2025/2026 第二学期)",
    "ja": "シンガポール国立大学ディーンリスト (AY2025/2026 第2学期)"
  }
}
```

### 步驟三：在 `core/script.js` 與語系切換選單中加入新語系

1. 在 `core/script.js` 的 `normalizeLang` 與 `getLanguageLabel` 函式中補上新語系正規化邏輯：

```javascript
const normalizeLang = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "ja" || raw.startsWith("ja-")) return "ja";
  // ...
};

const getLanguageLabel = (lang) => {
  if (lang === "ja") return "日本語";
  // ...
};
```

2. 在頂部導覽列與設定 Modal 的語言切換選項中加上對應的 `<a href="#" data-lang="ja">日本語</a>` 選項。

### 步驟四：執行自動化測試驗證 (`cli.py test`)

執行 Python 測試套件，確保資料 Schema 正確且未破壞既有契約：

```bash
python3 cli.py test
```

---

## 3. 注意事項與 Fallback 機制 (Best Practices)

1. **強固的 Fallback 鏈**：
   - 當新語系 (`ja`) 的某個 Key 尚未翻譯時，系統會自動退回 `zh-Hant`（繁體中文），若仍無則退回 `en`（英文）或原作者預設文字，確保**永遠不會顯示為空白或遺失**。

2. **保留 Markdown 與結構標籤**：
   - 在翻譯自然語言時，請勿改寫 Key 名稱、`Status` 狀態碼（如 `published` / `drafting`）、內部 HTML/Markdown 結構標籤或 URL 網址。

3. **Ontology Concept Tag 對齊**：
   - 若新增標籤 (Tags)，請同時檢查 `data/Ontology/` 內的 Concept Label，確保各語系皆有齊備的名稱定義。
