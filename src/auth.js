// 帳號認證系統
import AccountManager from './accounts.js';
import { FactoryTOTP } from './totp.js';

class AuthSystem {
    constructor() {
        this.accountManager = new AccountManager();
        this.totp = new FactoryTOTP();
        this.maxAttempts = 5;
        this.attempts = 0;
        this.lockoutTime = 5 * 60 * 1000; // 5分鐘鎖定
        this.currentUser = null;

        this.init();
    }

    init() {
        // 初始化帳號管理器
        this.accountManager.initialize();

        // 檢查是否有任何帳號（如果沒有會自動創建一個）
        if (this.accountManager.accounts.length === 0) {
            console.log('🔧 創建測試帳號中...');
            // 等待一下讓自動創建完成
            setTimeout(() => {
                if (this.accountManager.accounts.length === 0) {
                    this.showNoAccountsMessage();
                    return;
                }
                this.setupLoginForm();
            }, 100);
            return;
        }

        this.setupLoginForm();
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');

        if (form) {
            form.addEventListener('submit', this.handleLogin.bind(this));
        }

        // 顯示可用帳號提示（僅在開發環境或有需要時）
        this.showAvailableAccountHint();
    }

    showAvailableAccountHint() {
        if (this.accountManager.accounts.length > 0) {
            const latestAccount = this.accountManager.accounts[this.accountManager.accounts.length - 1];
            const hintElement = document.querySelector('.login-hint');

            if (hintElement) {
                hintElement.innerHTML = `
                    <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); color: #00d4ff; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 12px;">
                        <strong>💡 提示</strong><br>
                        測試帳號：<code style="background: rgba(0, 212, 255, 0.2); padding: 2px 6px; border-radius: 4px;">${latestAccount.username}</code><br>
                        密碼：<code style="background: rgba(0, 212, 255, 0.2); padding: 2px 6px; border-radius: 4px;">Ys@22466564</code>
                    </div>
                `;
            }
        }
    }

    showNoAccountsMessage() {
        const container = document.querySelector('.login-container');
        container.innerHTML = `
            <div class="logo">
                <h1>🚫 系統尚未啟用</h1>
                <p>暫無可用的授權帳號</p>
            </div>

            <div style="text-align: center; padding: 30px;">
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); color: #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <strong>⚠️ 注意</strong><br>
                    系統管理員尚未創建任何授權帳號。<br>
                    請聯繫系統管理員開通帳號。
                </div>

                <div style="font-size: 12px; opacity: 0.7; margin-top: 15px;">
                    如需開通帳號請聯繫系統管理員
                </div>
            </div>

            <div class="footer">
                <p>WISE-IOT Dashboard v2.0</p>
            </div>
        `;
    }

    async handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showError('請輸入完整的帳號密碼');
            return;
        }

        this.showLoading('驗證中...');

        try {
            // 第一步：驗證帳號密碼
            const isValidAccount = this.accountManager.validateAccount(username, password);

            if (isValidAccount) {
                this.currentUser = username;

                // 檢查是否已綁定TOTP
                const isBound = this.accountManager.isAccountBound(username);

                if (isBound) {
                    // 已綁定，進入TOTP驗證
                    this.switchToTOTPMode();
                } else {
                    // 未綁定，直接登入成功
                    this.loginSuccess();
                }
            } else {
                this.attempts++;
                if (this.attempts >= this.maxAttempts) {
                    this.lockAccount();
                } else {
                    this.showError(`帳號或密碼錯誤 (剩餘嘗試次數: ${this.maxAttempts - this.attempts})`);
                }
            }
        } catch (error) {
            console.error('登入錯誤:', error);
            this.showError('登入過程發生錯誤，請重試');
        }

        this.hideLoading();
    }

    switchToTOTPMode() {
        // 切換到TOTP驗證模式
        const container = document.querySelector('.login-container');
        container.innerHTML = `
            <div class="logo">
                <h1>🔐 雙重驗證</h1>
                <p>請輸入 Authenticator 驗證碼</p>
            </div>

            <form id="totpForm">
                <div class="form-group">
                    <label for="totpCode">Authenticator 驗證碼</label>
                    <input type="text" id="totpCode" name="totpCode"
                           placeholder="000 000" maxlength="7"
                           style="text-align: center; font-size: 24px; letter-spacing: 8px; font-weight: 600;" required>
                    <small style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 5px; display: block;">
                        打開您的 Authenticator App 查看6位數驗證碼
                    </small>
                </div>

                <button type="submit" class="login-btn" id="totpBtn">
                    🔐 驗證登入
                </button>

                <button type="button" class="login-btn" style="background: rgba(255,255,255,0.2); margin-top: 10px;" onclick="location.reload()">
                    返回重新登入
                </button>

                <div class="error-message" id="errorMessage" style="display: none;"></div>
            </form>

            <div class="footer">
                <p>帳號：${this.currentUser}</p>
            </div>
        `;

        // 重新綁定事件
        const totpForm = document.getElementById('totpForm');
        const totpInput = document.getElementById('totpCode');

        totpForm.addEventListener('submit', this.handleTOTPVerification.bind(this));

        // 自動格式化輸入
        totpInput.addEventListener('input', this.formatTOTPInput.bind(this));
    }

    formatTOTPInput(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, '');

        if (value.length > 6) {
            value = value.substring(0, 6);
        }

        if (value.length > 3) {
            value = value.substring(0, 3) + ' ' + value.substring(3);
        }

        input.value = value;
    }

    async handleTOTPVerification(e) {
        e.preventDefault();

        console.log('🔐 開始TOTP驗證');

        const codeInput = document.getElementById('totpCode');
        if (!codeInput) {
            console.error('找不到TOTP輸入框');
            this.showError('系統錯誤：找不到輸入框');
            return;
        }

        const code = codeInput.value.replace(/\s/g, '');
        console.log('輸入的驗證碼長度:', code.length);

        if (code.length !== 6) {
            this.showError('請輸入6位數驗證碼');
            return;
        }

        this.showLoading('驗證中...');

        try {
            const secret = this.accountManager.getTOTPSecret(this.currentUser);
            console.log('獲取到的密鑰:', secret ? '✓' : '✗');

            if (!secret) {
                throw new Error('無法獲取TOTP密鑰');
            }

            const isValid = await this.totp.verifyTOTP(secret, code);
            console.log('TOTP驗證結果:', isValid);

            if (isValid) {
                console.log('✅ TOTP驗證成功，準備登入');
                this.loginSuccess();
            } else {
                this.attempts++;
                console.log(`❌ TOTP驗證失敗，剩餘嘗試次數: ${this.maxAttempts - this.attempts}`);
                if (this.attempts >= this.maxAttempts) {
                    this.lockAccount();
                } else {
                    this.showError(`驗證碼錯誤 (剩餘嘗試次數: ${this.maxAttempts - this.attempts})`);
                }
            }
        } catch (error) {
            console.error('TOTP 驗證錯誤:', error);
            this.showError('驗證過程發生錯誤，請重試');
        }

        this.hideLoading();
    }

    loginSuccess() {
        this.setAuthSession();

        // 確保 sessionStorage 資料已設置完成再跳轉
        setTimeout(() => {
            this.showSuccess('🎉 登入成功！正在跳轉...', () => {
                window.location.href = '/';
            });
        }, 100);
    }



    setAuthSession() {
        const authData = {
            authenticated: true,
            username: this.currentUser,
            loginTime: Date.now(),
            expires: Date.now() + (8 * 3600 * 1000) // 8小時
        };

        // 使用 sessionStorage 而非 localStorage，瀏覽器關閉後自動清除
        sessionStorage.setItem('factoryAuth', JSON.stringify(authData));

        console.log(`✅ 用戶 ${this.currentUser} 登入成功`);

        // 設置自動登出
        setTimeout(() => {
            this.logout();
        }, 8 * 3600 * 1000);
    }

    lockAccount() {
        this.showError('嘗試次數過多，帳號已鎖定5分鐘');

        // 嘗試找到當前的按鈕（可能是loginBtn或totpBtn）
        const btn = document.getElementById('loginBtn') || document.getElementById('totpBtn');
        if (btn) {
            btn.disabled = true;
        }

        setTimeout(() => {
            this.attempts = 0;

            // 恢復按鈕狀態
            const btn = document.getElementById('loginBtn') || document.getElementById('totpBtn');
            if (btn) {
                btn.disabled = false;
            }

            this.hideError();
        }, this.lockoutTime);
    }

    showLoading(message) {
        // 嘗試找到當前的按鈕（可能是loginBtn或totpBtn）
        const btn = document.getElementById('loginBtn') || document.getElementById('totpBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = message;
        }
    }

    hideLoading() {
        // 嘗試找到當前的按鈕（可能是loginBtn或totpBtn）
        const btn = document.getElementById('loginBtn') || document.getElementById('totpBtn');
        if (btn) {
            btn.disabled = false;
            // 根據當前頁面狀態設置正確的文字
            if (btn.id === 'totpBtn') {
                btn.textContent = '🔐 驗證登入';
            } else {
                btn.textContent = '🔐 驗證登入';
            }
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.style.display = 'none';
    }

    showSuccess(message, callback) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        errorDiv.style.borderColor = 'rgba(76, 175, 80, 0.3)';
        errorDiv.style.color = '#4CAF50';

        if (callback) {
            setTimeout(callback, 1500);
        }
    }

    logout() {
        sessionStorage.removeItem('factoryAuth');
        window.location.href = '/login.html';
    }

    // 靜態方法：檢查是否已認證
    static isAuthenticated() {
        try {
            const authData = sessionStorage.getItem('factoryAuth');
            if (!authData) return false;

            const auth = JSON.parse(authData);
            if (Date.now() > auth.expires) {
                sessionStorage.removeItem('factoryAuth');
                return false;
            }

            return auth.authenticated === true;
        } catch (error) {
            return false;
        }
    }

    // 靜態方法：強制跳轉到登入頁面
    static redirectToLogin() {
        if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
    }
}

// 初始化認證系統
new AuthSystem();

// 全域導出供其他模組使用
window.AuthSystem = AuthSystem;