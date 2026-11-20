# REVIEW

已完成、等待作者驗收的工作集中在此。頂層 `[ ]` 表示尚待審閱；項目內的 `[x]` 仍表示已完成的實作步驟。驗收後移除該項；若發現新工作，另立 `TODO.md` task。只記可核對的成果與 Review 重點，不把未開始的待辦搬進來。

## 待作者驗收

- [ ] Semantic ID 篇英文版（`Status: drafting`）
    - 已完成：新增 `notes/semantic-id-in-generative-recommendation/semantic-id-in-generative-recommendation-en.md` 與生成的 HTML，沿用雙語慣例（共用 `CanonicalId`、`Slug` 加 `-en`、`Lang: en`、`Tags` 不翻）；以改寫類比後的中文版為底意譯，`<information context>` 一併翻成英文，未翻作者用 `<draft>`。drafting 不進搜尋索引；文中 `content-link` 目前連到中文版（其他篇尚無英文版）。英文版把 TIGER 寫為 NeurIPS 2023、OneRec 寫為 2025（中文版仍是 2022／2024）。
    - Review 重點：通讀英文是否自然；確認上述兩個年份後是否同步修中文版；封面圖本身畫的是「Footwear | Sports | NIKE」的分類式 ID，和新版「不是分類樹」的說法相衝，決定是否換圖；看完把 `Status` 改成 `published` 並重跑 `cli.py build`。

- [ ] 推薦系統系列五篇去宣傳腔，Semantic ID 篇改寫分類樹類比
    - 已完成：級聯架構、從級聯到生成式、Semantic ID、RQ-VAE、RQ-Kmeans 五篇的 Title / H1、Summary 與帶宣傳腔的小標題改成直接說明範圍的寫法，`LastModified` 更新為 2026-11-20；其他筆記（PQ、GRID、RQ 兩篇等）指向這幾篇的 `content-link` 標籤同步換成新標題；`ARTICLES.md` §六.2、§六.4 標題同步。Semantic ID 篇依 `ARTICLES.md` §六.4 改寫「從 Atomic ID 到語意序列」一節：不再把 SID 說成生物分類／郵遞區號樹，改為每層共用碼本的殘差逼近（$x \approx e_1[c_1] + e_2[c_2] + e_3[c_3]$），後續 Token 是方向補償，用 GPS 位移與畫師筆觸比喻；保留「由粗到細」與乘法原理（並指出共用碼本才是 300 個碼向量的前提，真正的分類樹需要更多）；c1/c2/c3 例子、共享前綴、平滑退化、Hierarchical Softmax callout 與 takeaways 一併對齊。重生受影響 HTML 與搜尋索引。
    - Review 重點：新標題與小標題是否合意；Semantic ID 篇「為什麼不是分類樹：由粗到細的殘差逼近」一節的說法與比喻是否符合你的理解（尤其「c1 往往和大類有對應、後面幾層不宜解讀成具體屬性」的分寸）；英文版會以這版為底翻譯。

- [ ] 首頁標題改平實，頁面標題收斂為單一來源
    - 已完成：首頁標題改為「Ludwig Chao — Machine Learning Engineer · Research Engineer」（三語）；手寫頁面的標題只維護在 `i18n/*.json` 的 `title`，`cli.py build-pages` 由 `title.en` 生成 HTML 靜態 `<title>`，`--check` 與測試守門（`pages/projects.html` 因此由 `Projects — Ludwig Portfolio` 對齊為 `Projects — Ludwig`）；修正 `i18n/settings.json` 的 JSON 語法錯誤（Settings 頁原本整份翻譯載入失敗）；新增 i18n JSON 有效性與頁面對照表一致性兩項測試；首頁 head 補 `meta description` 與 `og:title`（`og:title` 也由 `build-pages` 跟著 `title.en` 生成）；移除 `core/i18n.js` 內殘留舊標題的 `home` fallback bundle，並更新首頁 `i18n.js?v=`；AGENTS、README、tech-stack、language-guide 同步。`cli.py test` 通過。
    - Review 重點：部署後用 LinkedIn Post Inspector 看預覽卡片；瀏覽器分頁標題在三種語言下是否正確；Settings 頁切到中文時，選項是否已翻譯。

- [ ] 引入 lennoxsaint/Skills 的 Council 與 Ship-ready
    - 已完成：新增 `skills/council-review/`（上游 council，含 4 份 references）與 `skills/ship-ready/`，依既有規則改名並更新互相引用（`council-review`、`verify-and-complete`、`COUNCIL_REVIEW_TASTE_FILE`）；加入 Toolkit 並保留上游 reference；新增 `skills/NOTICE-lennoxsaint-skills.md` 附上游 MIT 授權聲明（同時涵蓋先前引入的 11 個）。既有 11 個與上游最新版（11-18）一致，無需更新。Toolkit 頁面確認可展開、分頁正常。
    - Review 重點：兩者都需要能呼叫三家實驗室模型（GPT、Claude、Gemini/Grok）才能完整運作；上游註明 Ship-ready 尚未在真實任務上端到端跑過。

- [ ] 內容 metadata 前綴從 `garden:*` 遷移到 `site:*`
    - 已完成：生成器模板與 5 個手寫頁改輸出 `site:tags` / `site:summary`；重生 110 篇內容頁，diff 只有這兩行 meta，搜尋索引不變；`core/site/11-content-page.js` 改用 `readSiteMeta()` 讀 `site:*`，舊 `garden:*` 只作 fallback，順帶修好原本讀不到 `site:reading_time_minutes`、`site:source` 的問題；`tests/test_page_shell.py` 新增守門；README、spec、guardrails、checklist、技術文件同步。`cli.py test` 73 項通過。
    - Review 重點：打開幾篇 note / writing，確認閱讀時間、Copy / Download Markdown、tag 連結與相關文章正常。

- [ ] Toolkit：研究紀錄範本、學習類 Prompt、Skills 格式統一
    - 已完成：新增 `Experiment-log.md`（依日期的實驗日誌，最新一天置頂）與 `INSIGHT.md` 範本；新增「學習」用途與 5 個 Prompt（混合題型測驗出題、進階選擇題演練、答案評分與範例解答、對話轉筆記、個人化重點篩選）；中英兩版的出題 Prompt 收斂為一個條目，依網站語言預設顯示對應分頁；題數、題型、難度配比、讀者輪廓改成 `{{名稱：預設值}}` 可替換欄位；本站 6 個 Skill 補上 frontmatter；11 個引用 Skill 完整改成資料夾名稱（`name`、標題、`$` 呼叫名稱、互相引用、狀態資料夾 `~/.benchmark-climb` 等與環境變數如 `HIGH_STAKES_TASK_HOME`），上游名稱只留在 reference；`skills/README.md` 分成本站與引用兩區並附上游連結；`markdown-to-*` 與 `sync-md-from-html` 改寫為 `site:tags` / `site:summary` 並註明生成器仍輸出舊名。`cli.py test` 72 項通過，瀏覽器確認語言分頁切換與欄位高亮。Toolkit 預覽原本不支援 `####` 以下標題與表格（`core/search-core.js` 的 `renderMarkdownPreview`），已補上 h4–h6 與標準 pipe table，並更新 6 個頁面的 `search-core.js?v=` 快取版本；搜尋與 section 卡片的預覽共用同一個渲染器。
    - Review 重點：Prompt 名稱與摘要是否合意；`relevance-filter` 的預設讀者輪廓是你的個人描述，確認要公開；若本機曾用過舊名稱的狀態資料夾（如 `~/.hill-climb`、`~/.ambitious`），需自行搬到新名稱。

- [ ] 重構 Phase 3–5：runtime 分檔、CSS 分層、生成器拆模組
    - 交付條件：`create_content.py` 拆成 `tools/content/` 且所有輸出逐位元組不變；`core/script.js` 拆成 `core/site/` 並有 Node smoke test；`shared.css` 拆成分檔，ambient 抬升改為 opt-in；畫面行為不變（已知 bug 修正除外）。
    - 已完成：Phase 5 重生 110 篇與基準逐位元組相同；Phase 3 拆成 12 個依序載入的模組，所有頁面改由 `pages/_shared/runtime.html` 載入；Phase 4 拆成 11 個分檔，ambient 規則改 opt-in，並修正搜尋頁兩個 modal 在 ambient 主題下被改成 relative 的既有問題、排序抽屜改為 `div role="dialog"`。以無頭 Chrome 比對 computed style 確認新舊一致（細節見 `docs/tech/refactor-roadmap.md`）。
    - Review 重點（看畫面）：切換幾種 Theme（特別是 Galaxy、Deep Sea、Sky、Garden 並開啟動態效果）看首頁、搜尋頁、內容頁；在搜尋頁打開 Help 與 Tags 彈窗；手機寬度打開排序抽屜；內容頁的 Outline / Metadata、Reading Mode、quiz、複製 Markdown。

- [ ] Portals 閱讀性與 Labs 資源入口分工
    - 已完成：Portals 初訪提示窗、頂欄與門牌字級加大，頂欄保留克制的奇幻風；World 從 Labs 與 More 的獨立入口移除，仍由 Portals 進入；Toolkit 平時用直白名稱、密語模式顯示 Grimoire；增加 Template／Guide，種類與用途可交叉篩選，種類小標籤加粗；重建 Portals 靜態資產。
    - Review 重點：請在桌機和手機檢查 Portals 頂欄、初訪提示窗與門牌是否易讀；在 Labs 開啟／關閉密語，確認卡片和資源頁名稱同步切換；試用四種種類與用途篩選。

- [ ] 重構 Phase 2：手寫頁面 shell 收斂
    - 交付條件：手寫頁面的 navbar / footer 只有一個來源（`pages/_shared/`），由 `cli.py build-pages` 生成並有測試守門；內容頁 navbar 與 partial 一致。
    - 已完成：16 個手寫頁面（9 種 navbar 版本）改用標記區塊，由 `tools/build_pages.py` 生成，順便修掉 `notes/index.html` 多出的 `</div>`；新增 `pages/_shared/footer.html`；73 篇舊版生成的內容頁用目前生成器重生並重建索引；`tests/test_page_shell.py` 新增 4 項測試，`pre-push` 也會檢查。全套 64 項測試通過。
    - Review 重點（看畫面）：Labs 各子頁的 navbar 現在有 logo 和完整下拉選單；Portfolio / More 的桌面 navbar 從精簡的 Portfolio／Search／More 改成全站共用版本（手機底部導覽不受影響）；Projects 的 footer 改成全站統一樣式；抽看幾篇內容頁的 tag 顯示。

- [ ] 重構 Phase 1：hooks、白名單、部署路徑、Portals 依賴
    - 交付條件：`cli.py install-hooks` 可用；生成物白名單與現況一致；只保留一條部署路徑；Portals 移除未使用的依賴且 build 產物不變。
    - 已完成：補回 `.githooks/`（pre-commit 重生 staged 內容頁；pre-push 跑測試並擋下過期索引與 World 資料），兩個 hook 都在暫時的 worktree 實測過；`characters.json` 加入 AGENTS 白名單；移除 GitHub Pages workflow，部署收斂為 Cloudflare，`.assetsignore` 補排除 `.githooks/`、`.claude/`；Portals 移除 `@google/genai`、`express`、`dotenv`、`@types/express`、`esbuild`，重新 build 後 JS 逐位元組相同。
    - Review 重點：在本機執行一次 `python3 cli.py install-hooks`；到 GitHub repo 的 Settings → Pages 關閉 GitHub Pages；確認 Cloudflare 是自動部署（連 GitHub）還是手動 `wrangler deploy`。

- [ ] Portals 與 World 效能優化（讓成本跟著可見內容成長）
    - 交付條件：先量測再優化，取得桌面與手機的前後數據；World 的深度排序不再是 O(n²)；不退化視口中心縮放、牆面剪切矩陣、無閉環深度排序與 palette / theme 聯動契約；`portals/assets/` 重建；`cli.py test` 與 realm 測試通過；同步 spec / design / TODO。
    - 已完成（World）：深度排序改為「螢幕 x 欄位掃描線＋binary heap」（`isBehind` 規則不變）；地形改為初始化時分類一次，每幀只走訪視口格子並合併 fill；地面貼花、浮島崖壁與雲海、粒子加上視口裁剪；靜態實體改用 footprint 外框裁剪；HUD 的 DOM 寫入與 halo CSS 變數只在值改變時才寫；backing-store DPR 上限為桌面 2×、觸控 1.75×；通關密語遮罩或 modal 蓋住 canvas 時降到約 20 fps；支援 `prefers-reduced-motion`；觸控裝置的 HUD 改用實色表面，不做 backdrop blur。
    - 已完成（Portals）：spring 鏡頭改為按需 rAF，收斂後停止；日夜相位只掛載目前相位與淡出中的相位；`PortalComponent` 加上 `React.memo`，並以 `IntersectionObserver` 暫停畫面外的動畫；靈脈線拿掉 `feGaussianBlur`；進度條改用 `scaleX`；支援 `prefers-reduced-motion`；孢子數量依視口面積縮放；已重建 `portals/assets/`。
    - 量測（headless Chrome / CDP；桌面 1440×900 DPR 2，手機 390×844 DPR 3、CPU 4× 降速）：
        - World 手機：主執行緒忙碌 60% → 41%；每秒強制 layout 59 → 0；地形每幀 2.4–3.0 ms → 0.6–1.7 ms；每幀 JS 時間（8 個地點）例如深淵 5.5 → 3.1 ms、Minecraft 島 5.9 → 3.2 ms、抖音 5.8 → 4.3 ms、校園 6.4 → 4.7 ms。
        - World 桌面：主執行緒 36.6% → 26.1%；每幀 JS 時間例如抖音 7.6 → 6.5 ms、東區 5.8 → 4.1 ms、深淵 3.2 → 2.1 ms。
        - World 首次造訪（密語遮罩未解鎖）：手機主執行緒 62.8% → 20.7%，桌面 22.1% → 12.8%。優化前在遮罩下，東區曾量到 28 fps，p95 為 100 ms。
        - 深度排序擴展性（真實 footprint 複製 1–8 倍）：287 個實體 2.3 → 1.3 ms，1,148 個 25 → 1.7 ms，2,296 個 101 → 3.7 ms。在 11 個地點比對 3,647 組直接遮擋關係，新舊排序的違反數相同（皆為 2，來自閉環回復）。
        - Portals：合成層面積 57.7 → 20.9 MP（估計 GPU 記憶體：桌面約 880 → 320 MB，手機約 1.6 GB → 590 MB）；手機主執行緒 64% → 37.5%（script 20.7% → 7.5%，layout 4.3% → 1.6%）；桌面平移 52 → 58–60 fps；日夜切換 50.5 → 60 fps；DOM 節點 867 → 763。
        - 視覺回歸：World 在 10 個地點與 HEAD 版本逐像素比對，差異 ≤ 0.18%，只有時間相關的雪花、水晶脈動，以及一處長牆因 footprint 裁剪而不再錯誤消失。Portals 截圖肉眼一致。
    - Review 重點：headless Chrome 的合成器不等於手機 GPU，請在實機手機上走一圈 World（特別是抖音、東區、深淵橋）並平移 Portals，感受是否明顯變順；確認觸控裝置 HUD 從毛玻璃改成實色可以接受；確認靈脈線改成靜態光暈後的樣子；細節規則見 `docs/specs/realm-spec.md` §6。

- [ ] 重構 Phase 0：共用 theme preload 與技術文件
    - 交付條件：123 份相同的 inline theme / palette script 收斂成 `core/theme-preload.js`（生成器模板同步），行為完全等價；新增 `docs/tech/tech-stack.md` 與 `docs/tech/refactor-roadmap.md`。
    - 已完成：Node 比對 192 種 theme × palette 組合零差異；重新生成內容頁與替換後逐位元組相同；新增 `tests/test_page_shell.py`（5 項）；全套 61 項測試通過；theme guide、AGENTS、docs 索引已同步。
    - Review 重點：在瀏覽器切換幾種 Theme / Palette 後重新整理，確認首屏沒有閃爍；讀過 roadmap 後決定 Phase 1 的兩個選擇題（git hooks 補回或移除、保留哪條部署路徑）。

- [ ] Labs Grimoire 魔導書（Prompts & Skills）
    - 交付條件：Labs 新增 `labs/grimoire/index.html`，以 `data/Toolkit/toolkit.json` 為 SSOT；skill 條目直接讀 `skills/<name>/skill.md`，不複製第二份；靈力狀態由 `verified_at` 與 `stale_after_days` 在前端推導；版面沿用 tag 頁的總覽卡（總數、類型統計磚、流派 pill）；卡片點開後整列展開，左側渲染全文、右側顯示狀態與複製／下載／原始檔；三語切換與 Theme / Palette。
    - 已完成：資料檔與第一則 prompt（知識鷹架審稿）、3 個 skill 條目、`assets/js/grimoire-labs.js`、Labs 卡片；Labs 移除 Portals 卡片；新增 `tests/test_toolkit_data.py`。
    - Review 重點：所有條目的 `verified_with` / `verified_at` 目前都是 null（顯示「未經試煉」），請實際用模型測過後填入；確認要公開哪些 skill；在瀏覽器檢查桌面與手機版面。

- [ ] Layered Scaffolding & Frictionless Progression Contract: 建立知識邏輯階層化鷹架與零割裂閱讀流契約
  - [x] 已完成什麼：
    - **非退化硬契約**：在 `AGENTS.md` 加入「知識邏輯與閱讀流暢度契約（階層化鷹架與零割裂推進原則）」，定調「底層成群鋪墊、逐層向上堆疊、零跳躍、零割裂」，徹底消除認知斷崖。
    - **Backlog 寫作指南**：在 `ARTICLES.md` 頂部確立所有未來待辦長文與技術筆記必須嚴格遵守此原則。
    - **寫作技巧與自檢清單**：在 `docs/author/writing-notes.md` 新增「階層化鷹架與零割裂知識堆疊」技巧，詳述三層鷹架模型、三大割裂反模式（空中樓閣、板塊孤島拼貼、概念倒置）與自檢清單。
    - **第一視角演進與設計決策**：在 `docs/author/dev-notes.md`、`docs/design/design.md` 補齊作者對閱讀難度、心智模型自然生長與心智摩擦力最小化的設計脈絡。
    - **品質守門與交付驗收**：在 `docs/rules/guardrails.md`、`docs/rules/checklist.md` 與 `README.md` 同步補全守門條目。
  - [x] Review 重點：確認各文檔對「底層成群鋪墊、逐層向上堆疊」的闡述一致、切中痛點，並作為後續文章生成與重構的不可動搖規範。

- [ ] Mobile Inset Grouped Settings: 手機端設定體驗重構為原生 iOS 分組卡片流（Inset Grouped Cards）
  - [x] 已完成什麼：
    - **取消手機分頁切換**：在小螢幕（<= 767.98px）下隱藏 General / Style 標籤，將所有設定整合為縱向連續流暢捲動之圓角群組卡片，單手滑動即可閱覽並設定全部項目。
    - **滿版分段控制（Segmented Controls）**：語言（English / 中文 / 简体中文）、動態效果（On / Off）、Copilot（Off / Home / All）導入原生手機風格之全寬膠囊分段控制器，點選反饋即時平滑。
    - **主題 3x2 網格與色盤流暢觸控**：主題按鈕改為 3x2 緊湊平衡網格，色盤軌道支援觸控慣性滑動，點選目標清晰防誤觸。
    - **彈窗高度自適應**：全站設定 Modal 在手機端優化為圓角 Bottom-sheet/Modal 卡片，內容捲動與全域滾動隔離，點擊空白處與 Close 關閉無干擾。
    - **狀態雙向同步與文檔**：`pages/settings.html` 與 Modal 保持完全相同之 `[data-settings-*]` 與 `LudwigSettingsRuntime` 契約，並更新 `AGENTS.md`、`docs/specs/system-spec.md`。
  - [x] Review 重點：確認手機版點擊設定圖示與開啟 `pages/settings.html` 時，卡片分組清晰、分段切換流暢、各設定項目即時套用且無任何跳頁。

- [ ] Responsive Separation & Scoped i18n Architecture: 行動端與桌面端響應式分層架構收斂與選擇器作用域強隔離
  - [x] 已完成什麼：
    - **無損響應式雙態標籤**：`Credentials` 的放大預覽與下載按鈕導入宣告式雙態標籤（桌機端 `Full Preview` / `Download Document`，行動端自動切換為 `Preview` / `Download`），由純 CSS media query 控制顯示，徹底防止圖示被吃掉與版面超寬問題。
    - **選擇器作用域隔離**：`i18n/navbar.json` 與 `core/i18n.js` 全面加上 `.custom-nav` 與 `footer` 容器作用域，行動端底部導覽列改採微觀子元素多語更新（`.mobile-bottom-nav-item span`），杜絕全域選擇器污染卡片與按鈕。
    - **自動化契約守門**：在 `tests/test_skills_credentials_data.py` 新增 i18n 字典鍵值完整性與全域選擇器容器作用域測試（46 項測試全數 PASS）。
    - **非退化架構文檔**：將響應式分層架構、雙態標籤模式與選擇器隔離原則寫入 `AGENTS.md`、`docs/specs/system-spec.md`、`docs/rules/guardrails.md` 及 `docs/specs/skills-credentials-spec.md`。
  - [x] Review 重點：確認手機版首頁 Accolades 區塊預覽/下載按鈕排版舒展不擁擠、底部導覽列圖示常駐、Portfolio 頁面卡片完整保留。

- [ ] Standardize `<draft>` block authoring structure: Update documentation with `<draft>` outline patterns & Outcome Bias example
  - [x] 已完成什麼：已更新 `AGENTS.md`、`docs/author/writing-notes.md`（新增 `## Draft 骨架編寫規範` 及《結果偏誤》文章範例）、`docs/specs/parser-spec.md`、`docs/specs/content-metadata-spec.md`、`docs/design/design.md`、`docs/rules/checklist.md` 與 `docs/rules/guardrails.md`
  - [x] Review 重點：確認各份文檔中的 `<draft>` 骨架約定（`重點：內容` 或層級化清單）與範例是否完整且與現有規格保持一致

- [ ] SMR and Paxos Notes: Add State Machine Replication and Paxos Structured Notes
  - [x] 已完成什麼：新增 `notes/state-machine-replication-and-paxos-structured-notes/`，整理 SMR 和 Paxos 結構化筆記，包含 SMR 背景與 FLP 不可能性定理、Paxos 各角色與 terminology、二階段算法細節、P2/P2a/P2b/P2c invariants、以及 liveness 與實務議題。
  - [x] Review 重點：確認筆記的架構層次、排版與 wording 是否合適，以及產生的 HTML 與 `search-index.{json,js}` 是否如預期能被 Digital Garden 入口載入。

- [ ] Notes Draft：整理 `Paxos Made Moderately Complex` 結構化筆記與題庫草稿
  - [x] 已完成什麼：新增 `notes/paxos-made-moderately-complex-structured-notes/`，整理 PMMC 的 SMR 問題設定、Replica / Leader / Acceptor invariants、Scout / Commander 分工、安全性鏈條、fault tolerance sizing，並補上與 Raft 的對照；另附一份約 15 題的外部 question bank
  - [x] Review 重點：確認主 flow 是否要更偏「第一性原理 / intuition」或更偏「課堂複習版整理」，以及 quiz 的難度分布、題幹語氣與 tags 是否符合你之後想延伸的寫作方向

- [ ] Search / Sorting：收斂 Search 與 section landing 的 sorting UI，並把 relevance 相容語意補回文件
  - [x] 已完成什麼：桌機 sort 改成 icon trigger + viewport-level popover，mobile 維持 drawer；Search 保留 `Default` 作為 relevance / search engine ranking 的 UI 入口，手動 sort 則覆寫目前結果集合排序
  - [x] 文件同步：已更新 `docs/specs/system-spec.md`、`docs/tech/search-and-recommendation.md`、`docs/design/design.md`
  - [x] Review 重點：確認 dropdown 不再被 results 蓋住、trigger icon 會隨升降方向變化、`Default` 顯示成 tag 形式且 Search / landing 的排序心智一致

- [ ] Companion placeholder：先拿掉目前 companion avatar 圖，但保留 runtime 邏輯與未來擴充文檔
  - [x] 已完成什麼：settings 先收成 placeholder 說明，只保留 copilot；補 `docs/specs/companion-spec.md` 與 `docs/guide/companion-guide.md`，把 companion 的位置、大小、fallback 與擴充流程先定下來
  - [x] 文件同步：已更新 `docs/README.md`、`README.md`、`AGENTS.md`
  - [x] Review 重點：確認站上只剩 copilot 入口、companion 不會因舊 localStorage 再把 copilot 擋掉，且文件足以支撐之後重新開 companion

- [ ] Landing Page Skills & Credentials Sections: 新增首頁互動式技能樹與榮譽憑證展示區塊
  - [x] 已完成什麼：
    - `Skills`：於 `index.html` 的「關於我」下方、Timeline 上方新增定高視窗之分類技能量表與左右切換按鈕，資料由 `data/Skills/skills.json` SSOT 驅動。
    - `Credentials & Honors`：新增支援 `Type`（獎狀、成績單、證書、感謝狀）與 `Domain`（學術、工程、體育、志工）之雙維度篩選展示視窗，提供主圖展示、可動態切換之縮圖 Option Bar 與全螢幕放大燈箱 Modal，資料由 `data/Credentials/credentials.json` SSOT 驅動。
    - `Navbar & i18n`：更新頂部 Navbar Home 下拉選單連結，補齊 `core/i18n.js` 多語文案，並完整繼承全站 Palette & Theme Design Tokens。
    - `Tests & Docs`：新增 `tests/test_skills_credentials_data.py` 單元測試（`python3 cli.py test` 41 項測試全數通過），並建立 `docs/specs/skills-credentials-spec.md` 與同步更新 `AGENTS.md`、`README.md`、`docs/README.md` 等全套文檔。
  - [x] Review 重點：確認首頁 `#skills` 與 `#credentials` 的互動、類別切換、縮圖選單、燈箱 Modal 與深淺主題/Palette 呈現是否符合預期。

- [ ] 我感覺我們可以在關於我下方Timeline上方加上兩個page，一個是skills, 另一個是achievements, 之所以先上skills是因為我們這樣才能在後面利用achievements去佐證我的skills。
  - [x] 然後我在想，我們的achievement應該要娶一個更general的名字才對，因為achievements理論上比較偏向於有得獎的成就，但我其實想做的是把各種獎狀、成績單、感謝狀都放進去，所以應該要更general一點。然後我其實在想的是最簡單餓方是一定是用一個carousel然後showcase所有的獎項，但這樣是不是很容易變得很雜亂？所以我在想我們理論上應該要有一個可以讓reader選擇種類的方式，然後主要分兩種，一種是category，另一種是type，分別代表這個是獎狀(Awards)、成績單(Transcripts)還是其他，然後另一個category代表的則是哪一個領域的，比如academic, basketaball, volunteer, 等等的。然後這樣我們就可以用carousel(我們可以試試看horizontal or vertical)的方式來showcase，其中不只有一個main showcase image的section旁邊或下面要有一個小的option bar，裡面都是縮小版的image，且可以有向左向右或著向上向下的箭頭，用來看更多achivement照片。
  - [x] 然後另一個膽就是關於skills了 這部分我比較頭痛，因為理論上我們應該想一個可以讓skills scale但同時不會把空間站滿的方式。我感覺就一樣吧，我們用多個section bar charts來showcase不同skills之間的能力值，然後單一section或單一bar charts所顯示的能力就是相同genre的，比如說我第一個想到的是language，然後我們就可以在這個section/bar charts裡有Indonesian, Traditional Chinese, Simplified Chinese, English這四種。然後不同section或不同bar charts的切換則使用左右按鈕。這樣就可以讓多個section/bar charts共用一個空間但又可以scale。scale的方式就是等我skills超過一定量，我們就可以把它拆分成更細的bar chart。

- [ ] Mobile UX & UI Optimization: 全站手機版人體工學與介面優化
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
