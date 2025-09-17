# 鈺祥企業柳營再生戰情中心 - WISE-IOT Dashboard

基於研華 WISE-IOT 與 iEMS 概念發展的工廠智慧監控儀表板，用於與廠商溝通展示的互動式概念示意系統。

## 專案概述

本專案為工廠戰情中心的可視化展示系統，整合多項關鍵生產指標與監控數據，提供即時的生產狀況監控與分析功能。

## 功能特色

### 核心監控模組
- **機台 OEE 監控**: First Pass Yield (FPY) 與 Roll Throughput Yield (RTY) 追蹤
- **產出計畫對比**: 實際產出與計畫目標的即時比較分析
- **瓶頸分析排行**: Top 瓶頸工站利用率與等候時間統計
- **品質 Pareto 分析**: 缺陷類型分佈與重工率監控

### 環境與製程監控
- **環境參數**: 溫度、濕度、AMC 濃度即時監控
- **SPC 烘箱製程**: 關鍵製程參數統計管制
- **AOI 缺陷密度**: 光學檢測 False Positive/Negative 率追蹤
- **能源管理**: 尖峰離峰用電分析與單位良品耗能

### 維運管理
- **告警系統**: 即時異常告警與 MTTA/MTTR 統計
- **設備狀態**: 烘箱等關鍵設備的詳細運行參數

## 技術架構

### 前端技術
- **Vite**: 現代化前端建置工具
- **Chart.js**: 圖表視覺化函式庫
- **原生 JavaScript**: 輕量化實作，無複雜框架依賴
- **CSS Grid**: 響應式儀表板佈局

### 部署平台
- **Vercel**: 雲端託管平台，支援自動部署
- **GitHub**: 程式碼版本控制與協作

## 快速開始

### 環境需求
- Node.js 16+
- npm 或 yarn

### 安裝與執行
```bash
# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev

# 建置正式版本
npm run build

# 預覽建置結果
npm run preview
```

### 部署
專案已配置 Vercel 自動部署，推送至 main 分支即可觸發更新。

## 專案結構

```
├── index.html              # 主要 HTML 入口
├── src/
│   ├── main.js             # 主要邏輯與圖表初始化
│   └── style.css           # 樣式定義
├── public/
│   └── factory-image.png   # 靜態資源
├── vercel.json             # Vercel 部署配置
└── package.json            # 專案相依性設定
```

## 開發原則遵循

1. **清爽專業設計**: 採用現代化 UI 設計，保持介面簡潔專業
2. **技術選用**: 使用輕量化技術棧，避免過度複雜的框架
3. **資源復用**: 基於既有 HTML 結構進行模組化重構
4. **版本控制**: 每個開發階段進行適當的 commit 與文件更新
5. **完整測試**: 確保所有功能模組正常運行後才進行部署

## 部署連結

- **正式環境**: https://wise-iot-center.vercel.app
- **GitHub Repository**: https://github.com/seikaikyo/Interactive_artifact.git

## 維護說明

此系統為概念展示用途，數據為模擬生成。實際部署時需要整合真實的 IoT 數據源與 API 介面。

---

**開發者**: 選我正解
**最後更新**: 2025-09-17