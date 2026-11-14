# Realm 境域架構與擴充規範（Realm Architecture & Extension Spec）

本文件詳細規範 Ludwigia 跨維度完成態世界（Realms）的目錄標準、導航契約、專屬測試分離機制，以及將新世界接入 Aetheria Portals 傳送門的標準作業流程（SSOT）。

---

## 1. 核心概念與職責邊界

Ludwigia 將探索性頁面依「成熟度」與「互動型態」清楚劃分為兩大樞紐：

| 樞紐 | 目錄位置 | 狀態定位 | 代表範例 |
| :--- | :--- | :--- | :--- |
| **Portals (Realms)** | `portals/realms/<realm-id>/` | **已完成、穩定、可長期體驗**的沉浸式互動世界 | `garden`（數位花園）、`world`（2.5D 生活世界） |
| **Labs** | `labs/<prototype-id>/` | **實驗中、演化中、輕量驗證**的原型展示 | `shooting-mode`、`massive-multiplayer-laser-tag`、`question-bank` |

每個 Realm 皆為一個獨立、自包含（Self-contained）的子系統，擁有自己的視圖渲染邏輯、資產與專屬測試。

---

## 2. Realm 目錄標準結構

新 Realm 必須放置於 `portals/realms/<realm-id>/` 目錄下，其推薦檔案結構如下：

```
portals/realms/<realm-id>/
├── index.html                   # [必備] 境域靜態入口，支援本機與純靜態伺服器直接開啟
├── tests/                       # [必備] Realm 專屬測試目錄
│   └── test_<realm-id>_data.py  # [必備] 境域專屬資料、契約與元件測試
├── assets/                      # [推薦] 境域專屬靜態資產（CSS、JS、圖片、音效）
├── js/                          # （可選）原生 JS 引擎或模組
├── data/                        # （可選）若採資料驅動（如角色、劇情），放創作真相來源 JSON
└── <source-app>/                # （可選）若採 React/Vite 等現代框架，源碼獨立於子目錄
```

### 關鍵路徑契約（Path & Navigation Contract）
1. **深度為 3 級**：`portals/realms/<realm-id>/` 相對於專案根目錄之深度固定為 3（`../../../`）。
2. **返回導覽契約**：Realm 內部的 Header、HUD 或返回按鈕，其目標網址**必須嚴格指向 `../../index.html`**（即 Aetheria Portals 傳送門大廳），不得指向站點根目錄或 labs。
3. **全站 Design Tokens 繼承**：若需使用全站 11 套主題色盤，應引用 `../../../assets/css/site/palette-tokens.css`。

---

## 3. 專屬測試與動態聚合契約（Test Isolation & Aggregation）

為避免個別世界的專屬測試（如 NPC 台詞檢查、花園元件測試）污染根目錄 `tests/`，Ludwigia 採用**分散維護、自動聚合**架構：

```
tests/test_misc_data.py          (根目錄聚合器：透過 importlib 自動掃描發現)
   │
   ├── 掃描 ──> portals/realms/world/tests/test_world_data.py
   └── 掃描 ──> portals/realms/garden/tests/test_garden_data.py
```

### 運作原理
- 每個 Realm 在自己的 `portals/realms/<realm-id>/tests/` 底下撰寫符合標準 `unittest` 規範的 `test_*.py` 測試檔案。
- 根目錄的 [tests/test_misc_data.py](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/tests/test_misc_data.py) 定義了動態 `load_tests` 協議，在執行 `python3 cli.py test`（或 `python3 -m unittest`）時，會自動迭代 `portals/realms/*/tests/` 並動態掛載所有符合 `test_*.py` 的模組。
- **無感註冊**：新增 Realm 時，**完全不需要修改 `tests/test_misc_data.py`**！只要檔案放在對應目錄下，全站 CI / 測試即會自動納入守門。

---

## 4. 傳送門大廳註冊協議（Portals Hub Registration）

完成 Realm 的開發後，需將其以維度門戶（Portal Gateway）形式登錄至 Aetheria Portals 大廳：

### 步驟 4.1：在 `portals/src/data/portalsData.ts` 登錄門戶
在 `PORTALS_DATA` 陣列中新增一個 `PortalItem` 物件：

```typescript
{
  id: 'portal-<realm-id>',
  name: '境域名稱（例如：星霄秘境）',
  shape: 'celestial-circle',       // 門戶外型：organic-oval | celestial-circle | waterfall-mirror | 等
  natureContext: '門戶周邊的自然奇觀描述...',
  x: 1600,                         // 2D 全景畫布 X 坐標 (0 ~ 3600)
  yPercent: 35,                    // 2D 全景畫布 Y 百分比高度 (0 ~ 100)
  width: 280,
  height: 280,
  rotation: 0,
  colors: {
    primary: '#06b6d4',
    secondary: '#0284c7',
    accent: '#7dd3fc',
    glow: 'rgba(6, 182, 212, 0.5)',
    vortexGradient: ['#082f49', '#0284c7', '#38bdf8', '#0c4a6e'],
    shadowColor: '#0369a1',
  },
  signpost: {
    label: '界標 03 · 星霄碑',
    destination: '星霄秘境 (Starry Realm)',
    subtext: '向深空躍遷至星霄世界',
    material: 'floating-stone',    // 界標材質：mossy-wood | floating-stone | crystal-base
    offsetX: 140,
    offsetY: -30,
    statusText: '引力共鳴良好 · 直通星霄世界',
    runeSymbol: 'ᚱ',
  },
  worldDetails: {
    realmName: '星霄秘境 · Starry Realm',
    realmType: '星辰浮島生態系',
    climate: '清冽薄空、微風恆常',
    energySource: '星核磁浮引力',
    guardian: '星穹觀測士',
    lore: '世界觀背景傳說故事...',
    visualPreviewPrompt: 'Scenic visual prompt...',
    audioPreset: 'astral',         // 環境音律：wood | astral | waterfall | crystal
    keyFeatures: [
      '直通星霄世界：一鍵躍遷漫遊',
      '特色亮點 2',
      '特色亮點 3',
    ],
    travelCaution: '旅人注意事項...',
  },
  // 🌟 重要：躍遷目標必須為相對於 portals/index.html 的相對路徑
  targetUrl: './realms/<realm-id>/index.html',
  targetLabel: '星霄秘境 (Starry Realm)',
  badgeText: '直通星霄秘境',
}
```

### 步驟 4.2：（可選）在 TopBar 增加常駐快捷躍遷鈕
若該 Realm 屬於一級重大世界，可在 [portals/src/components/TopBar.tsx](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/portals/src/components/TopBar.tsx) 的 `Zone 3` 區域新增快速傳送按鈕：
```tsx
<a
  href="./realms/<realm-id>/index.html"
  className="px-2.5 md:px-3 py-1.5 rounded-xl bg-... border text-xs font-semibold flex items-center gap-1.5 transition-all"
  title="前往 <Realm Name>"
>
  <YourIcon className="w-3.5 h-3.5" />
  <span className="hidden sm:inline"><Realm Label></span>
</a>
```

### 步驟 4.3：重新編譯傳送門大廳
執行自動化建置命令：
```bash
python3 cli.py build-portals
```
該指令將自動在 `portals/` 下透過 Vite 編譯，輸出靜態 `portals/index.html` 與更新 `portals/assets/`。

---

## 5. 新增 Realm 擴充標準檢核表（Extension Checklist）

當需要建立一個新 Realm 時，請依序完成以下檢查：

- [ ] 1. **目錄建立**：建立 `portals/realms/<realm-id>/` 與 `index.html`。
- [ ] 2. **導航契約**：確認內部返回按鈕連結為 `../../index.html`。
- [ ] 3. **測試建立**：建立 `portals/realms/<realm-id>/tests/test_<realm-id>_data.py`，驗證該世界的必要資產、資料與標記結構。
- [ ] 4. **門戶登錄**：在 `portals/src/data/portalsData.ts` 註冊門戶資料，設定 `targetUrl: './realms/<realm-id>/index.html'`。
- [ ] 5. **傳送門編譯**：執行 `python3 cli.py build-portals` 重編大廳產物。
- [ ] 6. **版控白名單（若有）**：若該 Realm 含有需被靜態站直接引用的 build 產物目錄，請在 `AGENTS.md` 與 `docs/specs/system-spec.md` 的白名單中登記。
- [ ] 7. **全站驗證**：執行 `python3 cli.py test`，確認新測試被自動發現並全數 PASS。
