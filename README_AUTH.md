# 🔐 Authenticator App 認證系統

## ✨ 認證方式

### TOTP (Time-based One-Time Password)
- **標準協議**：RFC 6238
- **更新頻率**：每30秒
- **驗證碼長度**：6位數
- **時間窗口**：允許前後1個窗口誤差

## 🚀 設置流程

### 1. 初次訪問
- 自動跳轉到 `/setup.html` 設置頁面
- 生成專屬的 Secret Key
- 顯示 QR Code 供掃描

### 2. App 設置
**支援的應用程式：**
- 🔵 Google Authenticator
- 🔷 Microsoft Authenticator
- 🔶 Authy
- 🔐 1Password / Bitwarden

**設置步驟：**
1. 下載任一 Authenticator App
2. 掃描 QR Code 或手動輸入密鑰
3. 測試驗證碼確保設置正確
4. 完成設置

### 3. 日常登入
- 訪問系統 → 跳轉到 `/login.html`
- 打開 Authenticator App 查看6位數驗證碼
- 輸入驗證碼 → 成功登入

## 🛡️ 安全機制

### 防重放攻擊
- 每個驗證碼只能使用一次
- 90秒後自動清除使用記錄

### 防暴力破解
- 5次錯誤嘗試後鎖定5分鐘
- 時間窗口容錯機制

### 會話管理
- 8小時自動過期
- SessionStorage（瀏覽器關閉自動清除）
- 右上角登出功能

## 🔧 技術實現

### TOTP 算法
```javascript
HMAC-SHA1(Secret, TimeStep)
動態截取 → 6位數驗證碼
```

### 無敏感資訊
- 使用 Web Crypto API
- Secret Key 儲存在 localStorage
- 無硬編碼密碼
- 避免 GitHub 機敏掃描

### 多人擴展
- 每人獨立的 Secret Key
- 可輕鬆添加多個使用者
- 管理員可重置密鑰

## 📱 開發模式

### 測試輔助
- 控制台顯示當前有效驗證碼
- 剩餘時間倒數計時
- 錯誤處理友好提示

### 重置功能
- 設置頁面可重新生成密鑰
- 清除舊設置重新開始
- 支援多設備備份

## 🌐 網址結構

- **主系統**：`/`
- **登入頁**：`/login.html`
- **設置頁**：`/setup.html`
- **自動跳轉**：未設置 → 設置頁，未認證 → 登入頁

**更簡單、更安全、更專業的企業級認證解決方案！** 🎉