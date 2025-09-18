// TOTP (Time-based One-Time Password) 實現
// 支援 Google Authenticator, Microsoft Authenticator 等

class TOTP {
    constructor() {
        this.digits = 6;
        this.window = 30; // 30秒更新週期
        this.issuer = '鈺祥企業';
        this.accountName = '柳營再生戰情中心';
    }

    // 生成隨機 Secret Key (Base32 編碼)
    generateSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        const array = new Uint8Array(20); // 160 bits
        crypto.getRandomValues(array);

        for (let i = 0; i < array.length; i++) {
            secret += chars[array[i] % chars.length];
        }
        return secret;
    }

    // Base32 解碼
    base32Decode(encoded) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = 0;
        let value = 0;
        let output = [];

        for (let i = 0; i < encoded.length; i++) {
            const char = encoded.charAt(i).toUpperCase();
            const index = alphabet.indexOf(char);

            if (index === -1) continue;

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                output.push((value >>> (bits - 8)) & 255);
                bits -= 8;
            }
        }

        return new Uint8Array(output);
    }

    // 生成當前時間步長
    getTimeStep(timestamp = null) {
        const now = timestamp || Math.floor(Date.now() / 1000);
        return Math.floor(now / this.window);
    }

    // HMAC-SHA1 實現
    async hmacSha1(key, message) {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
        return new Uint8Array(signature);
    }

    // 將時間步長轉為8字節大端序
    timeStepToBytes(timeStep) {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setUint32(4, timeStep, false); // 大端序
        return new Uint8Array(buffer);
    }

    // 生成 TOTP 代碼
    async generateTOTP(secret, timestamp = null) {
        try {
            const timeStep = this.getTimeStep(timestamp);
            const secretBytes = this.base32Decode(secret);
            const timeBytes = this.timeStepToBytes(timeStep);

            // HMAC-SHA1
            const hmac = await this.hmacSha1(secretBytes, timeBytes);

            // 動態截取
            const offset = hmac[hmac.length - 1] & 0x0f;
            const code = (
                ((hmac[offset] & 0x7f) << 24) |
                ((hmac[offset + 1] & 0xff) << 16) |
                ((hmac[offset + 2] & 0xff) << 8) |
                (hmac[offset + 3] & 0xff)
            ) % Math.pow(10, this.digits);

            return code.toString().padStart(this.digits, '0');
        } catch (error) {
            console.error('TOTP generation error:', error);
            return null;
        }
    }

    // 驗證 TOTP 代碼（允許前後1個時間窗口的誤差）
    async verifyTOTP(secret, token, timestamp = null) {
        const currentTime = timestamp || Math.floor(Date.now() / 1000);

        // 檢查當前時間窗口和前後各一個窗口
        for (let i = -1; i <= 1; i++) {
            const testTime = currentTime + (i * this.window);
            const expectedToken = await this.generateTOTP(secret, testTime);

            if (expectedToken === token) {
                return true;
            }
        }

        return false;
    }

    // 生成 Google Authenticator URL
    generateURL(secret, accountName = null, issuer = null) {
        const account = accountName || this.accountName;
        const iss = issuer || this.issuer;

        const params = new URLSearchParams({
            secret: secret,
            issuer: iss,
            algorithm: 'SHA1',
            digits: this.digits,
            period: this.window
        });

        return `otpauth://totp/${encodeURIComponent(iss)}:${encodeURIComponent(account)}?${params}`;
    }

    // 生成 QR Code 數據 (返回 URL 供 QR 庫使用)
    generateQRCodeURL(secret, accountName = null, issuer = null) {
        const totpUrl = this.generateURL(secret, accountName, issuer);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUrl)}`;
    }

    // 獲取剩餘時間（距離下次更新）
    getRemainingTime(timestamp = null) {
        const now = timestamp || Math.floor(Date.now() / 1000);
        return this.window - (now % this.window);
    }

    // 格式化顯示代碼（3-3分組）
    formatCode(code) {
        return code.substring(0, 3) + ' ' + code.substring(3);
    }
}

// 工廠預設配置
class FactoryTOTP extends TOTP {
    constructor() {
        super();
        this.issuer = '鈺祥企業';
        this.accountName = '柳營再生戰情中心';

        // 預設 Secret (生產環境應該動態生成)
        this.defaultSecret = 'JBSWY3DPEHPK3PXP'; // 示例密鑰
    }

    // 獲取或生成工廠密鑰
    getFactorySecret() {
        let secret = localStorage.getItem('factory_totp_secret');

        if (!secret) {
            secret = this.generateSecret();
            localStorage.setItem('factory_totp_secret', secret);
            console.log('🔑 新的 TOTP Secret 已生成:', secret);
        }

        return secret;
    }

    // 重置密鑰（管理員功能）
    resetSecret() {
        localStorage.removeItem('factory_totp_secret');
        return this.getFactorySecret();
    }

    // 獲取設置狀態
    isSetup() {
        return localStorage.getItem('factory_totp_setup') === 'true';
    }

    // 標記為已設置
    markAsSetup() {
        localStorage.setItem('factory_totp_setup', 'true');
    }

    // 重置設置狀態
    resetSetup() {
        localStorage.removeItem('factory_totp_setup');
        localStorage.removeItem('factory_totp_secret');
    }
}

// 導出
export default TOTP;
export { FactoryTOTP };