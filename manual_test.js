// 手動測試腳本
import AccountManager from './src/accounts.js';

console.log('🧪 開始認證系統測試...');

// 1. 清除現有資料
localStorage.clear();
sessionStorage.clear();
console.log('✅ 已清除存儲');

// 2. 創建帳號管理器
const accountManager = new AccountManager();
accountManager.initialize();

// 3. 創建測試帳號
if (accountManager.accounts.length === 0) {
    const account = accountManager.createFirstAdminAccount();
    console.log('✅ 測試帳號已創建:', {
        username: account.username,
        password: accountManager.FIXED_PASSWORD
    });

    // 4. 測試驗證
    const isValid = accountManager.validateAccount(account.username, accountManager.FIXED_PASSWORD);
    console.log('✅ 帳號驗證結果:', isValid);

    // 5. 模擬登入成功
    if (isValid) {
        const authData = {
            authenticated: true,
            username: account.username,
            loginTime: Date.now(),
            expires: Date.now() + (8 * 3600 * 1000)
        };

        sessionStorage.setItem('factoryAuth', JSON.stringify(authData));
        console.log('✅ 登入模擬完成');

        // 6. 測試認證檢查
        const authCheck = sessionStorage.getItem('factoryAuth');
        if (authCheck) {
            const auth = JSON.parse(authCheck);
            const isAuthenticated = Date.now() < auth.expires && auth.authenticated;
            console.log('✅ 認證檢查結果:', isAuthenticated);
        }
    }
} else {
    console.log('ℹ️ 已有帳號存在');
}

console.log('🧪 測試完成');