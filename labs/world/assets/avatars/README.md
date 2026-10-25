# Ludwigia World Character Avatars (角色對話框頭像圖庫)

這個目錄提供存放 Ludwigia World 2.5D 世界中各角色的專屬對話框頭像圖片（支援 `.png`、`.jpg`、`.webp`、`.svg` 等格式）。

## 使用方式

1. 將頭像圖片放入此資料夾（建議尺寸：正方形，例如 `128x128` 或 `256x256`，圓角與邊框會由 CSS 自動美化適配）。
   - 例如：`happy.png`、`kerry.png`、`ludwig.png`、`yully.png`、`mochi.png` ...
2. 在 [`labs/world/data/characters.json`](../data/characters.json) 中將角色的 `"avatar"` 欄位指向該路徑即可：
   ```json
   {
     "id": "happy",
     "name": "Happy Wang",
     "avatar": "assets/avatars/happy.png",
     "avatarFallback": "🧑‍💻"
   }
   ```
3. 若未設定圖片路徑或圖片載入失敗，系統會自動 fallback 優雅降級顯示 `"avatarFallback"`（或原有的 Emoji）。
