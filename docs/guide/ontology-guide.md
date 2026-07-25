# Ontology Guide

這份文件是 `data/Ontology/tags-ontology.json` 的實際維護手冊。

目標不是解釋 ontology 是什麼，而是回答這些日常問題：

- 什麼時候需要改 ontology
- 新增一個 tag concept 時要補哪些欄位
- 既有 tag 應該補 alias，還是拆成新 concept
- `en / zh-Hant / zh-Hans` 應該怎麼維護
- 改完之後要跑哪些命令確認沒有漏

## 什麼時候要改

遇到下面任一情況，就應該同步檢查 ontology：

- 新增 note / writing / canvas，且 source metadata 裡出現新 tag
- 既有 tag 想改顯示文字
- 想把不同語言或不同寫法的 tag 收斂到同一概念
- tag detail / search filter / related tags 出現同概念分裂
- 新增一個 UI 語言，且 tag label 也需要跟著顯示

如果只是正文改字、但 `Tags:` 沒有變，通常不用動 ontology。

## 最小原則

- 每個 concept 都要有穩定的 `concept_id`
- 每個 concept 都至少要有：
  - `labels.en`
  - `labels.zh-Hant`
  - `labels.zh-Hans`
- 顯示文字可以依語系不同，但概念識別只能有一個
- 未來如果同一概念有更多別名，優先加到 `aliases`，不要直接複製一個新 concept

## concept 與 alias 怎麼判斷

### 應該加 alias 的情況

- 只是大小寫不同
- 只是單複數、縮寫、常見拼法差異
- 是同一概念的中英文寫法
- 是同一概念的歷史舊名

例子：

- `Machine Learning`
- `machine learning`
- `ML`
- `機器學習`
- `机器学习`

這些都應該 map 到同一個 `concept.machine_learning`

### 應該拆新 concept 的情況

- 雖然字很像，但語意不同
- 原本是大類，現在要拆成兩個不同主題
- 搜尋 / tag detail / related tags 不應該再被視為同一組內容

例子：

- `Data` 不應該自動併成 `Data Mining`
- `Learning` 不應該自動併成 `Machine Learning`

## 新增 concept 的步驟

在 `data/Ontology/tags-ontology.json` 的 `concepts` 陣列內新增一筆：

```json
{
  "concept_id": "concept.example_topic",
  "labels": {
    "en": "Example Topic",
    "zh-Hant": "示例主題",
    "zh-Hans": "示例主题"
  },
  "aliases": [
    "example topic",
    "Example topic",
    "示例主題",
    "示例主题"
  ]
}
```

### `concept_id` 命名規則

- 用 `concept.` 開頭
- 主體用 snake_case
- 優先用英文概念名，不要直接用中文
- 保持穩定，避免把顯示文字硬編進 ID

好例子：

- `concept.machine_learning`
- `concept.system_design`
- `concept.active_recall`

避免：

- `concept.ml_tag`
- `concept.zh_machine_learning`
- `concept.machine-learning`

## 三語 label 的維護原則

### `en`

- 作為概念主名稱
- 盡量用 repo 內最常見、最自然的英文寫法

### `zh-Hant`

- 優先用台灣/繁中常見譯名
- 若社群已有穩定習慣譯法，優先跟常見用法一致

### `zh-Hans`

- 不要省略
- 不要全部直接複製 `zh-Hant`
- 若是專有名詞或品牌名不適合翻，可保留原文

### 真的不確定怎麼翻時

先遵守下面優先順序：

1. 專業社群最常見譯法
2. 現有 repo 內已使用的中文寫法
3. 若兩者都沒有，再用可理解且穩定的暫時譯名

如果暫時無法定案，也仍然要先補三語欄位；真的不適合翻譯時可以先保留英文原文。

## Ontology Context / Glossary 的寫法原則

如果某個 concept 不只需要 label，還需要補 `context` / definition / glossary 類說明，優先遵守這個順序：

1. 先回答「它是什麼」
2. 再回答「它拿來做什麼」或「它在這裡扮演什麼角色」

換句話說，不要一開頭就只講用途，卻沒有先交代這個詞本體在 ontology 上屬於什麼。

### 先回答「它是什麼」

優先先幫讀者建立 category anchor，例如它是：

- 一種狀態
- 一種機制
- 一個流程
- 一條路徑
- 一種節奏
- 一個指標
- 一個協議
- 一個任務
- 一個方法或演算法

不一定要硬套固定名詞，但至少要先讓讀者知道「這個詞本體是哪一類東西」。

### 再回答「它拿來做什麼」

在 category anchor 之後，再補它的用途、作用、適用情境或它在更大流程中的位置。

這樣的順序比「一開始只講用途」更穩，因為讀者會先知道自己正在理解的是什麼類型的概念，而不是只拿到一段懸空的功能描述。

### 避免的寫法

- 一上來只說「它用來...」
- 直接列 use case，卻沒先說它是任務、演算法、流程還是指標
- 把 category 與作用混成一句，導致讀者看完仍不知道這個詞本體是什麼

### 推薦模板

可以優先用這種骨架：

```text
X 是一種 / 一個 ...
它主要用來 ... / 它的角色是 ...
```

例如：

```text
Clustering 是一種非監督式學習任務。
它主要用來把彼此相似的資料點分群，幫我們揭露沒有標註資料中的潛在結構。
```

而不是：

```text
Clustering 用來把資料分群，幫助我們找出潛在結構。
```

後者雖然沒有錯，但少了「它本體是什麼」這個第一個錨點。

## 改完後一定要跑

最少跑這兩個：

```bash
python3 cli.py check-tags
python3 cli.py test
```

### `check-tags` 在驗什麼

- 所有 source tags 都能 map 到 ontology concept
- 每個 concept 都有 `en / zh-Hant / zh-Hans`

### `cli.py test` 在驗什麼

- `create_content` self-test
- `unittest`
- `py_compile`
- `check-tags`

## 常見操作範例

### 1. 新增了一篇文章，tag 用到新字串

症狀：

- `python3 cli.py check-tags` 報 missing ontology mappings

處理：

1. 判斷它是否只是既有 concept 的別名
2. 如果是，加到 `aliases`
3. 如果不是，新增一個新 concept
4. 補齊三語 labels
5. 重新跑 `check-tags`

### 2. 想把兩個寫法收斂成同一概念

症狀：

- `search / tag detail` 會把兩組內容分開

處理：

1. 選一個保留的 `concept_id`
2. 把另一種寫法移到 `aliases`
3. 不要保留兩個語意相同的 concept

### 3. 想修改顯示名稱

處理：

1. 改 `labels.en / zh-Hant / zh-Hans`
2. 舊寫法若仍需相容，加到 `aliases`
3. 重新跑 `build-all` 與 `check-tags`

## 常見錯誤

- 只補 `en`，忘了 `zh-Hant / zh-Hans`
- 把中文/英文各建一個 concept，導致同概念分裂
- 改了 label，卻忘了保留舊 alias
- source 有新 tag，但只改 `.md` 沒改 ontology
- 只跑 `python3 -m unittest`，沒跑 `python3 cli.py check-tags`

## 建議工作流

如果本次改動碰到 tags，建議照這個順序：

1. 改 source `.md` 的 `Tags:`
2. 更新 `data/Ontology/tags-ontology.json`
3. 跑 `python3 cli.py check-tags`
4. 跑 `python3 cli.py build-all --content-dir all`
5. 跑 `python3 cli.py test`

## 相關文件

- `README.md`：日常工作流與 `check-tags` 命令說明
- `docs/specs/system-spec.md`：tag schema / concept contract
- `docs/guide/language-guide.md`：多語與 locale-aware tag 擴充清單
- `docs/rules/checklist.md`：交付前檢查項
