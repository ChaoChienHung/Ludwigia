# TODO

> [!TIP]
> **寫作與筆記主題（Writing & Notes Backlog）** 已獨立收錄於 [ARTICLES.md](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/ARTICLES.md)。  
> 本文件（`TODO.md`）專注於網站系統工程、UI/UX 設計、自動化工作流、效能與架構相關的任務追蹤。

## 寫法約定（每個 task 都要有交付條件）

- 每個 task 至少包含一行 `交付條件：...`（可驗收、可勾選、可重現）
- 優先寫「行為」與「影響範圍」（哪些入口頁/哪些工作流）
- 若變更影響 index/schema，交付條件必須包含「search-index.{json,js} 已更新並納入版本控制」
- 若變更影響使用方式/約定/寫作語法，交付條件必須包含「文件同步」（依 `AGENTS.md` Doc Map）

## Task Framing（Priority vs Ownership）

- `P0..P4` 表示重要性 / 影響範圍，不等於實作成本
- `Agent-friendly` 表示規則清楚、驗收清楚、可在少量確認下委派完成
- `Author-driven` 表示使用者 / 作者的判斷、品味、命名、方向或寫作意圖很重要，不適合過度委派
- 一個 task 的 priority 高，不代表它就是 `Author-driven`
- 若一個 task 雖然重要，但規格清楚、路徑清楚、幾乎不需要額外拍板，就可以放在 `Agent-friendly`
- 快速判斷：
  - 如果 task 的核心是「把東西做出來」，偏 `Agent-friendly`
  - 如果 task 的核心是「決定要做成什麼樣子 / 想表達什麼」，偏 `Author-driven`

- [x] Standardize `<draft>` block authoring structure: Update documentation with `<draft>` outline patterns & Outcome Bias example
  - [x] 已完成什麼：已更新 `AGENTS.md`、`docs/author/writing-notes.md`（新增 `## Draft 骨架編寫規範` 及《結果偏誤》文章範例）、`docs/specs/parser-spec.md`、`docs/specs/content-metadata-spec.md`、`docs/design/design.md`、`docs/rules/checklist.md` 與 `docs/rules/guardrails.md`
  - [x] Review 重點：確認各份文檔中的 `<draft>` 骨架約定（`重點：內容` 或層級化清單）與範例是否完整且與現有規格保持一致

- [x] SMR and Paxos Notes: Add State Machine Replication and Paxos Structured Notes
  - [x] 已完成什麼：新增 `notes/state-machine-replication-and-paxos-structured-notes/`，整理 SMR 和 Paxos 結構化筆記，包含 SMR 背景與 FLP 不可能性定理、Paxos 各角色與 terminology、二階段算法細節、P2/P2a/P2b/P2c invariants、以及 liveness 與實務議題。
  - [x] Review 重點：確認筆記的架構層次、排版與 wording 是否合適，以及產生的 HTML 與 `search-index.{json,js}` 是否如預期能被 Digital Garden 入口載入。

- [x] Notes Draft：整理 `Paxos Made Moderately Complex` 結構化筆記與題庫草稿
  - [x] 已完成什麼：新增 `notes/paxos-made-moderately-complex-structured-notes/`，整理 PMMC 的 SMR 問題設定、Replica / Leader / Acceptor invariants、Scout / Commander 分工、安全性鏈條、fault tolerance sizing，並補上與 Raft 的對照；另附一份約 15 題的外部 question bank
  - [x] Review 重點：確認主 flow 是否要更偏「第一性原理 / intuition」或更偏「課堂複習版整理」，以及 quiz 的難度分布、題幹語氣與 tags 是否符合你之後想延伸的寫作方向

- [x] Search / Sorting：收斂 Search 與 section landing 的 sorting UI，並把 relevance 相容語意補回文件
  - [x] 已完成什麼：桌機 sort 改成 icon trigger + viewport-level popover，mobile 維持 drawer；Search 保留 `Default` 作為 relevance / search engine ranking 的 UI 入口，手動 sort 則覆寫目前結果集合排序
  - [x] 文件同步：已更新 `docs/specs/system-spec.md`、`docs/tech/search-and-recommendation.md`、`docs/design/design.md`
  - [x] Review 重點：確認 dropdown 不再被 results 蓋住、trigger icon 會隨升降方向變化、`Default` 顯示成 tag 形式且 Search / landing 的排序心智一致

- [x] Companion placeholder：先拿掉目前 companion avatar 圖，但保留 runtime 邏輯與未來擴充文檔
  - [x] 已完成什麼：settings 先收成 placeholder 說明，只保留 copilot；補 `docs/specs/companion-spec.md` 與 `docs/guide/companion-guide.md`，把 companion 的位置、大小、fallback 與擴充流程先定下來
  - [x] 文件同步：已更新 `docs/README.md`、`README.md`、`AGENTS.md`
  - [x] Review 重點：確認站上只剩 copilot 入口、companion 不會因舊 localStorage 再把 copilot 擋掉，且文件足以支撐之後重新開 companion


- [x] Landing Page Skills & Credentials Sections: 新增首頁互動式技能樹與榮譽憑證展示區塊
  - [x] 已完成什麼：
    - `Skills`：於 `index.html` 的「關於我」下方、Timeline 上方新增定高視窗之分類技能量表與左右切換按鈕，資料由 `data/Skills/skills.json` SSOT 驅動。
    - `Credentials & Honors`：新增支援 `Type`（獎狀、成績單、證書、感謝狀）與 `Domain`（學術、工程、體育、志工）之雙維度篩選展示視窗，提供主圖展示、可動態切換之縮圖 Option Bar 與全螢幕放大燈箱 Modal，資料由 `data/Credentials/credentials.json` SSOT 驅動。
    - `Navbar & i18n`：更新頂部 Navbar Home 下拉選單連結，補齊 `core/i18n.js` 多語文案，並完整繼承全站 Palette & Theme Design Tokens。
    - `Tests & Docs`：新增 `tests/test_skills_credentials_data.py` 單元測試（`python3 cli.py test` 41 項測試全數通過），並建立 `docs/specs/skills-credentials-spec.md` 與同步更新 `AGENTS.md`、`README.md`、`docs/README.md` 等全套文檔。
  - [x] Review 重點：確認首頁 `#skills` 與 `#credentials` 的互動、類別切換、縮圖選單、燈箱 Modal 與深淺主題/Palette 呈現是否符合預期。

## Agent-friendly

### P0

- [x] 我感覺我們可以在關於我下方Timeline上方加上兩個page，一個是skills, 另一個是achievements, 之所以先上skills是因為我們這樣才能在後面利用achievements去佐證我的skills。
  - [x] 然後我在想，我們的achievement應該要娶一個更general的名字才對，因為achievements理論上比較偏向於有得獎的成就，但我其實想做的是把各種獎狀、成績單、感謝狀都放進去，所以應該要更general一點。然後我其實在想的是最簡單餓方是一定是用一個carousel然後showcase所有的獎項，但這樣是不是很容易變得很雜亂？所以我在想我們理論上應該要有一個可以讓reader選擇種類的方式，然後主要分兩種，一種是category，另一種是type，分別代表這個是獎狀(Awards)、成績單(Transcripts)還是其他，然後另一個category代表的則是哪一個領域的，比如academic, basketaball, volunteer, 等等的。然後這樣我們就可以用carousel(我們可以試試看horizontal or vertical)的方式來showcase，其中不只有一個main showcase image的section旁邊或下面要有一個小的option bar，裡面都是縮小版的image，且可以有向左向右或著向上向下的箭頭，用來看更多achivement照片。
  - [x] 然後另一個膽就是關於skills了 這部分我比較頭痛，因為理論上我們應該想一個可以讓skills scale但同時不會把空間站滿的方式。我感覺就一樣吧，我們用多個section bar charts來showcase不同skills之間的能力值，然後單一section或單一bar charts所顯示的能力就是相同genre的，比如說我第一個想到的是language，然後我們就可以在這個section/bar charts裡有Indonesian, Traditional Chinese, Simplified Chinese, English這四種。然後不同section或不同bar charts的切換則使用左右按鈕。這樣就可以讓多個section/bar charts共用一個空間但又可以scale。scale的方式就是等我skills超過一定量，我們就可以把它拆分成更細的bar chart。

### P1

- [ ] Projects：新增 `create_project` workflow，讓 project source of truth 可自動生成 / 更新 `pages/projects.html`
  - [ ] 問題：目前 project 內容更新後仍要手動改 `pages/projects.html`，容易漏改、重複改、也不利於長期擴充
  - [ ] 方向：把每個 project 收斂成獨立 source（例如 `projects/<slug>/<slug>.md` 或 manifest-driven source），再由 `create_project` 生成/更新 `pages/projects.html` 所需內容
  - [ ] README parse：若 project repo 以 `README.md` 作為主要內容來源，需定義哪些章節/欄位屬於可 parse contract、哪些內容只保留為自由敘述不進結構化輸出
  - [ ] README parse：優先討論並收斂最小可解析章節，例如 `## Introduction`、`## Key Features`；缺席時允許留空，不強迫每個 project 都補齊全部欄位
  - [ ] README parse：需決定 heading match 規則（大小寫、同義名稱、語系變體）、list / paragraph 的接受格式，以及遇到額外章節時是忽略、保留 raw content，還是作為延伸欄位
  - [ ] 契約：至少定義 `title`、`slug`、`summary`、`status`、`anchors`、`links`、`key features`、`project scope`、排序/置頂欄位，以及多語內容怎麼掛
  - [ ] 守門：維持現有 `pages/projects.html#karen` / `#mentorion` / `#detoxio` / `#piggynest` / `#scriba` / `#sesame` / `#vellichor` deep link 不退化；不要把 `create_project` 做成另一個萬用 page builder
  - [ ] 交付條件：至少能用 1 個 project source 自動更新 `pages/projects.html` 的對應區塊，並定清楚後續新增/修改 project 的唯一工作流

- [x] Mobile UX & UI Optimization: 全站手機版人體工學與介面優化
  - [x] 已完成什麼：
    1. **升級底部導覽列（Mobile Bottom Nav）與啟用 Bottom Sheet**：在 `core/script.js` 與 `assets/css/site/shared.css` 中將手機底欄升級為 4 大核心入口（`Home | Portfolio | Search | Menu`），點擊 Menu 即可滑出半透明磨砂抽屜（`mobile-nav-sheet`），支援首頁章節錨點跳轉（About, Skills, Credentials, Timeline, Contact）、全站探索入口（Projects, Garden, Labs, Settings, More Hub）以及單篇閱讀頁的大綱（TOC）、文章資訊（Meta）與專注閱讀模式切換。
    2. **修復 Credentials 縮圖列表向右破版**：為 `.credentials-thumb-bar` 與 `.cred-thumb-strip` 補齊 `min-width: 0`、原生順暢觸控滾動與箭頭固定樣式，徹底解決原本縮圖列表將右側導航箭頭擠出螢幕外（x ≈ 899px）的嚴重跑版問題。
    3. **重構 Timeline Scale 按鈕為 iOS 風格 Segmented Control**：將手機視口下的三顆按鈕轉為緊湊膠囊分段控制器，解決原本因字元寬度不足造成的文字擠壓與折行問題。
    4. **修復 Tag 詳情頁 Grid 錯位重疊**：在媒體查詢中針對 `.hub-card.hub-card--stack` 與 `.tag-summary-card` 強制維持垂直 flex 流式佈局，修復標籤描述與統計卡片相互覆蓋的顯示問題。
    5. **優化 Hero 首屏比例與搜尋框邊距**：手機下調整圓形頭像大小為 190px，避免單一照片佔滿 100vh；並調整搜尋框內部圖示與按鈕內邊距，防止 Placeholder 在 390px 寬度下被截斷。
    6. **手機標題與內文字級微調（Responsive Clamp Typography）**：針對手機視口（<= 991.98px）以 clamp 調整 `section h2, .section-title`（收斂至 1.4rem~1.68rem）、`.hero h1 / p` 與 `.page-text`，避免大標題壓迫感過強與內文邊界過窄。
    7. **Skills 標籤與百分比強制並排對齊（Side-by-Side Meta Alignment）**：在 `about-skills.js` 與 `shared.css` 中封裝 `.skill-meta` 為 `inline-flex` + `flex-shrink: 0` + `white-space: nowrap`，確保 Native / Full Professional 等能力標籤與百分比數字永遠維持在同一行右側對齊，徹底解決因標題長度不同導致忽而並排忽而上下疊的問題。
    8. **Timeline 手機由上至下垂直時間軸全新重構（Vertical Top-to-Bottom Timeline）**：
       - 在手機下將時間軸重新設計為乾淨俐落的由上至下垂直流式時間軸。
       - 左側呈現垂直發光貫穿軸線（Spine）、精準定位之里程碑節點（Marker）與連向卡片的水平引線（Connector）。
       - 點擊卡片時即時在卡片內部原地展開詳細內容（Inline Detail Expansion，含期間時長、詳情描述與參考連結），隱藏手機下分離的底部詳情區塊，打造直覺且極致優雅的單元卡片式閱讀體驗。
       - 橫向旋轉手機（Landscape 844x390）自動自適應維持垂直軸線與全寬卡片，無任何橫向溢出。
    9. **Hub 頁面（Portfolio & More）全站架構對齊與 i18n 系統化**：
       - 建立 `i18n/portfolio.json` 與 `i18n/more.json`，將 `pages/portfolio.html` 與 `pages/more.html` 接入 `core/i18n.js`，徹底解決 Hub 頁面語言切換失效問題。
       - 作品集（Portfolio）四顆按鈕（`Projects | Notes | Writing | Canvas`）重構為 4 等分響應式 Grid 排版，手機與桌機均保持單行等寬並列。
    10. **CSS 冗餘代碼清除與手機版響應式層級整理**：
       - 清除 `shared.css` 中被 `display: none !important` 遮蔽的失效 clamp 舊規則。
       - 技能項目重構為標題滿寬（Title Row）+ 徽章與百分比對齊（Meta Row）的雙層流式佈局，徹底根治長技能名在手機窄屏擠壓破版問題。
       - 榮譽憑證（Accolades）下載按鈕支援 `Download` / `Download Document` 雙模文字，並調校字級比例消除「Button 大字小」視覺失衡。
  - [x] Review 重點：以手機視口（<= 767.98px 與 390x844 / 844x390）確認底欄 4 鍵導覽、全新由上至下垂直 Timeline 節點與引線、Skills 標籤並排、標題字級舒適，桌機端橫向時間軸與各功能 100% 無退化。

### P2

- [ ] Navbar SSOT：把全站 navbar 收斂到 `pages/_shared/navbar.html`，並讓 content/page shell 都吃同一份來源
  - [ ] 問題：目前 navbar 同時散落在首頁、`pages/*.html`、`tag/`、`labs/` 與各 content page 的已展開 HTML；`tools/content_styles/_shared/partials/navbar.html` 只覆蓋部分生成流程，無法真正保證全站同步
  - [ ] 決策：navbar 的單一來源應升格到 `pages/_shared/navbar.html`，而不是繼續放在 `tools/content_styles/_shared/`
  - [ ] Source of truth：`pages/_shared/navbar.html` 負責全站 page-level chrome；`Home` dropdown 內的 `About / Timeline / Contact`、`Projects` dropdown 與站點級入口都從這裡維護
  - [ ] Pipeline：`notes / writing / canvas` 內容頁應在生成階段吃這份 shared navbar，而不是各自保留一份展開後 HTML；避免 runtime fetch，維持 `file://` / 靜態站可用
  - [ ] Scope：至少涵蓋 `index.html`、`pages/*.html`、`tag/index.html`、`labs/index.html`、`notes/**`、`writing/**`、`canvas/**`
  - [ ] 遷移：盤點哪些頁面目前仍是手寫 navbar、哪些頁面由內容生成器輸出；先統一路徑與責任，再收斂舊的 `tools/content_styles/_shared/partials/navbar.html`
  - [ ] 守門：不要讓 navbar SSOT refactor 破壞 nested paths、`file://` 情境、theme/palette runtime、mobile nav 與既有 deep links（例如首頁 `#about` / `#timeline` / `#contact`）
  - [ ] 交付條件：新增 `pages/_shared/navbar.html` 並讓至少 1 個 page shell 與 1 個 content page 生成流程吃同一份來源，且確認修改 navbar 後不需再手改多份 HTML

- [ ] Timeline：手機端點擊事件支援直達站內關聯文章（Direct Article Link on Event Tap）
  - [ ] 背景與現狀：手機端 Timeline 目前收斂為極簡高可讀性單元卡片（僅呈現時間、類別、標題與 Summary 精華），已移除繁瑣的長內文與子項目原地展開，確保垂直流動乾淨不雜亂。
  - [ ] 方向：評估讓具備延伸連結（`references` 包含 `canonical` 或站內文章連結）的事件，在手機端被點擊時，能直達導流至該篇 Note 或 Writing 文章，提升深度閱讀連貫性。
  - [ ] 規格：定義點擊行為與視覺 hint（如標題旁或右上角呈現跳轉 icon / arrow），若無關聯文章則維持純卡片展示，不影響桌機橫向軸線與現有 references 點擊。
  - [ ] 交付條件：實作手機點擊跳轉機制並更新 `docs/specs/timeline-design-spec.md`。


## Author-driven

### P0

- [ ] Performance：降低 Writing / Notes 單篇頁的開啟 latency（首屏載入與互動前等待偏高）
  - [ ] 問題：目前點開 `writing/**` / `notes/**` 單篇頁時體感 latency 偏高，需找出主要瓶頸（HTML 體積、同步腳本、特效初始化、第三方資源、DOM 操作等）
  - [ ] 範圍：至少涵蓋單篇 Writing / Note 頁，不含 `pages/search.html` / section landing / Garden landing
  - [ ] 量測：先做 baseline profiling（至少記錄 1 篇 writing + 1 篇 note 的載入時間與主要成本），再決定優化順序
    - [ ] 指標：至少記錄 `DOMContentLoaded`、`load`、首次可互動前等待、長任務（long tasks）、主要 JS 執行時間、DOM node 數、HTML 大小、關鍵資源數量
    - [ ] 場景：至少分「冷啟動首次進頁」與「同站內第二次進頁」兩種情境；必要時補手機 viewport
    - [ ] 產出：留下 baseline 數據與簡短觀察，能對照優化前後差異
  - [ ] 候選方向：評估 lazy parsing / deferred parsing，避免首屏就同步解析所有附加區塊或非必要內容；需明確定義哪些內容可延後、哪些必須首屏可用
    - [ ] 優先保留首屏即時可用：正文內容、基本 metadata、首屏排版必要 CSS、theme/palette 狀態恢復
    - [ ] 優先評估延後：related posts、TOC/overlay 初始化、quiz/QA prompt、reading time 計算、Markdown export、theme 特效、非首屏互動 widget
    - [ ] 守門：lazy parsing 不能破壞 `file://` / 靜態站情境、不能要求第二份內容來源、不能讓正文首屏變空白或跳動過大
  - [ ] 下手順序：先確認 bottleneck 在 runtime JS 還是輸出 HTML / 模板，再決定優先改哪一層
    - [ ] 若主因是同步初始化與 DOM 操作：先拆 `core/script.js`，把非首屏必要邏輯改成 deferred / idle / interaction 後初始化
    - [ ] 若主因是 HTML 體積與頁面初始負擔：先檢查單篇頁模板與輸出策略（哪些附加區塊可不在首屏完整展開）
    - [ ] 若兩邊都有：先做低風險收益高的 runtime defer，再回頭整理模板/輸出結構
  - [ ] 交付條件：能指出主要 latency 來源，完成至少一輪優化，並確認 Writing / Notes 單篇頁的首屏體感有明顯改善；若有調整載入策略或共用腳本，需同步更新相關文件

- [ ] Responsiveness：整理 typography 與 layout 的 responsiveness（font size/spacing/欄寬隨裝置調整，含手機）
  - [ ] 共用 responsive layout：breakpoints + grid/container 規則（後續 widget/頁面只要對齊 layout 即可）
  - [x] Note / Writing typography：把 `font-size`、`padding`、`margin`、heading scale 做成 responsive tokens / breakpoints，依 screen size 調整
  - [x] Reading Mode：responsive 對齊一般模式的 typography rhythm，只保留必要的閱讀輔助差異
  - [ ] Section landing：Notes/Writing/Canvas 的 search bar + filter + feed（含小螢幕行為）

  - [x] Background effect 參考：先以 `https://codepen.io/mdusmanansari/pen/BamepLe` 的氛圍語彙做出第一版 `Garden` ambient effect，並接進既有 `Effects` 開關
    - [x] 已落地：首頁 / note page 的 `Garden` theme 會顯示低對比 bloom + pollen + stem silhouette ambient layer，`Effects` 關閉時完全收起，不直接搬整個 CodePen 場景
    - [ ] follow-up：之後再微調粒子密度、邊緣分佈與手機版存在感，確認是否還要再更偏 `Garden landing` 的語彙
    - [ ] follow-up：補強可辨識的花莖/枝條結構，讓花形與花瓣雨之外也有更自然的 plant support，但仍需守住正文可讀性

- [ ] Settings：重做 Effects toggle 的設計
  - [ ] 方向：未來再把 `Effects` 的開關做成更精緻的 toggle / switch，但要先收斂尺寸、邊框、active 狀態與 theme/palette 的視覺責任分工
  - [ ] 守門：目前先維持簡單、穩定、可辨識的 `On / Off` layout；不要為了 toggle 視覺破壞設定面板可讀性
  - [ ] 交付條件：至少產出一版明確的 toggle 視覺方案，並確認在 `dark / light / sky / garden` theme 與不同 palette 下都不會出現邊框、顏色責任或 active 狀態混亂

- [ ] Sky Theme：把 settings pills 做成更自然的 cloud pills
  - [ ] 方向：參考 `https://codepen.io/joshnh/pen/AEaGjA` 那種雲朵語彙，但只套用在 settings pills；不要再把 `block / callout` 一起改成雲形
  - [ ] 守門：先完成 `settings-pill` 與 `garden-tag` 的結構解耦，避免 settings 專用設計污染站內其他 tag 元件
  - [ ] 交付條件：至少落地一版在 `sky theme` 下清楚可辨、不卡字、不影響 active/hover 狀態的 cloud pills，並確認 modal sidebar 與 pills 的 theme 視覺一致

- [ ] Explore：radial tree / graph（基於 tags + links）

- [ ] Explore：神經網路/graph 視覺化（用 neural network 圖呈現 notes/writing/canvas 的關聯；可用 Google AI Studio）

- [ ] Search：把 `pages/search.html` 擴成 full personal website scope，而不只吃 content search index
  - [ ] 問題：目前 `pages/search.html` 的核心資料源主要是 `search/search-index.{json,js}`，偏向 `notes/`、`writing/`、`canvas/`；未來可能還要查 `projects`、`about`、`contact`、首頁與其它入口頁
  - [ ] 方向：優先評估「在現有 search engine 外掛額外資料源 / adapter / aggregator」而不是直接把 core search engine 改成大雜燴
  - [ ] 守門：維持 `file://` / 靜態站可用；不要讓現有 `notes` / `writing` / `canvas` 搜尋退化
  - [ ] 交付條件：至少產出一版可擴充設計，讓 `pages/search.html` 能同時搜尋 content 與 site pages，且未來新增入口頁不需重寫整套 search core

- [ ] Explore：站內 Copilot / 對話式導覽入口
  - [ ] 想法：未來可讓使用者直接和站內 copilot 對話，詢問這個 personal website 的資訊，例如 `contact`、`about`、`projects`、`article / writing`、`notes` 等內容
  - [ ] 方向：先把它視為 conversational entry，而不是獨立的聊天產品；優先回答「怎麼找資訊」「哪篇文章適合先看」「聯絡方式在哪裡」這類站內導覽問題
  - [ ] 入口：第一版優先放在 `misc / More` 裡作為其中一個選項，而不是獨立長一顆新入口；避免過早把 copilot 升格成主導航
  - [ ] 資料來源：需先釐清它讀哪些 source of truth，例如 `search/search-index.{json,js}`、首頁 `about/contact`、`projects` 頁與其它 site pages；避免另外手維護第二份 FAQ/知識庫
  - [ ] 守門：維持靜態站思維，先設計成可 progressively enhance 的前端入口；不要讓 copilot 變成唯一資訊入口，也不要讓原本 search / 導覽退化
  - [ ] fallback：若目前模型 / API 無法幫忙，直接明說現在無法協助，並提供 `pages/search.html` 作為替代入口，而不是輸出模糊答案
  - [ ] 交付條件：至少先產出一版設計規格，清楚回答入口位置、可回答的問題範圍、資料來源、fallback 行為，以及沒有 LLM / API 時如何退回站內 search / 導覽

- [ ] Deep Sea：魚尾擺動動畫偶爾與身體解離
  - [ ] 問題：魚在擺尾時某些 frame 會出現尾巴與身體斷開/錯位，破壞整體流暢感
  - [ ] 方向：檢查魚身/尾巴的 transform origin、關節連接方式、關鍵影格與不同尺寸下的幾何比例
  - [ ] 交付條件：至少在 1 個 note/writing 頁與 1 個 section/search 入口確認魚群動畫不再出現明顯尾身解離

### P2

- [ ] Canvas：定義 `snap / collection` 的 metadata 與輸出契約（最小單位是 `一張圖 + caption? + tags + date`）
  - [ ] 資料模型：最小單位先收斂成 `snap`，至少包含 `image`、`caption?`、`tags`、`date`；之後若需要地點、人物、來源、裝置等欄位，再明確擴欄，不先預設塞太多 metadata
  - [ ] 關聯模型：`collection` 本質上是管理/策展用的分類容器，可收多個 `snap`，且同一個 `snap` 也可被多個 `collection` 重用；避免把同一張圖複製成多份內容
  - [ ] Collection 類型：先支援像 `people`、`place`、`food` 這類 collection 類別，但不要把 type 寫死成只有少數固定 enum；需保留後續擴充其它策展維度的彈性
  - [ ] People collection：若 collection 類型是人物，可評估在 collection landing / dashboard / 封面放該人物代表照片，底下再呈現該人物相關的多張 `snap`
  - [ ] Opt-in feature：人物 collection 後續可研究用 local model 對照片中的指定人物做 detect / segment / outline，並把非目標區域做 blur / 去色一類的弱化處理；但這必須是 opt-in feature，預設渲染仍維持原圖不變
  - [ ] Future feature：後續可研究讓部分 `snap` 在模型幫助下生成輕量動態效果（例如人物微動、頭髮/衣角/天空微動畫、照片呼吸感），但這應屬於獨立 opt-in 的衍生層，不應成為 Canvas 的預設輸出要求
  - [ ] 守門：Canvas 的 source of truth 仍應是原始 `snap` metadata 與原圖；額外的 segmentation / highlight 結果若存在，應視為衍生層，不可反過來綁死基本內容工作流
  - [ ] `tools/create_content.py`：補齊 Canvas `snap` / `collection` 專用 metadata schema，至少釐清 `image`、`caption`、`date`、`tags`、`collection refs` 怎麼表達
  - [ ] `tools/create_content.py`：評估是否需要 `--mode canvas-snap|canvas-collection` 一類的明確生成模式，而不只靠 `--content-dir canvas`
  - [ ] `snap` source 草案：先用接近現有 `<meta>` contract 的 `.md` 形狀驗證，例如 `canvas/snaps/alice-riverside/alice-riverside-zh-tw.md`
    
    ```md
    <meta>
    Title: Alice 在河堤邊
    Tags: people, riverside, sunset
    Summary: Alice 在傍晚河堤邊散步的抓拍。
    Slug: alice-riverside-zh-tw
    Output: canvas/alice-riverside/alice-riverside-zh-tw.html
    Image: assets/canvas/alice-riverside.jpg
    Date: 2026-06-13
    Collections: alice, riverside-walks
    Lang: zh-Hant
    Status: published
    </meta>

    Alice 在傍晚河堤邊回頭的瞬間。
    ```
  - [ ] `collection` source 草案：先假設 collection 也是 `.md` source，例如 `canvas/collections/alice/alice-zh-tw.md`
    
    ```md
    <meta>
    Title: Alice
    Tags: people, portrait, daily life
    Summary: 收集 Alice 在不同場景中的照片。
    Slug: alice-zh-tw
    Output: canvas/collections/alice/alice-zh-tw.html
    CollectionType: people
    CoverImage: assets/canvas/alice-cover.jpg
    SnapRefs: alice-riverside-zh-tw, alice-cafe-zh-tw, alice-station-zh-tw
    Lang: zh-Hant
    Status: published
    </meta>

    這個 collection 收納 Alice 在不同場景與時刻的 snap。
    ```
  - [ ] `tools/create_content.py --mode` 草案：先以 `canvas-snap` 與 `canvas-collection` 作為最小模式，例如 `python tools/create_content.py --mode canvas-snap --source canvas/snaps/alice-riverside/alice-riverside-zh-tw.md`，以及 `python tools/create_content.py --mode canvas-collection --source canvas/collections/alice/alice-zh-tw.md`
  - [ ] Collection page 最小 render：先收斂成 `封面 / dashboard + title + summary + tags + snap count + snap grid`；若是 `people` collection，封面可放代表照片，內容區先以該人物相關的 `snap` grid 為主，後續再評估 timeline、masonry、filter、segmented-highlight overlay 或輕量 photo motion
  - [ ] 交付條件：至少先定出一版 `snap` 與 `collection` contract，並用 1 個 `snap` 被 2 個不同 collection 重用的例子驗證資料模型可行

- [ ] Page Mode：Notes/Writing/Canvas 的 default 視覺仍由全站 Theme/Palette 決定，但允許單篇頁 opt-in 開啟 custom page / custom style
  - [ ] 目標：標準內容仍走 `tools/create_content.py` + theme/style；真的要做特殊視覺時才明確 opt-in，不把標準生成器變成萬用 page builder
  - [ ] UX：可評估在 meta sidebar 放一個 optional 開關入口
  - [ ] Default：未開啟時，行為與現在完全一致，不影響既有使用者偏好與頁面呈現
  - [ ] Opt-in：開啟後允許該頁套用自己的設計（例如注入 page-specific class / CSS vars / stylesheet），但不影響其它頁
  - [ ] Persist：開關狀態需定義保存策略（例如 localStorage 以 page path 為 key），且不破壞既有 localStorage 相容性
  - [ ] 交付條件：挑 1 篇 note 開/關切換，確認不影響搜尋/跳轉與 Reading Mode，可在 `file://` 或本機伺服器情境運作

- [ ] Typography：針對不同 Mac 螢幕尺寸 / pixel density 收斂更穩的 responsive 字體策略
  - [ ] 問題：16-inch MacBook Pro 上目前字級剛好，但在 Mac mini 對應螢幕上體感偏大，代表目前字級策略對 viewport / density / viewing distance 的適配還不夠穩
  - [ ] 方向：重新檢查 breakpoints、container width、base font-size、heading scale、line-height 與 `clamp()` 範圍，不只看手機/桌機，還要看不同桌機螢幕與 laptop 的閱讀距離
  - [ ] 驗收：至少覆蓋 16-inch laptop 與較小桌機螢幕兩種情境，讓正文與 section landing 的字級都不會出現「一邊剛好、一邊偏大」的問題
  
- [ ] Refactor：把 section landing、Search、Garden 現在各自維護的那套「同一份索引資料怎麼轉成卡片 / tag / filter / sort」規則收斂成 shared util
  - [ ] 目標：不要再讓 `assets/js/section-landing.js` 與 Search/Garden 各自複製一份相似但不完全一樣的資料整理 / render 規則

- [ ] Portal：新增一個 portal 頁面，作為「已成熟完成的功能世界」入口
  - [ ] IA：先明確區分 `Labs` 與 `Portal` 的責任邊界；`Labs` 收 draft / prototype / plan / 實驗中功能 / 半完成成果，`Portal` 則承接已經成熟、可穩定進入的完成品世界
  - [ ] 角色：`Portal` 不只是把連結堆在一起，而是作為一個有世界觀的總入口；像從主站進入不同成熟功能領域的傳送中樞，例如 `Garden` 未來可作為其中一個完整世界
  - [ ] 視覺概念：整體氛圍可往「像英雄聯盟班德爾城那樣的魔幻地帶」收斂，配色偏涼粉、夢幻、帶一點奇幻感與門戶能量感，但仍需控制可讀性與資訊層級
  - [ ] 頁面最小結構：可先收斂成 `hero / world intro + portal hub grid + world detail panel(or overlay) + labs/return entry`；hero 負責交代這裡是完成品世界入口，hub grid 負責承接多個 portal，detail panel 用來補充當前 portal 的世界說明與 CTA
  - [ ] 頁面 wireframe 草圖：由上到下可先收斂成 `Portal Hero`（一句世界觀文案 + 入口定位）→ `World Intro`（說明這裡是成熟功能世界）→ `Portal Hub Grid`（多個傳送門）→ `Focused World Detail`（目前選中的世界細節 / preview / CTA）→ `Labs / Back to Main Site` 入口
  - [ ] Portal 本體：頁面中可有多個傳送門，每個 portal 門面本身持續有微動畫、流光、紋理或形態變化，讓不同世界在入口階段就有辨識度
  - [ ] Portal 元件：每個 portal card / 門至少先定義 `world name`、`一句話描述`、`portal visual`、`進入 CTA`、`狀態/成熟度`、`preview asset`；必要時再加 tags、estimated experience、推薦入口或世界特徵
  - [ ] Preview：每個 portal 可直接展示與該世界/功能相關的 preview 圖或 ambient visual；也可評估改成 hover / focus 後才顯示 preview，避免首頁資訊量過重
  - [ ] Preview 規則：桌機可先評估 `default 顯示弱 preview + hover/focus 強化 preview`，或 `default 只顯示 portal visual、hover/focus 才展開 preview`；手機則優先以 tap 展開 detail / preview，不依賴 hover
  - [ ] Portal card 狀態：桌機可先定義 `default`（只見門體、世界名、弱動效）→ `hover/focus`（門面動效加強、顯示一句話描述與 preview）→ `selected`（detail panel 同步切換並出現進入 CTA）；手機則先定義 `default` → `tap 展開` → `再次 tap / CTA 進入`
  - [ ] 互動：需定義 preview、hover、focus、tap 在桌機與手機上的對應行為；不能只依賴 hover，手機也要有明確入口
  - [ ] Garden world 示例：`Garden` 可作為第一個 portal world 試做，portal visual 可偏花園入口 / 植物能量門 / 花窗；preview 可顯示 Garden landing、Patch view、tag exploration 或 floral asset 的局部畫面，讓使用者在進門前就知道這個世界偏探索與生長感
  - [ ] Garden world 文案草案：可先用類似「進入一個會生長、可探索、可漫遊的知識花園」當一句話描述；detail 區再補 `Garden 是探索 notes / writing / canvas 關聯、Patch 視角與 tag 生長路徑的世界`
  - [ ] Garden preview 構成：第一版可先由 `Garden landing hero 截圖 + Patch view 局部 + floral asset 紋理 + tags/paths 的局部 UI` 組成；先求能傳達世界氣質，再決定是否做成動態 ambient preview
  - [ ] 守門：portal 視覺再酷，也不能破壞導覽清晰度、讀取效能、`file://` / 靜態站可用性與既有 theme/palette workflow
  - [ ] 交付條件：至少先產出一版 portal IA 與 low-fi 方案，明確列出哪些入口屬於 `Labs`、哪些入口屬於 `Portal`，並用 1-2 個已成熟世界做 prototype 驗證

- [ ] Companion（Live2D/Canvas）：加入可選「陪伴物」，預設關閉；效果目標參考 https://blog.recsys-frontier.com/article/ai-daily-2026-03-20 的右側小狗
  - [x] Spike：先完成 P0 placeholder 驗證版，已接上桌機限定 companion shell、Settings 開關、lazy runtime、localStorage/reset 與基本 layering 守門；下一步再評估 `live2d-widget` + `canvas#live2d`
  - [ ] License/Asset：確認 Live2D widget 與模型素材的授權可用（避免直接搬別人的小狗 model）
  - [x] Vendor：已收斂為本地 vendor avatar；目前使用 DiceBear `Thumbs`（CC0 1.0）變體，避免外部依賴並支援本機靜態預覽
  - [ ] Model：挑一個可公開使用的模型（或自製簡化版），放到 `assets/live2d/`（json + textures + moc）
  - [ ] Loader：新增最小 loader（只在 enabled 時載入 js/model），避免首屏成本與避免破壞 SEO/互動
  - [x] Settings：已放進 Settings；可切換 on/off，並提供 reset position
  - [x] Copilot Contract：已落地 `Companion Off -> 固定 Copilot`、`Companion On -> 以 Companion 取代入口`，並補上極簡 sheet / Search fallback 
  - [x] UX：已支援拖曳 reposition、固定 anchor reset，並補上 avatar 眼睛跟隨滑鼠的最小互動
  - [ ] Layering：定義 z-index/遮擋規則（sidebar 需蓋住；不阻擋 navbar/主要點擊；手機版可自動關閉）
  - [x] Persist：位置/開關已用 localStorage 保存，且已提供 reset 入口
  - [ ] Perf/Fail-safe：載入失敗時自動降級（不報錯、不阻塞），並記錄最小 debug 資訊（僅 dev）

### P3

- [ ] Notes：評估做一個圖書館風格的 landing，作為 notes 的另一種入口敘事
  - [ ] 想法：除了現在的 section landing，也許可以用 library / shelves / catalog 的隱喻，把筆記整理成更像館藏的入口
  - [ ] 守門：不應破壞現有 `notes/index.html` 的可搜尋與 tag filter 能力；可以先從視覺 / IA 層 prototype

- [ ] Reading Typography：重新設計 `note / writing` 的閱讀字體策略
  - [ ] 問題：目前內容頁正文仍偏保守地使用 system sans stack，雖然安全，但質感與「長文閱讀體驗」還沒有被刻意設計；它也沒有明確區分於首頁 / landing 偏品牌展示的字體語氣
  - [ ] 目標：讓 `note / writing` 同時具備「閱讀友善」與「有質感」，特別要考慮中文 / 英文混排、長段落閱讀、數學公式、code block、callout、table 與 metadata sidebar 的整體節奏
  - [ ] 任務：先定方向，是走更成熟的 sans 閱讀風格，還是改成「英文 serif + 中文 serif fallback」之類更有出版感的方案；至少產出 2 組候選 font stack 做對照
  - [ ] 任務：一起檢查字重、字級、行高、段落間距、heading rhythm，不只換 `font-family`
  - [ ] 守門：不能為了質感犧牲可讀性；也不要讓內容頁字體語氣跟首頁 / brand UI 完全斷裂

- [ ] Projects Page i18n：讓 `pages/projects.html` 支援多語言文案
  - [ ] 問題：目前 `pages/projects.html` 的 hero、navbar dropdown、project card title/description/section labels 仍主要是英文內容；未來若全站支援多語言，projects 不能成為孤島
  - [ ] 方向：先盤點哪些是共用 UI 文案、哪些是專案內容文案；共用 UI 優先接 runtime i18n，專案描述再決定要走 page bundle、字典檔，還是獨立多語內容結構
  - [ ] 任務：至少覆蓋 `Project Showcase`、`Key Features`、`Project Scope`、navbar / footer / carousel caption 與各 project card 的主要描述
  - [ ] 驗收：在 `site language = zh-Hant` 與 `en` 之間切換時，`pages/projects.html` 的共用 UI 與 project 文案都能跟著切換，且不破壞既有 anchor / deep link
  - [ ] 守門：不要讓多語 refactor 破壞 `pages/projects.html#karen` / `#mentorion` / `#detoxio` / `#piggynest` / `#scriba` / `#sesame` / `#vellichor` 等現有連結

- [ ] Timeline Data Contract：把首頁的 `Timeline` 收斂成獨立 section 的 source-driven data 機制
  - [ ] IA：維持它是首頁上的獨立 section，與 `About Me` 並列但分工清楚，不互相吞沒
  - [ ] Source of truth：把 timeline event 從前端 JS 常數搬到獨立 data file（規劃為 `data/Timeline/timeline.json`）
  - [ ] Runtime 分層：timeline JS 只負責 `load / validate / normalize / project / render`，不要再兼任 authoring data 本體
  - [ ] 最小 schema：先固定 `id`、`type(point|period)`、`scale(macro|meso|micro)`、`at/start/end`、`title`、`summary`、`detail?`、`references?`
  - [ ] Period fallback：若 `period` 支援 `start_*` / `end_*` 欄位，需定清楚缺席時 fallback 回共用 `title / summary / detail`
  - [ ] Scale contract：改用明確的 source facet，而不是 view 層硬編碼過濾；`macro -> Macro + Meso + Micro`、`meso -> Meso + Micro`、`micro -> Micro only`
  - [ ] Projection：`period` 第一版仍投影成 `period-start / period-end` 兩點；先不要急著長出 span layer
  - [ ] 日期排序：authoring 可接受 `YYYY` / `YYYY.MM` / `YYYY.MMDD` 這類 sortable string，但視覺層不強求真實月 / 日比例尺
  - [ ] 載入策略：確認要直接 fetch JSON，還是額外生成 JS preload / inline preload 以兼容 `file://`
  - [ ] 多語：localized text contract 要能支援 `zh-Hant / en / zh-Hans`，避免 timeline 又長成單語孤島
  - [ ] 遷移：把目前 hard-coded timeline data 全部搬出 JS，並保留既有 desktop / mobile UI skeleton

- [ ] Question Bank：把 note 題目從 inline `qquiz` 逐步收斂成每個 note folder 內的獨立 JSON 題庫
  - [ ] 問題：目前題目直接寫在 source `.md`；但 Reading Mode、`Copy Markdown` / `Download Markdown`、search index 的 core markdown 都不把題目當正文核心內容，導致 article SSOT 與 exam asset 混在一起
  - [ ] 方向：每個 `notes/<slug>/` 先允許放一份或多份 `questions.<lang>.json`；題目來源先以「本站自己的 note 內容出題」為主，不急著處理外部網站題庫匯入
  - [ ] ID 規則：`note-level id` 直接沿用 note 的 `canonical_id`；每份 question bank 內只要求 `question-level local id` 唯一；聚合時再組成 `global question id = ${canonical_id}::${question_id}`
  - [ ] 最小 schema：先收斂成 `question_id`、`lang`、`question_type`、`prompt`、`choices?`、`answer`、`explanation?`、`difficulty`、`tag_concepts`、`review_status`、`last_review_date`
  - [ ] note contract：source `.md` 不再直接承載完整題目正文；後續改成只 reference 對應的 question bank / selector，讓 article content 與 question asset 的責任分離
  - [ ] 聚合：先定一版掃描規則，讓系統能從 `notes/**/questions*.json` 自然回推它屬於哪篇 note，並沿用該 note 的 `canonical_id` / `tag_concepts` 做整理
  - [ ] 守門：不能破壞現有 `reviewkit / qquiz / qprompt` contract；第一版應先支援 external bank 與 inline quiz 並存，再評估 migration，而不是一次把舊內容語法全部拔掉
  - [ ] 交付條件：至少定出一版 `questions.<lang>.json` schema、`canonical_id + local question_id` 的聚合規則，以及 1 篇 note 的最小示例，能證明同 folder 題庫、題目聚合與 concept-based 搜索可行

- [ ] Labs：作為 draft / prototype / future plan / experimental feature 的集中入口；其中可包含 Earth 入口頁（Companion selector），讓使用者選擇不同陪伴物（動物/人物/物品）陪伴瀏覽
  - [ ] 角色：`Labs` 應偏向「還在長、還能變、可以試」的區域，承接未來想法草稿、實驗功能、半成品與已做出但尚未升格成正式世界的東西
  - [ ] 與 Portal 分工：當某個實驗方向已經成熟、穩定、可長期作為站內完整入口存在時，再從 `Labs` 升格進 `Portal`

## Discussion

1. Web performance（latency / throughput / bundle）
   - 先量化（Lighthouse）再訂 budget；再談 code splitting / lazy load / 特效可關閉
   - 下一步：挑 `garden/index.html` 與 `pages/search.html` 各跑一輪 baseline
2. Future prototypes：如何把 `future/` 裡的 3D / immersive prototype 融入個人網站，而不是永遠停留在獨立 demo
   - 可先討論哪些層級適合承接：首頁 hero、Labs / More 入口、獨立 portal page，或作為可選的 page mode / experimental mode
   - 目前候選至少包含 `future/massive-multiplayer-laser-tag/` 與 `future/cosmic-flow/`；前者偏 3D / game-like personal page fantasy，後者偏氛圍型互動宇宙/粒子流
   - 下一步：先釐清這些 prototype 在個人網站中的角色，是 brand expression、探索入口、作品展示，還是真的要變成可日常進入的 IA 節點
3. Future visual language：`future/GalaxyWhale .png` 是否可收斂成網站中的主視覺 / mascot / theme asset
   - 可先討論它比較適合放在首頁 hero、Labs / future showcase、theme 插畫資產，還是作為某種 companion / ambient visual 的起點
   - 需要一起評估這張圖是單次視覺靈感，還是能延伸成一套較穩定的視覺語言（例如 galaxy / deep sea / cosmic creature 的混合品牌感）
   - 下一步：若方向成立，可再拆成「品牌角色定位」、「使用場景」、「靜態圖到互動效果的演進路線」三個子題
4. Local translation models：研究 `Qwen` / `Llama` / `GPT` 類模型在可本機運行的小模型區間（約 `7B–15B`）上的翻譯 benchmark 表現
   - 目標：找出在中英翻譯或多語 page 翻譯上表現夠好、且可接受本機部署成本的模型，作為之後這個 repo 做 page 翻譯的候選 workflow
   - 評估面向：翻譯品質、術語穩定性、長文一致性、速度、VRAM / quantization 需求、授權可用性，以及 instruction-following 對固定輸出格式的配合度
   - 下一步：先盤點公開 benchmark / leaderboard 與實測文章，收斂 3-5 個候選模型；若方向成立，再定義「啟動本地模型 -> 丟單篇 page source -> 產出可進 repo 的翻譯草稿」的最小流程
5. Retrieval / recommendation experiments repo：可比照 local translation models 的做法，另外開一個 repo 專門跑 recommendation system / document retrieval 相關實驗
   - 目標：把較重的模型測試、benchmark、資料集整理與實驗腳本從主站 repo 拆開，避免把 Ludwigia 本體變成研究 sandbox，同時保留可回流的結論與 workflow
   - `ColBERT` 可作為其中一個重要候選，因為它特別適合 document retrieval 類場景：保留 late interaction 的 token-level matching 能力，比一般單向量 embedding retrieval 更有機會抓住段落或文章之間的細粒度相關性
   - 可一起放進候選清單的方向還包含：傳統 embedding retrieval baseline、reranker、hybrid retrieval，甚至未來若要做內容推薦，也可延伸成「retrieval first, recommendation second」的實驗框架
   - 也可一併研究 `vector database` 與相關 retrieval infrastructure，例如索引建立、ANN search、metadata filtering、hybrid search 與 reranking pipeline，避免只測模型本身而忽略整體系統設計
   - 下一步：先定義新 repo 的 scope，是偏 document retrieval benchmark、站內 related-content / recommendation prototype，還是較泛化的 retrieval lab；再決定第一批要驗證的資料集、評估指標、baseline 與技術棧
