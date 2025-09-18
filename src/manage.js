// 管理頁面邏輯
import AccountManager from './accounts.js';
import { FactoryTOTP } from './totp.js';

class ManageInterface {
    constructor() {
        this.accountManager = new AccountManager();
        this.totp = new FactoryTOTP();
        this.currentUser = this.getCurrentUser();

        if (!this.currentUser) {
            alert('未登入或會話已過期，請重新登入');
            window.location.href = '/login.html';
            return;
        }

        this.init();
    }

    init() {
        // 初始化帳號管理器（不自動創建帳號）
        this.accountManager.initialize();

        // 更新界面
        this.updateCurrentUserDisplay();
        this.updateSystemStats();
        this.updateCurrentAccountStatus();
        this.updateAccountsTable();
        this.updateBindingsTable();

        // 定期刷新數據
        setInterval(() => {
            this.updateSystemStats();
            this.updateAccountsTable();
            this.updateBindingsTable();
        }, 30000); // 30秒刷新一次
    }

    getCurrentUser() {
        try {
            const authData = sessionStorage.getItem('factoryAuth');
            if (!authData) return null;

            const auth = JSON.parse(authData);
            if (Date.now() > auth.expires || !auth.authenticated) {
                sessionStorage.removeItem('factoryAuth');
                return null;
            }

            return auth.username || 'Unknown';
        } catch (error) {
            return null;
        }
    }

    updateCurrentUserDisplay() {
        const userEl = document.getElementById('currentUser');
        userEl.textContent = `👤 ${this.currentUser}`;
    }

    updateSystemStats() {
        const stats = this.accountManager.getStatistics();

        document.getElementById('totalAccounts').textContent = stats.totalAccounts;
        document.getElementById('activeAccounts').textContent = stats.activeAccounts;
        document.getElementById('boundAccounts').textContent = stats.boundAccounts;
        document.getElementById('bindingRate').textContent = stats.bindingRate + '%';
    }

    updateCurrentAccountStatus() {
        const isBound = this.accountManager.isAccountBound(this.currentUser);
        const statusEl = document.getElementById('bindingStatus');
        const btnEl = document.getElementById('bindingBtn');

        if (isBound) {
            statusEl.className = 'binding-status bound';
            statusEl.innerHTML = `
                <strong>✅ 已綁定 Authenticator</strong>
                <p style="margin-top: 5px; font-size: 13px;">
                    您的帳號已啟用雙重驗證保護
                </p>
            `;
            btnEl.textContent = '🔓 解除綁定';
            btnEl.onclick = () => this.unbindTOTP();
        } else {
            statusEl.className = 'binding-status unbound';
            statusEl.innerHTML = `
                <strong>⚠️ 尚未綁定 Authenticator</strong>
                <p style="margin-top: 5px; font-size: 13px;">
                    建議立即綁定以提高帳號安全性
                </p>
            `;
            btnEl.textContent = '🔗 立即綁定 Authenticator';
            btnEl.onclick = () => this.startBinding();
        }
    }

    updateAccountsTable() {
        const accounts = this.accountManager.getAccountList();
        const tbody = document.getElementById('accountsTableBody');

        if (accounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; opacity: 0.7;">暫無帳號記錄</td></tr>';
            return;
        }

        tbody.innerHTML = accounts.map(account => `
            <tr>
                <td><strong>${account.username}</strong></td>
                <td>${account.description}</td>
                <td>${this.formatDate(account.createdAt)}</td>
                <td>${account.lastLoginAt ? this.formatDate(account.lastLoginAt) : '從未'}</td>
                <td>${account.loginCount}</td>
                <td>
                    <span class="status-badge ${account.isActive ? 'status-active' : 'status-inactive'}">
                        ${account.isActive ? '活躍' : '停用'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${account.isBound ? 'status-bound' : 'status-inactive'}">
                        ${account.isBound ? '已綁定' : '未綁定'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${account.isActive ?
                            `<button class="btn btn-small danger" onclick="manageInterface.deactivateAccount('${account.username}')">停用</button>` :
                            `<button class="btn btn-small" onclick="manageInterface.reactivateAccount('${account.username}')">啟用</button>`
                        }
                        ${account.isBound ?
                            `<button class="btn btn-small secondary" onclick="manageInterface.unbindAccountTOTP('${account.username}')">解綁</button>` :
                            ''
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateBindingsTable() {
        const bindings = this.accountManager.getBindingRecords();
        const tbody = document.getElementById('bindingsTableBody');

        if (bindings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; opacity: 0.7;">暫無綁定記錄</td></tr>';
            return;
        }

        tbody.innerHTML = bindings.map(binding => `
            <tr>
                <td><strong>${binding.username}</strong></td>
                <td>${this.formatDate(binding.boundAt)}</td>
                <td>${binding.lastUsedAt ? this.formatDate(binding.lastUsedAt) : '從未使用'}</td>
                <td>
                    <div style="font-size: 12px;">
                        <div>${binding.deviceInfo.platform || 'Unknown'}</div>
                        <div style="opacity: 0.7;">${binding.deviceInfo.language || 'Unknown'}</div>
                    </div>
                </td>
                <td>
                    <button class="btn btn-small danger" onclick="manageInterface.unbindAccountTOTP('${binding.username}')">
                        解除綁定
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async startBinding() {
        try {
            if (this.accountManager.isAccountBound(this.currentUser)) {
                alert('此帳號已綁定 TOTP，無法重複綁定');
                return;
            }

            // 生成新的TOTP密鑰
            const secret = this.totp.generateSecret();

            // 生成QR Code
            const qrUrl = this.totp.generateQRCodeURL(secret, this.currentUser);

            // 顯示QR Code彈窗
            this.showQRModal(qrUrl, secret);

            // 進行綁定
            this.accountManager.bindTOTP(this.currentUser, secret, {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });

            console.log(`🔗 ${this.currentUser} 的 TOTP 綁定已完成`);

            // 更新界面
            this.updateCurrentAccountStatus();
            this.updateSystemStats();
            this.updateBindingsTable();

        } catch (error) {
            alert(`綁定失敗: ${error.message}`);
            console.error('綁定錯誤:', error);
        }
    }

    unbindTOTP() {
        if (confirm('確定要解除當前帳號的 TOTP 綁定嗎？解除後需要重新綁定才能使用雙重驗證。')) {
            const success = this.accountManager.unbindTOTP(this.currentUser);
            if (success) {
                alert('TOTP 綁定已解除');
                this.updateCurrentAccountStatus();
                this.updateSystemStats();
                this.updateBindingsTable();
            } else {
                alert('解除綁定失敗');
            }
        }
    }

    unbindAccountTOTP(username) {
        if (confirm(`確定要解除帳號 ${username} 的 TOTP 綁定嗎？`)) {
            const success = this.accountManager.unbindTOTP(username);
            if (success) {
                alert(`帳號 ${username} 的 TOTP 綁定已解除`);
                this.updateSystemStats();
                this.updateAccountsTable();
                this.updateBindingsTable();
                if (username === this.currentUser) {
                    this.updateCurrentAccountStatus();
                }
            } else {
                alert('解除綁定失敗');
            }
        }
    }

    deactivateAccount(username) {
        if (username === this.currentUser) {
            alert('無法停用當前登入的帳號');
            return;
        }

        if (confirm(`確定要停用帳號 ${username} 嗎？停用後該帳號將無法登入。`)) {
            const success = this.accountManager.deactivateAccount(username);
            if (success) {
                alert(`帳號 ${username} 已停用`);
                this.updateSystemStats();
                this.updateAccountsTable();
                this.updateBindingsTable();
            } else {
                alert('停用失敗');
            }
        }
    }

    reactivateAccount(username) {
        const account = this.accountManager.accounts.find(acc => acc.username === username);
        if (account) {
            account.isActive = true;
            this.accountManager.saveAccounts();
            alert(`帳號 ${username} 已重新啟用`);
            this.updateSystemStats();
            this.updateAccountsTable();
        }
    }

    createNewAccount() {
        const description = prompt('請輸入新帳號的描述（可選）：') || '手動創建';
        const account = this.accountManager.createAccount(description);

        alert(`新帳號創建成功！\\n帳號: ${account.username}\\n密碼: ${this.accountManager.FIXED_PASSWORD}\\n\\n請妥善保管帳號資訊。`);

        this.updateSystemStats();
        this.updateAccountsTable();
    }

    exportData() {
        this.accountManager.exportData();
    }

    clearAllData() {
        const success = this.accountManager.clearAllData();
        if (success) {
            alert('所有數據已清除，頁面將重新載入');
            window.location.reload();
        }
    }

    showQRModal(qrUrl, secret) {
        const modal = document.getElementById('qrModal');
        const qrImg = document.getElementById('qrCodeImg');
        const secretEl = document.getElementById('secretKey');

        qrImg.src = qrUrl;
        secretEl.textContent = secret.match(/.{1,4}/g).join(' ');

        modal.style.display = 'block';
    }

    closeQRModal() {
        const modal = document.getElementById('qrModal');
        modal.style.display = 'none';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    logout() {
        if (confirm('確定要登出嗎？')) {
            sessionStorage.removeItem('factoryAuth');
            window.location.href = '/login.html';
        }
    }
}

// 全域函數
window.startBinding = () => manageInterface.startBinding();
window.closeQRModal = () => manageInterface.closeQRModal();
window.createNewAccount = () => manageInterface.createNewAccount();
window.exportData = () => manageInterface.exportData();
window.clearAllData = () => manageInterface.clearAllData();
window.logout = () => manageInterface.logout();

// 初始化
const manageInterface = new ManageInterface();
window.manageInterface = manageInterface;