// 亂數帳號管理系統
class AccountManager {
    constructor() {
        this.FIXED_PASSWORD = 'Ys@22466564';
        this.accounts = this.loadAccounts();
        this.bindingRecords = this.loadBindingRecords();
    }

    // 生成亂數帳號
    generateRandomAccount() {
        const prefixes = ['YS', 'FC', 'AD', 'OP', 'MG', 'SU', 'TK', 'WK'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const numbers = Math.floor(Math.random() * 900000) + 100000; // 6位數
        const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z

        return `${prefix}${numbers}${suffix}`;
    }

    // 創建新帳號
    createAccount(description = '') {
        const account = {
            username: this.generateRandomAccount(),
            password: this.FIXED_PASSWORD,
            createdAt: new Date().toISOString(),
            description: description || '系統自動生成',
            isActive: true,
            lastLoginAt: null,
            loginCount: 0
        };

        this.accounts.push(account);
        this.saveAccounts();

        console.log('🆕 新帳號已創建:', account.username);
        return account;
    }

    // 驗證帳號
    validateAccount(username, password) {
        const account = this.accounts.find(acc =>
            acc.username === username &&
            acc.password === password &&
            acc.isActive
        );

        if (account) {
            // 更新登入記錄
            account.lastLoginAt = new Date().toISOString();
            account.loginCount++;
            this.saveAccounts();

            console.log('✅ 帳號驗證成功:', username);
            return true;
        }

        console.log('❌ 帳號驗證失敗:', username);
        return false;
    }

    // 停用帳號
    deactivateAccount(username) {
        const account = this.accounts.find(acc => acc.username === username);
        if (account) {
            account.isActive = false;
            this.saveAccounts();

            // 同時移除該帳號的TOTP綁定
            this.removeAccountBinding(username);

            console.log('🚫 帳號已停用:', username);
            return true;
        }
        return false;
    }

    // 獲取帳號列表
    getAccountList() {
        return this.accounts.map(acc => ({
            username: acc.username,
            description: acc.description,
            createdAt: acc.createdAt,
            lastLoginAt: acc.lastLoginAt,
            loginCount: acc.loginCount,
            isActive: acc.isActive,
            isBound: this.isAccountBound(acc.username)
        }));
    }

    // 檢查帳號是否已綁定TOTP
    isAccountBound(username) {
        return this.bindingRecords.some(record =>
            record.username === username && record.isActive
        );
    }

    // 綁定TOTP到帳號
    bindTOTP(username, totpSecret, deviceInfo = {}) {
        // 檢查帳號是否存在且活躍
        const account = this.accounts.find(acc =>
            acc.username === username && acc.isActive
        );

        if (!account) {
            throw new Error('帳號不存在或已停用');
        }

        // 檢查是否已綁定
        if (this.isAccountBound(username)) {
            throw new Error('此帳號已綁定TOTP');
        }

        const binding = {
            username: username,
            totpSecret: totpSecret,
            boundAt: new Date().toISOString(),
            deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                ...deviceInfo
            },
            isActive: true,
            lastUsedAt: null
        };

        this.bindingRecords.push(binding);
        this.saveBindingRecords();

        console.log('🔗 TOTP 綁定成功:', username);
        return binding;
    }

    // 解除TOTP綁定
    unbindTOTP(username) {
        const binding = this.bindingRecords.find(record =>
            record.username === username && record.isActive
        );

        if (binding) {
            binding.isActive = false;
            binding.unboundAt = new Date().toISOString();
            this.saveBindingRecords();

            console.log('🔓 TOTP 綁定已解除:', username);
            return true;
        }

        return false;
    }

    // 獲取帳號的TOTP Secret
    getTOTPSecret(username) {
        const binding = this.bindingRecords.find(record =>
            record.username === username && record.isActive
        );

        if (binding) {
            // 更新最後使用時間
            binding.lastUsedAt = new Date().toISOString();
            this.saveBindingRecords();
            return binding.totpSecret;
        }

        return null;
    }

    // 移除帳號的所有綁定記錄
    removeAccountBinding(username) {
        this.bindingRecords = this.bindingRecords.filter(record =>
            record.username !== username
        );
        this.saveBindingRecords();
    }

    // 獲取綁定記錄列表
    getBindingRecords() {
        return this.bindingRecords
            .filter(record => record.isActive)
            .map(record => ({
                username: record.username,
                boundAt: record.boundAt,
                lastUsedAt: record.lastUsedAt,
                deviceInfo: record.deviceInfo
            }))
            .sort((a, b) => new Date(b.boundAt) - new Date(a.boundAt));
    }

    // 獲取統計資訊
    getStatistics() {
        const totalAccounts = this.accounts.length;
        const activeAccounts = this.accounts.filter(acc => acc.isActive).length;
        const boundAccounts = this.bindingRecords.filter(record => record.isActive).length;
        const recentLogins = this.accounts.filter(acc => {
            if (!acc.lastLoginAt) return false;
            const lastLogin = new Date(acc.lastLoginAt);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return lastLogin > oneDayAgo;
        }).length;

        return {
            totalAccounts,
            activeAccounts,
            boundAccounts,
            recentLogins,
            bindingRate: activeAccounts > 0 ? (boundAccounts / activeAccounts * 100).toFixed(1) : 0
        };
    }

    // 儲存帳號列表
    saveAccounts() {
        localStorage.setItem('factory_accounts', JSON.stringify(this.accounts));
    }

    // 載入帳號列表
    loadAccounts() {
        const stored = localStorage.getItem('factory_accounts');
        return stored ? JSON.parse(stored) : [];
    }

    // 儲存綁定記錄
    saveBindingRecords() {
        localStorage.setItem('factory_bindings', JSON.stringify(this.bindingRecords));
    }

    // 載入綁定記錄
    loadBindingRecords() {
        const stored = localStorage.getItem('factory_bindings');
        return stored ? JSON.parse(stored) : [];
    }

    // 清除所有數據（危險操作）
    clearAllData() {
        if (confirm('⚠️ 警告：這將清除所有帳號和綁定記錄，確定要繼續嗎？')) {
            localStorage.removeItem('factory_accounts');
            localStorage.removeItem('factory_bindings');
            this.accounts = [];
            this.bindingRecords = [];
            console.log('🧹 所有帳號數據已清除');
            return true;
        }
        return false;
    }

    // 匯出數據
    exportData() {
        const data = {
            accounts: this.accounts,
            bindings: this.bindingRecords.map(record => ({
                ...record,
                totpSecret: '***隱藏***' // 不匯出敏感密鑰
            })),
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `factory_accounts_${new Date().getTime()}.json`;
        link.click();

        URL.revokeObjectURL(url);
        console.log('📤 帳號數據已匯出');
    }

    // 初始化（僅載入現有帳號，不自動創建）
    initialize() {
        // 如果沒有任何帳號，自動創建一個預設測試帳號
        if (this.accounts.length === 0) {
            console.log('🔧 偵測到無帳號，自動創建測試帳號...');
            this.createAccount('自動創建的測試帳號');
        }
        console.log(`📋 系統載入完成，目前有 ${this.accounts.length} 個帳號`);
        return null;
    }

    // 管理員專用：創建第一個管理員帳號
    createFirstAdminAccount() {
        if (this.accounts.length > 0) {
            throw new Error('系統已有帳號，無法創建初始管理員帳號');
        }

        const adminAccount = this.createAccount('系統管理員帳號');
        console.log(`🔑 已創建首個管理員帳號: ${adminAccount.username}`);
        return adminAccount;
    }
}

// 導出
export default AccountManager;