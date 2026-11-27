# AGENTS — Portals & Realms

本文件承接根目錄 `AGENTS.md` 在 `portals/` 子系統（Portals 樞紐、Digital Garden 與 Pensieve 儲思盆）的專屬契約與驗證指令（依 `docs/design/design.md` §17 無損分流原則獨立維護，避免膨脹根目錄上限）。修改此目錄下的程式、樣式或資料前，請先遵守本文件與根目錄 `AGENTS.md`。

## 常用指令

- 重建 Portals 資產：`python3 cli.py build-portals`
- 重新編譯 Pensieve 角色與互動快取：`python3 cli.py build-pensieve`
- 檢查 Pensieve 快取是否與 source 同步：`python3 cli.py build-pensieve --check`
- 完整測試守門：`python3 cli.py test`

## 入口邊界與生成物白名單

- **Portals 職責**：`portals/index.html` 負責 Garden / Pensieve 等境域導覽；FAB 僅直達 Portals / Labs。
- **Digital Garden（`portals/realms/garden/`）**：
  - `portals/realms/garden/index.html` 承擔 Garden landing + Patch view（同頁），資料只讀全站索引 `window.SITE_SEARCH_INDEX`，不維護第二份 tags/summary/related。
  - `tag/index.html` 是穩定的 tag detail 入口；Garden 保留給探索視角，不承擔 tag detail page。
  - Garden 屬獨立 UI / extension surface，可保留自己的 theme 與 runtime，不因主站 theme contract 而被迫同步套用同一套 ambient effect；若未來接上主站 theme，必須是顯式整合契約。
- **部署必需生成物白名單（必須 commit）**：
  - `portals/assets/`
  - `portals/realms/garden/floral-assets/`
  - `portals/realms/pensieve/data/characters.json`
- **必須 `.gitignore` 的本機生成物**：例如 `portals/realms/garden/_floral_dist/`。

## 跨 Realm 共用契約：可見內容成本（Visible-Cost Scaling）

Portals 與各 Realm 的每幀成本必須跟著「畫面可見內容」成長，不得跟著世界總量成長（細則與量測方式見 `docs/specs/realm-spec.md` §6）：

- 深度排序只在螢幕 x 欄位重疊的實體之間建邊，不得退回全量兩兩比對。
- 地形、貼花、崖壁、粒子與靜態實體一律依 `viewRect` 裁剪。
- 主迴圈不得每幀無條件寫 DOM 或 CSS 變數。
- 不可見或透明度為 0 的元素不得常駐 `will-change` 合成層。
- 必須遵守 `prefers-reduced-motion`。

## Pensieve（`portals/realms/pensieve/`）不可退化契約

1. **資料與執行期嚴格解耦（SSOT）**
   - 所有人物角色（家人、室友、AI 夥伴、國高中同學、抖音實習同事）之性別、外觀配色、初始坐標、出沒區域、多語系稱謂（`role`）與對話集，皆以 `portals/realms/pensieve/data/characters/<id>/character.json` 與 `portals/realms/pensieve/data/interactions/*.json` 為創作真相來源（SSOT），由 `tools/build_pensieve_data.py`（或 `cli.py build-pensieve`）再現性編譯為執行期快取 `portals/realms/pensieve/data/characters.json`。
   - 單人對話須區分 `dialogues.user`（玩家主動交談）與 `dialogues.self`（環境獨白），角色互聊只維護在 `interactions/` 的 `npcDialogues`，後兩者可隨機觸發。
   - 前端執行期（`characters.js`）只負責載入解析與動態語言切換，嚴禁在 HTML 或 JS 中手動維護第二份人物名冊或對話資料。

2. **鏡頭縮放以視口中心／玩家為軸心（Centered Viewport Zoom Focus）**
   - 鏡頭 `zoom` 縮放與點擊尋路逆投影必須永遠以視口幾何中心（即焦點玩家所在之屏幕中心）為錨定軸心，不得退化為以世界原點 `(ox, oy)` 為縮放中心，確保玩家走入任何遠端分區建築（如三民高中、抖音研發中心）時皆能精準聚焦於室內與角色，杜絕畫面失焦偏移。

3. **等軸測牆面剪切與幾何斜度對齊契約（Isometric Wall Projection Contract）**
   - 建築牆面上的黑板、掛鐘、門樑招牌等平面裝飾，必須與所依附的牆面軸向傾角精確匹配：
     - 北向與南向橫牆（沿 X 軸）必須使用 `(1, 0.5, 0, 1, 0, 0)` 剪切矩陣。
     - 東向與西向縱牆（沿 Y 軸）必須使用 `(1, -0.5, 0, 1, 0, 0)` 剪切矩陣。
   - 文字、算式與圖表嚴禁水平裸繪。

4. **拓撲深度排序無閉環契約（Cycle-Free Topological Depth Sorting）**
   - 立體建築牆體、門樑、大型家具（如圖書館大型落地書櫃、教室課桌椅群）之包圍盒邊界（Bounding Box）必須嚴格維持前／後景拓撲因果分層（例如後牆 `yMax` 嚴格小於或等於家具 `yMin`）。
   - 嚴禁在家具背後疊加重疊包圍盒之裝飾，杜絕人物走動時觸發深度閉環而產生模型閃爍（Flickering / Glitch）或破面消失。

5. **全站 Design System 繼承與實時色盤聯動契約（Theme & Palette Contract）**
   - `portals/realms/pensieve/` 之 HUD 玻璃擬態面板、狀態徽章、互動提示、高亮焦點外框必須從 `assets/css/site/palette-tokens.css` 共用全站 11 套色盤值，再投影為 Pensieve 的 `--space-accent` / `--space-accent-glow`。
   - 不得在 `world.css` 平行維護第二份 palette 色碼，並須實時監聽 `ludwig-palette-changed` 與 `ludwig-theme-changed` 事件，確保跨頁面偏好變更時即時無感重繪。

## 延伸閱讀

- Realm 通用規格與效能基準：`docs/specs/realm-spec.md`
- 2.5D 等軸測幾何與演算法規格：`docs/specs/isometric-world-spec.md`
- Pensieve 簡介與維護：`portals/realms/pensieve/README.md`
- 效能排查現況：`docs/tech/portals-world-performance.md`
