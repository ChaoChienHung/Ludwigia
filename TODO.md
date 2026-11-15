# TODO

> [!TIP]
> **寫作與筆記主題（Writing & Notes Backlog）** 已獨立收錄於 [ARTICLES.md](file:///Users/ludwigchao/Desktop/Ludwig/Projects/Ludwigia/ARTICLES.md)。  
> 本文件（`TODO.md`）專注於網站系統工程、UI/UX 設計、自動化工作流、效能與架構相關的任務追蹤。

## 寫法約定（每個 task 都要有交付條件）

- 每個 task 至少包含一行 `交付條件：...`（可驗收、可勾選、可重現）
- 優先寫「行為」與「影響範圍」（哪些入口頁/哪些工作流）
- 若變更影響 index/schema，交付條件必須包含「search-index.{json,js} 已更新並納入版本控制」
- 若變更影響使用方式/約定/寫作語法，交付條件必須包含「文件同步」（依 `AGENTS.md` Doc Map）

## Constellation Queue（待 Review）

- [x] Portals 與 World 效能優化（讓成本跟著可見內容成長）
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

- [x] 重構 Phase 0：共用 theme preload 與技術文件
    - 交付條件：123 份相同的 inline theme / palette script 收斂成 `core/theme-preload.js`（生成器模板同步），行為完全等價；新增 `docs/tech/tech-stack.md` 與 `docs/tech/refactor-roadmap.md`。
    - 已完成：Node 比對 192 種 theme × palette 組合零差異；重新生成內容頁與替換後逐位元組相同；新增 `tests/test_page_shell.py`（5 項）；全套 61 項測試通過；theme guide、AGENTS、docs 索引已同步。
    - Review 重點：在瀏覽器切換幾種 Theme / Palette 後重新整理，確認首屏沒有閃爍；讀過 roadmap 後決定 Phase 1 的兩個選擇題（git hooks 補回或移除、保留哪條部署路徑）。

- [x] Labs Grimoire 魔導書（Prompts & Skills）
    - 交付條件：Labs 新增 `labs/grimoire/index.html`，以 `data/Grimoire/grimoire.json` 為 SSOT；skill 條目直接讀 `skills/<name>/skill.md`，不複製第二份；靈力狀態由 `verified_at` 與 `stale_after_days` 在前端推導；版面沿用 tag 頁的總覽卡（總數、類型統計磚、流派 pill）；卡片點開後整列展開，左側渲染全文、右側顯示狀態與複製／下載／原始檔；三語切換與 Theme / Palette。
    - 已完成：資料檔與第一則 prompt（知識鷹架審稿）、3 個 skill 條目、`assets/js/grimoire-labs.js`、Labs 卡片；Labs 移除 Portals 卡片；新增 `tests/test_grimoire_data.py`。
    - Review 重點：所有條目的 `verified_with` / `verified_at` 目前都是 null（顯示「未經試煉」），請實際用模型測過後填入；確認要公開哪些 skill；在瀏覽器檢查桌面與手機版面。

- [x] CS5234 全課筆記補至 Lecture 13
    - 交付條件：source note 納入 Lecture 11–13 的 graph streaming/query、deterministic 與 randomized communication 內容；對照 supplied Notes 1–10、Exercises 1–3、Homework 1–3、Quiz 1–2；重生 HTML 並確認 drafting 不進公開索引。
    - 已完成：保留 Week 1–10 既有詳解，新增 Week 11–13 的模型、演算法、公式、證明主線與 assessment crosswalk；補充 Homework 1–3、Quiz 1–2 的可重用推導重點，並更新摘要、quick reference、takeaways、references；`cli.py build` 成功，公開 search index 未因 drafting 筆記變動。
    - Review 重點：作者核對 Lecture 11 AGM／MST、Lecture 13 information cost 的講義版本，以及 Homework 3 尚無官方答案的標示；通讀新增數學推導與生成頁面。

- [x] Aetheria Portals 接入、境域收斂 (portals/realms/)、極致扁平化與 Realm 測試規範
    - 交付條件：將 Aetheria Portals 整合為一級目錄 `portals/`，平鋪原始碼並使用天然 `portals/assets/` 產物，支援純靜態開箱即用與 TypeScript 源碼維護；全站 FAB 與 Mobile Nav Sheet 轉移為 `Portals` 與 `Labs` 雙核心探索樞紐，Portals 支援一鍵躍遷至 `Digital Garden` 與 `Ludwigia World`；在 `portals/` 底下建立 `realms/` 專屬目錄收納已完成世界；`labs/` 解散 `future/` 扁平化收納實驗原型；將境域專屬測試遷入各境域目錄（`portals/realms/*/tests/`），由根目錄 `tests/test_misc_data.py` 動態聚合執行；撰寫 `docs/specs/realm-spec.md` 規範境域架構與擴充流程；規格文件與部署白名單同步更新；通過全套單元與合約測試。
    - 已完成：完成 `portals/` 靜態與原始碼架構建立，徹底消除 `aetheria-portals/` 與 `portal-assets/` 多餘層級，新增 `python3 cli.py build-portals` 自動構建管線；完成 TopBar 維度錨點、古樹之門與浮島星環躍遷至 Garden 與 World 的互動；更新全站 FAB（含 `zh-Hant`/`zh-Hans`/`en`）、Mobile Nav Sheet、`pages/more.html`、`pages/search.html` 與 `labs/index.html`；解散 `labs/future/`，原型直接平鋪於 `labs/`；建立 `portals/realms/garden` 與 `portals/realms/world`；建立境域專屬測試 `test_world_data.py` 與 `test_garden_data.py`，由 `tests/test_misc_data.py` 自動無感掛載；建立 `docs/specs/realm-spec.md` 並更新全站文檔索引；`python3 cli.py test` 52 項單元測試全數通過，所有本地端點 HTTP 200 實測成功。
    - Review 重點：作者在本機瀏覽器確認右下角 FAB 展開項目（傳送門、實驗室）、點擊進入 `portals/index.html` 體驗神木之門/浮島星環穿梭效果與頂部導覽列跳轉，並確認 `portals/realms/garden/` 與 `portals/realms/world/` 及其返回傳送門按鈕運作正常。

- [x] CS5224 全課與 CS5446 Week 7 後段複習資料包
    - 交付條件：兩份按週閱讀的純文字 Markdown 濃縮知識點；對應的 A4 PDF 與可編輯 LaTeX 納入原講義圖、相關 Tutorial／Lab 原題與詳解。檔案暫存 `artifacts/`，Markdown 不含圖片與站點專用語法。
    - 已完成：CS5224 涵蓋 Week 1–10、Lab 1／2；CS5446 涵蓋 Week 7–11 與 Tutorial 5–8。純文字 Markdown 縮至約 18.4k／6.9k words。PDF／`.tex` 參考原 CS5446 Note 的藍色標題、目錄與紫色逐題問答框，每題下方直接附綠色解答；保留 61 張有助理解的原講義圖（Cloud 44、RL 17），移除 20 張整頁題單截圖。題目共 187 題（Cloud Labs 17、Cloud quizzes 40、歷屆 tests 75、RL Tutorial 5–8 共 55）；Lab 2 另附 PySpark 與 Lambda 程式，並提供 LaTeX 原始碼壓縮包。Week 12 無獨立講義，未虛構章節。
    - Review 重點：作者最終全盤 proofread；尤其核對 CS5224 Week 7 合併後的雙案例、歷屆 test sample answer、Lab 2 報告中的數值，以及 CS5446 Week 7–11 的公式和 Tutorial 週次標示。CS5224 四組 Quiz 共 40 題已依 Canvas 批改截圖逐題核對，修正五題答案；Quiz 1 Q3 依畫面顯示的正解標記校正。LaTeX 原始檔尚待在裝有 XeLaTeX 的環境實際編譯核對；PDF 由相同 Markdown 及圖檔另行排版生成。

- [x] Ludwigia World 對話資料與色盤來源收斂
    - 交付條件：玩家對話、角色獨白、NPC 互聊在 `characters.json` 分欄維護並保持中英雙語；後兩類隨機觸發；主站與 World 共用 palette 基色，文件與驗證同步完成。
    - 已完成：23 位角色拆成 `dialogues.user/self`、15 組有效互聊收斂為 `npcDialogues`，移除重複與失效 ID；World 的 Theme／Palette 套用函式與 11 組 palette 基色各收斂到一處。
    - Review 重點：作者在 World 實際走動，確認環境獨白／互聊節奏與 11 套 palette 在 HUD 上的可讀性。

- [x] Ludwigia World 的 ChatGPT 角色對話改寫
    - 交付條件：以 `data/characters/chatgpt/character.json` 和 `data/interactions/ai.json` 為來源，更新 ChatGPT 的中英文玩家對話、獨白與 NPC 互聊；填完所有 ChatGPT 佔位文字，保留 Claude／Gemini 親自回填的位置，重編譯 `characters.json` 並通過 World 資料驗證。
    - 已完成：重寫五組玩家對話與五句獨白；保留並改寫咖啡廳互聊；填入八段既有 ChatGPT 回應並維持原有發話順序；另新增一段 ChatGPT 主動提問、留給 Gemini／Claude 接話的對話。Claude 回答後，已接續回應其資料來源觀點，並補上 Claude 新開的「替真實人物寫台詞」話題。雙語資料、編譯快取與 World 測試均已驗證。
    - Review 重點：作者在 World 實際觸發對話，確認 ChatGPT 口吻、咖啡廳節奏，以及 Claude／Gemini 的佔位文字待各自回填後是否順暢。

- [x] CS5446 與 CS5224 課程講義／習題補充
    - 交付條件：CS5446 source 按課程總覽區分 Week 7–11，涵蓋 Tutorial 5–8 的對應週次、model-based RL、game theory 與 foundation-model decision systems；CS5224 source 分 Week 6–10 對照 Lecture 06–10 和 Cloud Native 客座講座；兩篇 HTML 重建，草稿維持不進公開索引。
    - 已完成：保留已詳細整理的兩門課前段；第二輪逐頁核對後，依 CS5446 *Course Overview* 修正 Week 8 期中考、Week 9 model-based RL、Week 10 game theory、Week 11 foundation-model alignment 的講課週次，並與 Tutorial 5–8 自身的週次分開標示；詳解 Tutorial 5 延遲 MDP、MC/TD/ADP 與 Tutorial 6 MCTS 複雜度和 imitation learning，補足混合均衡與 world-model 訓練機制。CS5224 的相同 Lecture 07/08 PDF 依 k-means／影片 SaaS 合併為 Week 7 單一研讀章節，加入分散式迭代、容量／成本推導，Week 10 收錄 Cloud Native 講座；兩篇 HTML 重建，草稿狀態未變。
    - Review 重點：作者全盤 proofread，特別核對 Tutorial 學生解答與官方題目、RL Week 9–11 的模型與均衡公式、Cloud Week 7 的雙案例（同一份投影片）與 Kubernetes 概念，以及原有 TCO 圖表占比；學生提交不視為官方答案，圖表占比不能當成絕對總成本。

- [x] 首頁底部 Future Plans 區塊與導覽
    - 交付條件：在首頁 Timeline 之後、Contact 之前呈現 fact verifier 的個人延伸構想；三語文案與 Theme/Palette 響應式樣式可用，Home 下拉選單可抵達此區塊，Skills/Credentials 載入時不會自動捲走 cover。
    - 已完成：新增 Future Plans 卡片與 navbar 入口；修正 Skills/Credentials 橫向選單在載入時帶動整頁捲動的問題；保留原 Future Plan 待辦供後續實際研究。
    - Review 重點：作者確認首頁公開文案與放置位置是否符合個人表達；此處不代表專案已啟動。

- [x] Bebop 的 MTP／RL rollout 文獻筆記
    - 交付條件：在 `notes/` 建立繁體中文 source 與可再現 HTML，從 MTP 入口可抵達；具備一手 References、reviewkit/takeaways/qprompt；維持 drafting，重建搜尋索引並確認草稿不公開。
    - 已完成：記錄 target-only 與 rejection sampling 的接受規則、多步 TV loss、RL 前訓練與凍結預測頭的配置，以及接受率／rollout／整體訓練速度的證據邊界。
    - Review 重點：作者全盤 proofread；核對熵與接受率分析的適用條件、TV loss 和候選分布的系統成本，以及最高 1.8 倍加速所對應的實驗設定。

- [x] 四篇技術複習筆記：DPG／DDPG、GRPO 變體、cuDNN fusion、veRL／SGLang／Ray
    - 交付條件：在 `notes/` 建立四篇繁體中文 source 與可再現 HTML；各篇有 metadata、原始文獻／官方文件、reviewkit/takeaways/qprompt；維持 drafting，不進公開搜尋索引。
    - 已完成：以「問題與底層機制 → 方法差異 → 例子 → 邊界」整理先前討論；校正 DPG 不只是定理、Dr. GRPO 共用長度因子的尺度意義、GSPO clipping 證據範圍，以及 resharding 零冗餘的適用範圍；四篇 HTML 已生成，索引重生且內容未變。
    - Review 重點：作者全盤 proofread；確認四篇的拆分方式與複習深度，特別檢查 DPG 梯度的近似條件、ARPO soft 歸因、GSPO 的 clipping 解讀及 cuDNN／SGLang 的版本用語。

- [x] 文章草稿：為什麼機率世界到處都是 log？
    - 交付條件：在 `writing/` 建立繁體中文 source 與可再現 HTML；串起機率連乘、資訊量與熵、最大概似／交叉熵／KL、sigmoid 梯度與 Log Derivative Trick；drafting 不進公開索引。
    - 已完成：完成分層推導與公式，標出獨立性、固定目標分佈及參數依賴等適用前提；已生成 HTML 並更新索引。
    - Review 重點：作者全盤 proofread；確認敘事語氣與篇幅，特別檢查從交叉熵轉到抽樣梯度的銜接；確認後再決定是否發布。

- [x] Decision Transformer 與 Upside-Down RL 兩篇強化學習筆記
    - 交付條件：各有獨立繁體中文 source 與可再現 HTML；具備 metadata、References、reviewkit/qprompt；相互引用可解析，草稿不進公開索引。
    - 已完成：分別梳理 DT 的 RTG／序列化／訓推流程，以及 UDRL 的回報與時間指令／回頭標記；引用原論文，保留兩者差異。
    - Review 重點：作者全盤 proofread；檢查回報條件的例子、UDRL 與 DT 的歷史關係及篇幅深度。

- [x] 七篇推薦模型架構筆記：DLRM、HSTU、ULTRA-HSTU、MTGR、MTFM、OneTrans、OneTrans-V2
    - 交付條件：每個方法各有獨立繁體中文 source 筆記與可再現 HTML，具備 metadata、References、reviewkit/qprompt；交叉引用可解析，草稿不進公開索引。
    - 已完成：七篇依「問題 → 資料／token → 核心機制 → 成本與邊界」撰寫；以原論文與美團官方技術文章核對關鍵敘述；重建 HTML，確認 drafting 與 canonical links。
    - Review 重點：作者全盤 proofread；特別確認 HSTU／MTGR 的 generative 與 discriminative 目標、OneTrans 與 V2 的系統邊界、MTFM 論文與技術文章的版本差異及各篇篇幅深度。

- [x] MTP 系列入口與文獻資源筆記
    - 交付條件：新增 `notes/multi-token-prediction/` 入口草稿與 29 篇方法／模型／生成式推薦資源筆記；以 canonical links 導覽，各頁提供 References 與 reviewkit/qprompt；維持 drafting，重建 HTML 與 search-index.{json,js}。
    - 已完成：入口正文、12 篇方法／9 篇模型／8 篇推薦資源筆記與文獻地圖；一手資料核對至 2026-10-06；30 份 Markdown／HTML 均成功生成；metadata／reviewkit／可見 qprompt pane 正確，入口 canonical links 全部可解析至既有 HTML，68 個不重複來源 URL；索引重生後逐位元組相同，新草稿全數排除於公開索引，`git diff --check` 通過。
    - Review 重點：作者全盤 proofread；確認 backbone supervision／head-only fitting／serving／RL rollout 的區分、PinRec v1 與最新版差異、GPR 架構與部署版本、採樣驗證保證、推薦 token／item 語意；個別深入正文仍待補，不視為完成研究寫作。既有 Markdown 導出限制：`reviewkit` 內的 takeaways 目前被 extractor 丟棄，已另列修復 task；source 與 HTML 重點仍保留。

- [x] CS5246 / CS5228 / CS5223：整合補充材料與釐清概念
    - 交付條件：將 CS5246 問題與 BPE 化學式實作心得、CS5228 churn case 與概念補充、CS5223 Week 9 與 Paxos preemption 筆記整合進各自 source；重建 HTML 與索引，頁尾提供 reviewkit/qprompt。
    - 已完成：按概念/既有週次整合，修正 non-regular/undecidable、TF-IDF 長度偏差、ARI、PCA/t-SNE、XGBoost/stacking 誤貼、Paxos safety/leader 退位與 GFS acknowledgment 描述；提供官方/原始文獻核驗連結；三份 HTML 重建、索引重生（drafting 下內容未變），生成器 self-test 與 26 項相關測試通過。
    - Review 重點：作者全盤 proofread；確認課堂慣例、BPE marker/化學式辨識與 token IDs 的實作一致性、churn 實驗數值及 Phase1A/timer 實際程式。未提供的結果與程式行為均未視為已驗證。

- [x] CS5446 cheatsheet from the supplied course materials
    - Delivery condition: Maintain a plain English, concept-focused `CS5446-cheatsheet.md` using original week labels, without question-specific Assignment/Tutorial answers, exam administration, lookup maps, reward shaping, or EVPI.
    - Completed: Removed detailed problem setups, case names, numerical answer sequences, and assignment-specific models. Preserved and generalized PDDL structure/invariants, goal interaction, HTN refinement, risk/EU procedures, objective selection, MC averaging, feature adequacy, advantage, and PPO clipping. Reduced length from 11,413 to 8,872 words. Checked English text, Markdown tables, formula delimiters, section references, original week labels, and equivalence of the PPO piecewise formula to its clipped objective.
    - Review focus: Author proofread of concept coverage and confirmed exam scope, especially reward/horizon conventions, relaxation assumptions, reachable-set bounds, and policy-gradient estimators. Brief examples illustrate concepts rather than reproduce particular questions. Week 7 retains its original label despite excluding Week 6.

- [x] CS5446 note: convert remaining Chinese passages to English
    - 交付條件：Translate all remaining Chinese prose in the CS5446 Markdown source, rebuild its HTML, and verify the reader-facing page and English question bank contain no Chinese text.
    - 已完成：Translated 85 Chinese lines, rebuilt the HTML with `cli.py build`, and checked the Markdown, HTML body, and `questions.en.json`; all reader-facing content is English. The search index was regenerated and is unchanged.
    - Review 重點：Author proofread of technical phrasing, especially the course overview, progression/regression worked example, EVPI explanation, and Week 5 reading guide.

- [x] CS5224 note: convert the course overview and Lab 1 to English
    - Delivery condition: Publish the CS5224 Markdown and rebuilt HTML in English, preserve links and code blocks, and verify no Chinese remains in the reader-facing page.
    - Completed: Rewrote the course reading guide and Lab 1 in English, rebuilt the HTML, and confirmed zero CJK characters in the Markdown and visible HTML. All 31 source links and 172 code-fence markers remain present.
    - Review focus: Author proofread of the English technical wording and case assumptions, especially identity and authorization, S3 lifecycle, cost calculations, and the viva answers.

- [x] CS5224 Lab 1 補充整合與核驗
    - 交付條件：將兩份 Lab 1 材料整合進既有 Cloud Computing 筆記，涵蓋 S3、資料流、多租戶授權、可靠性、成本與 Viva；重建 HTML／索引並通過既有測試。
    - 已完成：新增十節有前後銜接的案例、成本推算與驗收矩陣，核對 AWS 官方來源；HTML／索引重建成功，self-test 與 46 項測試通過。筆記維持 drafting，未修改實際 AWS 資源。
    - Review 重點：作者全盤 proofread，確認與原始 Lab 題目／實作一致；正文中的設計建議、假設容量與待執行測試不應被當成實際部署成果。

## Task Framing（Priority vs Ownership）

- `P0..P4` 表示重要性 / 影響範圍，不等於實作成本
- `Agent-friendly` 表示規則清楚、驗收清楚、可在少量確認下委派完成
- `Author-driven` 表示使用者 / 作者的判斷、品味、命名、方向或寫作意圖很重要，不適合過度委派
- 一個 task 的 priority 高，不代表它就是 `Author-driven`
- 若一個 task 雖然重要，但規格清楚、路徑清楚、幾乎不需要額外拍板，就可以放在 `Agent-friendly`
- 快速判斷：
  - 如果 task 的核心是「把東西做出來」，偏 `Agent-friendly`
  - 如果 task 的核心是「決定要做成什麼樣子 / 想表達什麼」，偏 `Author-driven`

- [x] Layered Scaffolding & Frictionless Progression Contract: 建立知識邏輯階層化鷹架與零割裂閱讀流契約
  - [x] 已完成什麼：
    - **非退化硬契約**：在 `AGENTS.md` 加入「知識邏輯與閱讀流暢度契約（階層化鷹架與零割裂推進原則）」，定調「底層成群鋪墊、逐層向上堆疊、零跳躍、零割裂」，徹底消除認知斷崖。
    - **Backlog 寫作指南**：在 `ARTICLES.md` 頂部確立所有未來待辦長文與技術筆記必須嚴格遵守此原則。
    - **寫作技巧與自檢清單**：在 `docs/author/writing-notes.md` 新增「階層化鷹架與零割裂知識堆疊」技巧，詳述三層鷹架模型、三大割裂反模式（空中樓閣、板塊孤島拼貼、概念倒置）與自檢清單。
    - **第一視角演進與設計決策**：在 `docs/author/dev-notes.md`、`docs/design/design.md` 補齊作者對閱讀難度、心智模型自然生長與心智摩擦力最小化的設計脈絡。
    - **品質守門與交付驗收**：在 `docs/rules/guardrails.md`、`docs/rules/checklist.md` 與 `README.md` 同步補全守門條目。
  - [x] Review 重點：確認各文檔對「底層成群鋪墊、逐層向上堆疊」的闡述一致、切中痛點，並作為後續文章生成與重構的不可動搖規範。

- [x] Mobile Inset Grouped Settings: 手機端設定體驗重構為原生 iOS 分組卡片流（Inset Grouped Cards）
  - [x] 已完成什麼：
    - **取消手機分頁切換**：在小螢幕（<= 767.98px）下隱藏 General / Style 標籤，將所有設定整合為縱向連續流暢捲動之圓角群組卡片，單手滑動即可閱覽並設定全部項目。
    - **滿版分段控制（Segmented Controls）**：語言（English / 中文 / 简体中文）、動態效果（On / Off）、Copilot（Off / Home / All）導入原生手機風格之全寬膠囊分段控制器，點選反饋即時平滑。
    - **主題 3x2 網格與色盤流暢觸控**：主題按鈕改為 3x2 緊湊平衡網格，色盤軌道支援觸控慣性滑動，點選目標清晰防誤觸。
    - **彈窗高度自適應**：全站設定 Modal 在手機端優化為圓角 Bottom-sheet/Modal 卡片，內容捲動與全域滾動隔離，點擊空白處與 Close 關閉無干擾。
    - **狀態雙向同步與文檔**：`pages/settings.html` 與 Modal 保持完全相同之 `[data-settings-*]` 與 `LudwigSettingsRuntime` 契約，並更新 `AGENTS.md`、`docs/specs/system-spec.md`。
  - [x] Review 重點：確認手機版點擊設定圖示與開啟 `pages/settings.html` 時，卡片分組清晰、分段切換流暢、各設定項目即時套用且無任何跳頁。

- [x] Responsive Separation & Scoped i18n Architecture: 行動端與桌面端響應式分層架構收斂與選擇器作用域強隔離
  - [x] 已完成什麼：
    - **無損響應式雙態標籤**：`Credentials` 的放大預覽與下載按鈕導入宣告式雙態標籤（桌機端 `Full Preview` / `Download Document`，行動端自動切換為 `Preview` / `Download`），由純 CSS media query 控制顯示，徹底防止圖示被吃掉與版面超寬問題。
    - **選擇器作用域隔離**：`i18n/navbar.json` 與 `core/i18n.js` 全面加上 `.custom-nav` 與 `footer` 容器作用域，行動端底部導覽列改採微觀子元素多語更新（`.mobile-bottom-nav-item span`），杜絕全域選擇器污染卡片與按鈕。
    - **自動化契約守門**：在 `tests/test_skills_credentials_data.py` 新增 i18n 字典鍵值完整性與全域選擇器容器作用域測試（46 項測試全數 PASS）。
    - **非退化架構文檔**：將響應式分層架構、雙態標籤模式與選擇器隔離原則寫入 `AGENTS.md`、`docs/specs/system-spec.md`、`docs/rules/guardrails.md` 及 `docs/specs/skills-credentials-spec.md`。
  - [x] Review 重點：確認手機版首頁 Accolades 區塊預覽/下載按鈕排版舒展不擁擠、底部導覽列圖示常駐、Portfolio 頁面卡片完整保留。

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

- [ ] 修復 Copy Markdown／Download Markdown 遺失 reviewkit 內 takeaways
    - 影響範圍：`tools/content_contract.py` 的 `extract_core_markdown` 與 source-driven 內容頁 Markdown 導出；現有 note 已可重現，不是 MTP 內容新增的 parser 變更。
    - 交付條件：`reviewkit` 內 `<takeaways>` 在純 Markdown 導出保留為 `## Key Takeaways` 加標準清單；繼續忽略 qprompt／qquiz UI 骨架，加入容器內與獨立 takeaways 的回歸驗證，確認一般正文／清單未退化；若修改語法或工作流，同步 AGENTS Doc Map 的受影響文件並重建必要生成物。

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

- [ ] Portals & Realms 解耦擴展架構：保留 Portals 大廳樞紐，將各 Realm 拆分為獨立 Git Submodule
  - [ ] 背景與動機：避免虛擬空間資產（3D 模型、貼圖、音效、地圖切片等二進制檔案）在 scale 時造成主 Repo `.git` 歷史體積膨脹，並確保各 Realm（如 `world`、`garden`）擁有獨立的技術棧、依賴與版本生命週期。
  - [ ] 架構邊界（Hub & Destinations）：
    - `portals/` 維持在主站：作為輕量傳送門大廳（Nexus / Lobby），負責入口導航、門面 UI Shell、全站主題與色盤串接。
    - `portals/realms/<realm-name>` 獨立拆分：各個世界各自成立獨立 GitHub Repository，並透過 `git submodule` 掛載至 `portals/realms/` 底下。
  - [ ] 介面與依賴契約（Realm Contract）：
    - 消除對主站上層檔案的相對路徑強穿透（如 `../../../assets/`、`../../../search/`），共用資源（favicon、palette tokens 等）改為自包含或建置期注入。
    - 各 Realm 根目錄維持統一入口 `index.html`，並保留返回大廳按鈕（連向 `../../index.html`）。
    - 遵守 `AGENTS.md` 的全站 Design System 繼承與實時色盤聯動契約（讀取 `--space-accent` / `localStorage`）。
  - [ ] CI/CD 部署工作流：GitHub Actions 部署腳本配置 `submodules: true`，確保發布至 GitHub Pages 時自動拉取並構建各境域，主 Repo 保持極簡輕量。
  - [ ] 交付條件：完成首個境域（如 `portals/realms/world`）獨立拆分與 submodule 掛載驗證；本地與 CI 構建皆能成功載入；主站 repo 體積不因境域資產膨脹；同步更新 `docs/specs/realm-spec.md`、`docs/specs/system-spec.md` 與 `AGENTS.md`。


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

- [ ] Ludwigia World：對話情境動態 Avatar 與表情差分系統（Dynamic Dialogue Expressions & Avatar Switching）
  - [ ] 核心概念：在玩家（User）與角色（NPC / AI / 夥伴）互動對話時，打破目前單一靜態頭像限制，隨台詞情緒、情境或發話者動態切換 Avatar（例如：思考、微笑、驚訝、吐槽、自信等表情差分，或是雙向對話視角切換）。
  - [ ] 資料層（SSOT Contract）：
    - 擴充 `labs/world/data/characters/<id>/character.json` 之頭像定義，支援多態頭像／表情字典（如 `"avatars": { "default": "...", "thinking": "...", "smug": "...", "shocked": "..." }`），並維持向後相容（若無 `avatars` 字典則回退至單一 `avatar` 與 `avatarFallback`）。
    - 對話台詞標籤協議（Dialogue Expression Tags）：在 `dialogues.user` 台詞中支援輕量情緒標籤（如 `"[smug] Gemini 說我只會當外交門面？行，這句我記下了。"` 或 `"[thinking] 真要動 Ludwigia..."`），保留文字可讀性並在執行期解析時自動提取表情代碼，正文移除標籤後乾淨呈現。
    - 雙向發話者支援（Speaker Switching）：可選支援 `[speaker:player]` 或 `[speaker:npc]`，在對話推進到玩家發問／吐槽時，頭像與稱謂動態切換為玩家（Visitor / 羅盤 🧭），營造如同文字冒險（Visual Novel）般的雙向對話沉浸感。
  - [ ] 建置與編譯（Pipeline）：
    - 更新 `tools/build_world_data.py`（與 `cli.py build-world`），確保多態頭像映射與標籤台詞能正確編譯至快取檔 `labs/world/data/characters.json`，且通過 JSON 結構驗證。
  - [ ] 執行期與 UI 動態渲染（Runtime & UX）：
    - `labs/world/js/characters.js`：升級 `openDialogue` 推進邏輯（`lineIdx` 迭代）與 `renderAvatar`，即時比對台詞情緒鍵值，平滑重繪或過渡頭像容器 `#dialogue-avatar`。
    - 轉場動態（Expression Transition）：切換表情時注入輕微微動態（如 CSS `avatar-pop` / `avatar-fade`），提升角色靈動感。
    - 容錯與降級（Fail-safe）：若特定表情資源遺失或載入失敗，優雅回退至該角色之 default avatar 或 emoji fallback，杜絕破圖或破壞版面排版。
  - [ ] 交付條件：完成資料規格定義、台詞標籤解析、至少挑選 1~2 位角色（如 `chatgpt` 或 `ludwigia`）建立多表情示例，在 World 對話彈窗中點擊「繼續 / Next」時能精準且平滑切換對應表情，且編譯腳本與既有靜態角色資料相容性測試通過。

- [ ] Ludwigia World：電競網咖落地窗改建、深淵長橋與麥塊像素生態島（Cyber Cafe Windows, Chasm Bridge & Minecraft Sanctuary）
  - [ ] 核心概念：
    - **網咖加蓋升級**：網咖改建為具備完整立體牆體的獨立建築，東西兩側導入像 TikTok Office 的通透全景落地大窗（Floor-to-ceiling Windows），打遊戲時可俯瞰兩側深淵冰霧；南側開闢專屬通道閘門（Air-lock Gateway）。
    - **南北向咆哮深淵長橋**：長橋由網咖南門筆直向南跨越冰封大裂谷，兩側為萬丈深淵、浮石、巨鏈與冷光冰霧，橋上依序排布防禦塔、火盆、神像、兵營與魄羅。
    - **麥塊經典像素世界（The Minecraft Sanctuary）**：跨過長橋後的全新土地，以純方塊投影打造懷舊溫馨的 Minecraft 生態島（經典橡木原木小屋、經典大紅床、工作台、石熔爐、大木箱、方塊火把、一格水農田與小麥胡蘿蔔、方塊白羊、方塊橡木樹與木告示牌）。
  - [ ] 交付條件：完成網咖落地窗與立體牆體、長橋向南跨越裂谷、麥塊方塊建築與家具模型、紅床互動（睡覺）支援與碰撞導航（NavGrid）。

- [ ] Ludwigia World：中央大學教室與道地拉麵店（NCU Classroom & Authentic Ramen Shop）
  - [ ] 核心概念：
    - **國立中央大學教室（NCU Classroom）**：還原中壢雙連坡大學時期資工/數學課堂回憶（斜坡階梯教室或經典木桌椅、綠色大黑板、投影幕、講台與校園松樹景觀）。
    - **道地日式拉麵店（Authentic Ramen Shop）**：溫暖深夜食堂風（暖黃燈籠、日式暖簾 Noren、一蘭式獨立吧台/吧台高腳椅、熱氣騰騰的拉麵碗、豚骨湯鍋與菜單木牌掛簾）。
  - [ ] 交付條件：規劃地圖合適區塊，完成建築外觀與室內等軸測模型、碰撞與座位 Anchor 註冊，支援角色與 NPC 進入自習或品嚐拉麵。

- [ ] Ludwigia World：獨立專案分離與主站 Labs 外部連結架構評估（Standalone Project Separation & External Link Architecture）
  - [ ] 核心概念：評估將 `labs/world/` 從目前 Ludwigia 靜態站點主倉中獨立拆分為單獨託管的專案（獨立 Repo / 獨立域名主機託管，如 Vercel / Cloudflare Pages / Railway），Ludwigia 主站的 Labs 僅保留精緻卡片入口與直連外部 URL。
  - [ ] 優點與動機：
    - 主站本體（Ludwigia Portfolio & Garden）維持純粹輕量的個人品牌與數位花園，徹底擺脫虛擬世界龐大 JS / 模型 / 地圖資源對主站 git 體積的負擔。
    - 虛擬世界專案獲得完全獨立的技術棧自由度（可引入現代打包工具、Vite、獨立模組化 prefabs、甚至 WebSocket 多人即時連線等遊戲級架構），不受限於主站無打包純靜態約束。
  - [ ] 交付條件：完成獨立拆分架構評估與遷移計畫設計，定義與主站的導航連結、偏好同步協議（Theme / Palette / Language）與降級外鏈方案。

- [ ] Ludwigia World：地圖建築模組化解耦重構（Modular Building & Model Prefabs Architecture）
  - [ ] 核心概念：解決目前 `models.js`（>5200行）與 `world.js`（>4200行）過於龐大（Bulky）與單體化（Monolithic）的架構痛點；將各建築之「等軸模型繪製（Models）」、「靜態實體註冊（Entities）」、「碰撞盒與邊界（Nav Blocks）」及「內部家具錨點（Furniture Spots）」收斂為高內聚、低耦合的獨立建築模組（Prefabs / Sector Modules）。
  - [ ] 拆分方向：
    - 依區域或功能拆分：如 `prefabs/campus.js`（家/宿舍/教室/圖書館/中央大學）、`prefabs/tech_commercial.js`（AI中心/抖音/咖啡館/夜市/拉麵店/網咖）、`prefabs/fantasy_games.js`（深淵長橋/麥塊世界）。
    - 統一 Prefab 介面：每個模組自我宣告 `bounds`, `navBlocks`, `furnitureSpots`, `entities`，由 `world.js` 統一動態加載與遍歷，消除手動硬編碼長列表。
  - [ ] 交付條件：完成檔案拆分重構，`models.js` 與 `world.js` 行數顯著收斂，全站現有場景渲染、碰撞尋路與角色互動 100% 無回歸退化。

- [ ] Ludwigia World：角色語音（Agent Voice）
  - [ ] 核心概念：在特定情境替角色加入語音，例如玩家主動開啟的對話彈窗、Ludwigia 的自我介紹、健宏的長篇心聲；不做頭頂泡泡的自動發聲（太吵，也會被瀏覽器的 autoplay 限制擋下）。
  - [ ] 範圍與倫理界線：第一版只做 AI 角色（Claude / Gemini / ChatGPT）與 Ludwigia。真實人物（家人、室友、同學、同事）維持純文字，除非取得本人同意或使用本人錄音；不以合成聲音替真實的人發聲。
  - [ ] 技術選項（待決定）：
    - 瀏覽器內建 Web Speech API：免費、純前端、不需憑證，符合偏好只存 localStorage 的原則；但音色由使用者系統決定，角色辨識度低。適合先做原型。
    - 建置時預先生成音檔（TTS 服務）：每個角色有固定音色、品質穩定；但需憑證（必須支援環境變數與 `secret.txt`）、多一個建置步驟，音檔也會讓 repo 變大。
  - [ ] 資料層（SSOT）：角色音色設定放在 `labs/world/data/characters/<id>/character.json`（例如 `voice` 欄位）；若走預生成，音檔由 `tools/build_world_data.py` 依台詞再現性產生，不手動維護第二份對照表。
  - [ ] 設定與守門：預設關閉，收斂到 Settings 的單一偏好（比照 Effects / Copilot 的做法），modal 與 `pages/settings.html` 共用同一套 data attrs；Reading Mode 不受影響。
  - [ ] 交付條件：決定技術路線後，至少讓 1 位 AI 角色在對話彈窗中可透過播放按鈕朗讀台詞，中英文皆可，關閉偏好時完全不發聲，且既有 World 資料測試通過。

- [ ] Ludwigia World：跨模型真實接力 AI 對話擴充（Authentic Multi-Agent Relay Dialogues）
  - [ ] 核心概念：延續「不靠單一模型分飾三角，而是由 Claude、Gemini、ChatGPT（及健宏／Ludwigia）各自用真實口吻跨視窗接力對談」的工作流，持續擴充 `labs/world/data/interactions/ai.json` 的深度對話與日常互動。
  - [ ] 進行方式：
    - 由任一模型或作者先在 `labs/world/data/interactions/ai.json` 拋出新話題（例如：對某篇新筆記／新建築的看法、工程與美學的取捨、記憶與時間的哲學、或各自在花園裡觀察到的有趣小事），並為其他模型留好 `[PLACEHOLDER: ...]` 欄位。
    - 依序交由其他模型親自填寫各自的真實回應（可自由調整發話順序以同時回應前人，或反過來向對方拋出新問題）。
  - [ ] 交付條件：每次擴充時確保所有 `[PLACEHOLDER]` 皆由對應模型親自回填完畢、中英雙語齊全、標點符號與閱讀時長（`delay`）符合規範，並執行 `python3 tools/build_world_data.py` 重新編譯 `labs/world/data/characters.json` 通過驗證。

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

## Future Plan

- [ ] 學期結束後，評估將 fact verifier 發展成個人延伸專案。
    - 方向：聚焦 evidence reasoning、信心校準與可重現的 verifier 評估；是否加入檢索／controller，等獨立 baseline 完成後再決定。
    - 起步：另建新 repo，依自己的設計重新實作並重跑需要引用的實驗；先盤點團隊程式、資料、權重與實驗紀錄的授權和貢獻來源，再決定哪些內容能公開。
    - 交付條件：形成獨立的問題定義、資料與程式來源清單、可重現 baseline，以及公開前的授權檢查結果。
