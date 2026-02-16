# 短劇工廠 (Short Drama Factory) - 開發計劃

## Project Overview
- **Name:** 短劇工廠 (Short Drama Factory)
- **Type:** AI Short Drama Generation Platform
- **Tech Stack:** React + TypeScript + FastAPI + SQLite/PostgreSQL
- **Target:** AI short video one-stop generation tool for content creators

## Phase 1 MVP Tasks

### 1. 用戶系統 (User System)
- [ ] 用戶註冊 (Email/Password)
- [ ] 用戶登入 (JWT Authentication)
- [ ] Session 管理
- [ ] 個人資料設定

### 2. 項目管理 (Project CRUD)
- [ ] 項目列表頁面
- [ ] 創建新項目
- [ ] 項目詳情頁面
- [ ] 項目編輯/刪除
- [ ] 項目狀態追蹤

### 3. 創作流程 (Creative Flow)
- [ ] 主題輸入頁面
- [ ] AI 大綱生成 (GPT-4)
- [ ] 大綱選擇/編輯
- [ ] 劇本生成 (劇本編輯器)
- [ ] 劇本預覽

### 4. 分鏡系統 (Scene System)
- [ ] 分鏡自動拆分
- [ ] 分鏡列表頁面
- [ ] 分鏡編輯器
  - 時長設定
  - 場景描述
  - 人物描述
  - 運鏡指示
  - 對話/旁白
  - 背景音效
  - 情緒標籤

### 5. 參數設定 (Settings)
- [ ] 分鏡時長設定 (3-10秒)
- [ ] 畫面尺寸選擇 (9:16, 16:9, 1:1, 4:3)
- [ ] 總劇長度選擇
- [ ] 輸出品質設定
- [ ] 幀率設定
- [ ] 風格Preset選擇

### 6. 人物生成 (Character Generation)
- [ ] 人物描述輸入
- [ ] ComfyUI 人物圖像生成
- [ ] 人物庫管理
- [ ] 人物保存/重用

### 7. 分鏡生成 (Scene Generation)
- [ ] 首幀生成 (文生圖)
- [ ] 尾幀生成 (文生圖)
- [ ] 生成進度顯示
- [ ] 生成結果預覽

### 8. 導出功能 (Export)
- [ ] 導出為圖片格式
- [ ] 導出為視頻格式 (MP4)
- [ ] 下載功能

## Technical Implementation

### Backend (FastAPI)
- /api/auth - 認證路由
- /api/projects - 項目CRUD
- /api/creative - 創作流程 (主題/大綱/劇本)
- /api/scenes - 分鏡管理
- /api/characters - 人物生成
- /api/generate - 圖像/視頻生成
- /api/export - 導出功能

### Frontend (React + TypeScript)
- /pages - 頁面組件
- /components - 可重用組件
- /hooks - 自定義 hooks
- /services - API 調用
- /stores - 狀態管理

### Database Schema (SQLite for MVP)
- users - 用戶表
- projects - 項目表
- scenes - 分鏡表
- characters - 人物表
- scripts - 劇本表

## Development Order

1. **Week 1:** 項目結構 + 用戶系統 + 基礎Layout
2. **Week 2:** 項目CRUD + 創作流程
3. **Week 3:** 分鏡系統 + 參數設定
4. **Week 4:** 人物生成 + 分鏡生成
5. **Week 5:** 導出功能 + 優化
6. **Week 6:** 測試 + Bug修復 + 文檔

## Success Criteria
- [ ] 用戶可註冊/登入
- [ ] 可創建/編輯/刪除項目
- [ ] 可完成 主題→大綱→劇本 流程
- [ ] 可拆分/編輯分鏡
- [ ] 可生成人物圖像
- [ ] 可生成分鏡首尾幀
- [ ] 可導出結果
