// 設置頁面邏輯
import { FactoryTOTP } from './totp.js';

class SetupManager {
    constructor() {
        this.totp = new FactoryTOTP();
        this.secret = null;
        this.isVerified = false;

        this.init();
    }

    init() {
        // 生成或載入密鑰
        this.secret = this.totp.getFactorySecret();

        // 生成 QR Code
        this.generateQRCode();

        // 顯示密鑰
        this.displaySecret();

        // 綁定事件
        this.bindEvents();

        // 定期更新剩餘時間
        this.startCountdown();
    }

    generateQRCode() {
        const qrUrl = this.totp.generateQRCodeURL(this.secret);
        const qrImg = document.getElementById('qrCode');

        qrImg.src = qrUrl;
        qrImg.onerror = () => {
            console.warn('QR Code 服務暫時無法使用，請手動輸入密鑰');
            qrImg.style.display = 'none';

            // 顯示備用信息
            const container = qrImg.parentElement;
            container.innerHTML = `
                <div style="padding: 20px; background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 8px; color: #ffc107;">
                    <strong>⚠️ QR Code 無法載入</strong><br>
                    請手動在 Authenticator App 中新增帳號，並輸入下方密鑰
                </div>
            `;
        };
    }

    displaySecret() {
        const secretEl = document.getElementById('secretKey');
        // 格式化密鑰顯示（每4位加空格）
        const formattedSecret = this.secret.match(/.{1,4}/g).join(' ');
        secretEl.textContent = formattedSecret;
    }

    bindEvents() {
        // 測試按鈕
        document.getElementById('testBtn').addEventListener('click', () => {
            this.testCode();
        });

        // 完成設置按鈕
        document.getElementById('completeBtn').addEventListener('click', () => {
            this.completeSetup();
        });

        // 重新生成密鑰
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSecret();
        });

        // 輸入框自動格式化
        const codeInput = document.getElementById('testCode');
        codeInput.addEventListener('input', (e) => {
            this.formatCodeInput(e.target);
        });

        // Enter 鍵提交
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.testCode();
            }
        });
    }

    formatCodeInput(input) {
        // 移除所有非數字字符
        let value = input.value.replace(/\D/g, '');

        // 限制6位數
        if (value.length > 6) {
            value = value.substring(0, 6);
        }

        // 格式化為 "000 000"
        if (value.length > 3) {
            value = value.substring(0, 3) + ' ' + value.substring(3);
        }

        input.value = value;
    }

    async testCode() {
        const codeInput = document.getElementById('testCode');
        const testBtn = document.getElementById('testBtn');
        const messageEl = document.getElementById('message');

        const code = codeInput.value.replace(/\s/g, ''); // 移除空格

        if (code.length !== 6) {
            this.showMessage('請輸入6位數驗證碼', 'error');
            return;
        }

        // 顯示載入狀態
        testBtn.disabled = true;
        testBtn.textContent = '驗證中...';

        try {
            const isValid = await this.totp.verifyTOTP(this.secret, code);

            if (isValid) {
                this.isVerified = true;
                this.showMessage('✅ 驗證成功！您的 Authenticator App 已正確設置', 'success');

                // 啟用完成按鈕
                document.getElementById('completeBtn').disabled = false;

                // 清空輸入框
                codeInput.value = '';
            } else {
                this.showMessage('❌ 驗證碼錯誤，請檢查 App 中的代碼並重試', 'error');
            }
        } catch (error) {
            console.error('驗證錯誤:', error);
            this.showMessage('驗證過程發生錯誤，請重試', 'error');
        }

        // 恢復按鈕狀態
        testBtn.disabled = false;
        testBtn.textContent = '測試驗證碼';
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `${type}-message`;
        messageEl.style.display = 'block';

        // 3秒後隱藏錯誤訊息，成功訊息保持顯示
        if (type === 'error') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        }
    }

    completeSetup() {
        if (!this.isVerified) {
            this.showMessage('請先測試驗證碼確保設置正確', 'error');
            return;
        }

        // 標記為已設置
        this.totp.markAsSetup();

        // 顯示成功訊息
        this.showMessage('🎉 設置完成！正在跳轉到登入頁面...', 'success');

        // 2秒後跳轉
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }

    resetSecret() {
        if (confirm('確定要重新生成密鑰嗎？這將使現有的 Authenticator 設置失效。')) {
            // 重置密鑰
            this.secret = this.totp.resetSecret();

            // 重新生成 QR Code
            this.generateQRCode();

            // 更新顯示
            this.displaySecret();

            // 重置驗證狀態
            this.isVerified = false;
            document.getElementById('completeBtn').disabled = true;
            document.getElementById('testCode').value = '';

            const messageEl = document.getElementById('message');
            messageEl.style.display = 'none';

            this.showMessage('密鑰已重新生成，請重新設置 Authenticator App', 'success');
        }
    }

    startCountdown() {
        const updateCountdown = () => {
            const remaining = this.totp.getRemainingTime();
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;

            // 可以在這裡顯示倒數計時，但為了簡潔先省略
            // console.log(`下次更新: ${seconds}秒`);
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // 獲取當前有效的測試代碼（僅用於開發調試）
    async getCurrentCode() {
        return await this.totp.generateTOTP(this.secret);
    }
}

// 初始化
const setupManager = new SetupManager();

// 開發模式：在控制台顯示當前有效代碼
if (window.location.hostname === 'localhost') {
    setInterval(async () => {
        const currentCode = await setupManager.getCurrentCode();
        console.log(`🔐 當前有效驗證碼: ${setupManager.totp.formatCode(currentCode)} (剩餘 ${setupManager.totp.getRemainingTime()}秒)`);
    }, 1000);
}

// 全域導出供調試使用
window.setupManager = setupManager;