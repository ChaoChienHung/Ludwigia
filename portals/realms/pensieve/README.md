# Pensieve（儲思盆）

> **儲思盆 · 記憶與生活片段** / **Pensieve · Living Memory Sanctuary**

## About

**Pensieve（儲思盆）** 是 Ludwigia 站內一座 2.5D 等軸測互動記憶空間（`portals/realms/pensieve/`）。它以純前端原生 JavaScript + Canvas 2D 打造，無後端依賴，並即時連動全站的主題色盤（Palette Tokens）。

走進這裡，你可以自由漫步、推開自動感應門、切換晨昏與銀河光影、聆聽程式即時合成的自然白噪音，並與居住其中的角色交談或旁聽他們之間的日常互動。這座空間把不同人生階段的記憶場域折疊在同一張地圖上：

- **西翼（私人與學業記憶）**：Ludwig 家宅與橘貓餅餅、花園露台、男十一舍 211 寢室、三民高中紀念教室
- **中軸（中央廣場）**：石磚林蔭大道與雙層噴泉中庭
- **東翼（研究、職場與生活）**：AI 研究工作室、總圖書館、字節跳動研發中心、獨立咖啡廳、心靈小屋「你今天過得好嗎」、校園籃球場與中央宵夜街
- **南境（冥域與遊戲記憶）**：電競網咖與咆哮深淵（Howling Abyss）長橋

## 為什麼取名 Pensieve（典故與設計意涵）

**Pensieve**（繁體中文譯作「儲思盆」，簡體中文譯作「冥想盆」）源自 J.K. Rowling《哈利波特》（*Harry Potter*）中的魔法器物，是英文 **pensive**（沉思的、陷入思索的）與 **sieve**（篩子）的混成雙關詞。在原著中，當腦海裡的思緒與記憶太過滿溢時，巫師會將珍貴的記憶抽出、注入盆中妥善保存，日後只要俯身其中，便能隨時重訪當時的場景與對話。

相較於泛稱的「World（世界）」，**Pensieve** 更精準地表達了這個空間的本質：

1. **解釋了時空的折疊**：高中教室、大學宿舍、實習辦公室、家裡與 AI 工作室在現實中不可能物理相鄰；在儲思盆裡，不同時期的人與地方並置於同一座平面上，正因為這裡收容的是**記憶與生活切片**。
2. **與全站隱喻形成完整三角**：
   - **Digital Garden（數位花園）**：向外生長、公開整理的知識筆記與文章
   - **Toolkit / Grimoire（魔導書）**：可反覆召喚的工具、提示詞與工作流
   - **Pensieve（儲思盆）**：向內沉澱、藏著重要的人與生活片段的私密記憶空間
3. **保有私密與儀式感**：入口設有一道彩蛋密語鎖，正如儲思盆只向熟知其主人的人敞開。

## 資料與維護

- **角色與對話單一真相來源（SSOT）**：
  - 角色設定：`data/characters/<id>/character.json`（區分玩家主動對話 `dialogues.user` 與環境獨白 `dialogues.self`）
  - 角色互聊：`data/interactions/*.json`
  - 執行期快取：`data/characters.json`（**勿手改**，由工具編譯生成並納入版控）
- **常用指令**（於 repo 根目錄執行）：

```bash
# 重新編譯角色與互動資料快取
python3 cli.py build-pensieve

# 檢查 characters.json 是否與 source 同步
python3 cli.py build-pensieve --check

# 執行 Pensieve 資料與色盤契約測試
python3 -m unittest portals/realms/pensieve/tests/test_pensieve_data.py
```

- **相關規格與設計文件**：
  - 引擎與幾何規格：[docs/specs/isometric-world-spec.md](../../../docs/specs/isometric-world-spec.md)
  - 地圖分區與座標藍圖：[world-map-spec.md](./world-map-spec.md)
  - Realm 境域與效能契約：[docs/specs/realm-spec.md](../../../docs/specs/realm-spec.md)
