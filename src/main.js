import Chart from 'chart.js/auto';
import './style.css';
import AIEngine from './ai-engine.js';
import AIComponents from './ai-components.js';

// 檢查認證狀態（僅檢查，不自動跳轉）
function checkAuthentication() {
    try {
        console.log('🔍 檢查認證狀態...');
        const authData = sessionStorage.getItem('factoryAuth');

        if (!authData) {
            console.log('❌ 無認證資料');
            return false;
        }

        const auth = JSON.parse(authData);
        console.log('📋 認證資料:', {
            authenticated: auth.authenticated,
            username: auth.username,
            expires: new Date(auth.expires).toLocaleString(),
            isExpired: Date.now() > auth.expires
        });

        if (Date.now() > auth.expires || !auth.authenticated) {
            console.log('❌ 認證已過期或無效');
            sessionStorage.removeItem('factoryAuth');
            return false;
        }

        console.log('✅ 認證有效');
        return true;
    } catch (error) {
        console.error('❌ 認證檢查錯誤:', error);
        return false;
    }
}

// 檢查 URL 參數決定顯示哪個頁面
const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('page');

if (page === 'login') {
    // 載入登入頁面內容
    loadLoginPage();
} else if (page === 'manage') {
    // 載入管理頁面內容
    loadManagePage();
} else if (page === 'reset') {
    // 載入重置頁面內容
    loadResetPage();
} else if (!checkAuthentication()) {
    // 顯示未認證提示，但不自動跳轉
    document.querySelector('#app').innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; font-family: 'Microsoft JhengHei', Arial, sans-serif;">
            <div style="text-align: center; background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(20px); max-width: 500px;">
                <h1>🔐 WISE-IOT Dashboard v3.1</h1>
                <p style="margin: 20px 0;">需要認證才能訪問系統</p>

                <div style="margin: 30px 0;">
                    <button onclick="window.location.href='?page=login'" style="display: block; width: 100%; margin: 10px 0; padding: 12px 24px; background: rgba(0, 212, 255, 0.3); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.5); border-radius: 8px; cursor: pointer;">
                        🔑 系統登入
                    </button>

                    <button onclick="window.location.href='?page=manage'" style="display: block; width: 100%; margin: 10px 0; padding: 12px 24px; background: rgba(40, 167, 69, 0.3); color: #28a745; border: 1px solid rgba(40, 167, 69, 0.5); border-radius: 8px; cursor: pointer;">
                        👥 帳號管理
                    </button>

                    <button onclick="window.location.href='?page=reset'" style="display: block; width: 100%; margin: 10px 0; padding: 12px 24px; background: rgba(220, 53, 69, 0.3); color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.5); border-radius: 8px; cursor: pointer;">
                        🔧 數據重置
                    </button>
                </div>

                <div style="font-size: 12px; opacity: 0.7; margin-top: 20px;">
                    首次使用請先使用「帳號管理」創建管理員帳號
                </div>
            </div>
        </div>
    `;
} else {
    console.log('✅ 用戶已認證，載入儀表板');

    // 將 HTML 內容插入到 app div
    document.querySelector('#app').innerHTML = `
    <div class="header">
        <h1>鈺祥企業柳營再生戰情中心 - WISE-IOT Dashboard</h1>
        <div class="header-right">
            <div class="time" id="currentTime"></div>
            <div class="user-info" id="userInfo" style="font-size: 14px; opacity: 0.8; margin-right: 15px;">載入中...</div>
            <a href="/manage.html" class="logout-btn" style="text-decoration: none; margin-right: 10px; background: rgba(0, 212, 255, 0.2); border-color: rgba(0, 212, 255, 0.4); color: #00d4ff;">管理中心</a>
            <button class="logout-btn" id="logoutBtn">登出</button>
        </div>
    </div>

    <div class="dashboard">
        <!-- 再生製程OEE -->
        <div class="widget">
            <div class="widget-title">再生製程效率 (FPY/RTY)</div>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <div class="metric-label">濾網再生良率</div>
                    <div class="metric-value">92.8%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 92.8%"></div>
                    </div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">製程通過率</div>
                    <div class="metric-value">87.3%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 87.3%"></div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <div class="metric-label">整體再生效率 (OEE)</div>
                <div class="metric-value">83.6% <span class="trend-indicator trend-up">↗</span></div>
            </div>
        </div>

        <!-- 再生產能 vs 計畫 -->
        <div class="widget">
            <div class="widget-title">再生產能 vs 計畫</div>
            <div class="chart-container">
                <canvas id="productionChart"></canvas>
            </div>
            <div style="margin-top: 10px;">
                <div class="metric-label">在製濾網數量</div>
                <div class="metric-value">1,432 <span class="status-good">片</span></div>
                <div class="metric-label">日產能達成率: 98.7%</div>
            </div>
        </div>

        <!-- 再生製程瓶頸分析 -->
        <div class="widget">
            <div class="widget-title">再生製程瓶頸分析</div>
            <table class="data-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>製程站</th>
                        <th>利用率</th>
                        <th>等候時間</th>
                        <th>滯留%</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>除膠站</td>
                        <td class="status-alert">96.4%</td>
                        <td>38min</td>
                        <td>21.7%</td>
                        <td>84</td>
                    </tr>
                    <tr>
                        <td>烘烤爐</td>
                        <td class="status-warning">93.8%</td>
                        <td>42min</td>
                        <td>19.2%</td>
                        <td>78</td>
                    </tr>
                    <tr>
                        <td>檢測站</td>
                        <td class="status-warning">89.5%</td>
                        <td>25min</td>
                        <td>14.8%</td>
                        <td>71</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 再生不良 Pareto -->
        <div class="widget">
            <div class="widget-title">再生不良原因分析</div>
            <div class="chart-container">
                <canvas id="paretoChart"></canvas>
            </div>
            <div style="margin-top: 10px;">
                <div class="metric-label">重製率</div>
                <div class="metric-value status-warning">2.8%</div>
                <div class="metric-label">較上週 -0.3%</div>
            </div>
        </div>

        <!-- 環境監控 -->
        <div class="widget">
            <div class="widget-title">環境監控</div>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <div class="metric-label">溫度</div>
                    <div class="metric-value status-good">23.5°C</div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">濕度</div>
                    <div class="metric-value status-good">45.2%</div>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <div class="metric-label">AMC濃度</div>
                <div class="metric-value status-warning">12.3 ppm</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 61.5%"></div>
                </div>
            </div>
        </div>

        <!-- SPC 烘烤爐關鍵製程 -->
        <div class="widget">
            <div class="widget-title">SPC 烘烤爐關鍵製程</div>
            <div class="chart-container">
                <canvas id="spcChart"></canvas>
            </div>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <div class="metric-label">Cpk值</div>
                    <div class="metric-value status-good">1.73</div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">烘烤溫度</div>
                    <div class="metric-value status-good">185°C</div>
                </div>
            </div>
        </div>

        <!-- 濾網檢測品質 -->
        <div class="widget">
            <div class="widget-title">濾網檢測品質趨勢</div>
            <div class="chart-container">
                <canvas id="aoiChart"></canvas>
            </div>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <div class="metric-label">檢測精度 (近7日)</div>
                    <div class="metric-value status-good">98.4%</div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">誤判率 (近7日)</div>
                    <div class="metric-value status-good">0.8%</div>
                </div>
            </div>
        </div>

        <!-- 能源管理 -->
        <div class="widget">
            <div class="widget-title">能源管理</div>
            <div class="metric-value">2.34 <span style="font-size: 16px;">kWh/良品</span></div>
            <div class="chart-container">
                <canvas id="energyChart"></canvas>
            </div>
            <div class="metric-label">尖峰用電: 1,247 kW</div>
            <div class="metric-label">離峰用電: 892 kW</div>
        </div>

        <!-- 再生製程告警 -->
        <div class="widget">
            <div class="widget-title">再生製程告警牆</div>
            <div class="alert-item">
                <strong>14:23</strong> 除膠站-02 溶劑濃度異常
            </div>
            <div class="alert-item">
                <strong>13:45</strong> 烘烤爐-01 溫度偏差
            </div>
            <div class="alert-item">
                <strong>12:18</strong> 檢測站-03 光源強度不足
            </div>
            <div class="kpi-grid" style="margin-top: 10px;">
                <div class="kpi-item">
                    <div class="metric-label">MTTA</div>
                    <div class="metric-value">3.8min</div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">MTTR</div>
                    <div class="metric-value">12.4min</div>
                </div>
            </div>
        </div>

        <!-- 烘烤爐設備狀態 -->
        <div class="widget">
            <div class="widget-title">烘烤爐設備狀態</div>
            <table class="data-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>烘烤爐</th>
                        <th>溫度</th>
                        <th>時間</th>
                        <th>狀態</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>爐體-01</td>
                        <td>185°C</td>
                        <td>42min</td>
                        <td class="status-good">運行中</td>
                    </tr>
                    <tr>
                        <td>爐體-02</td>
                        <td>180°C</td>
                        <td>38min</td>
                        <td class="status-warning">預熱中</td>
                    </tr>
                    <tr>
                        <td>爐體-03</td>
                        <td>188°C</td>
                        <td>45min</td>
                        <td class="status-good">運行中</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div style="position: fixed; bottom: 10px; right: 10px; font-size: 11px; opacity: 0.8; background: rgba(0,0,0,0.7); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.3);">
        <div style="color: #00d4ff; font-weight: 600; margin-bottom: 2px;">鈺祥企業柳營再生戰情中心 v2.0</div>
        <div style="color: rgba(255,255,255,0.9); font-size: 9px;">作者：選我正解</div>
        <div style="color: rgba(255,255,255,0.6); font-size: 8px; margin-top: 2px;">
            Tech Stack: Vite + Chart.js + AI Engine (JS + Python)
        </div>
    </div>
`;

// 時鐘更新
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = now.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}
setInterval(updateTime, 1000);
updateTime();

// 顯示當前用戶信息
function updateUserInfo() {
    try {
        const authData = sessionStorage.getItem('factoryAuth');
        if (authData) {
            const auth = JSON.parse(authData);
            if (auth.username) {
                document.getElementById('userInfo').textContent = `👤 ${auth.username}`;
            }
        }
    } catch (error) {
        console.error('獲取用戶信息失敗:', error);
    }
}
updateUserInfo();

// 圖表配置
Chart.defaults.color = 'white';
Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.1)';

// 再生產能 vs 計畫圖表
const productionCtx = document.getElementById('productionChart').getContext('2d');
new Chart(productionCtx, {
    type: 'bar',
    data: {
        labels: ['週一', '週二', '週三', '週四', '週五'],
        datasets: [{
            label: '實際再生量',
            data: [430, 468, 445, 482, 456],
            backgroundColor: 'rgba(0, 212, 255, 0.7)',
        }, {
            label: '計畫再生量',
            data: [450, 450, 450, 450, 450],
            type: 'line',
            borderColor: '#FF6B6B',
            backgroundColor: 'transparent',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    }
});

// 再生不良 Pareto 圖表
const paretoCtx = document.getElementById('paretoChart').getContext('2d');
new Chart(paretoCtx, {
    type: 'bar',
    data: {
        labels: ['除膠不完全', '烘烤不均', '污染殘留', '破損裂紋', '其他'],
        datasets: [{
            data: [38, 25, 18, 12, 7],
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    }
});

// SPC 圖表
const spcCtx = document.getElementById('spcChart').getContext('2d');
new Chart(spcCtx, {
    type: 'line',
    data: {
        labels: Array.from({length: 24}, (_, i) => i + ':00'),
        datasets: [{
            label: 'SPC',
            data: Array.from({length: 24}, () => Math.random() * 2 + 1),
            borderColor: '#00D4FF',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { display: false }, min: 0, max: 3 },
            x: { grid: { display: false } }
        }
    }
});

// 濾網檢測品質圖表
const aoiCtx = document.getElementById('aoiChart').getContext('2d');
new Chart(aoiCtx, {
    type: 'line',
    data: {
        labels: ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'],
        datasets: [{
            label: '檢測精度',
            data: [98.2, 98.8, 97.9, 98.6, 98.4, 99.1, 98.7],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { display: false }, beginAtZero: true },
            x: { grid: { display: false } }
        }
    }
});

// 能源圖表
const energyCtx = document.getElementById('energyChart').getContext('2d');
new Chart(energyCtx, {
    type: 'doughnut',
    data: {
        labels: ['尖峰', '離峰'],
        datasets: [{
            data: [58, 42],
            backgroundColor: ['#FF6B6B', '#4ECDC4']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    }
});

// 數據更新模擬
setInterval(() => {
    const oeeValue = document.querySelector('.metric-value');
    if (oeeValue) {
        const currentValue = parseFloat(oeeValue.textContent);
        const newValue = Math.max(80, Math.min(95, currentValue + (Math.random() - 0.5) * 2));
        oeeValue.textContent = newValue.toFixed(1) + '%';
    }
}, 5000);

// 🤖 AI 引擎初始化 - ver2.0 智慧化升級
console.log('🚀 啟動 WISE-IOT Dashboard ver2.0 - AI 智慧化');

// 初始化 AI 引擎
const aiEngine = new AIEngine();
const aiComponents = new AIComponents();

// 等待 DOM 完全載入後初始化 AI 功能
setTimeout(() => {
    console.log('🤖 正在初始化 AI 引擎...');

    // 初始化 AI 組件
    aiComponents.initialize(aiEngine);

    // 啟動 AI 引擎
    aiEngine.initialize();

    // 將 AI 組件暴露到全局，供按鈕點擊使用
    window.aiComponents = aiComponents;
    window.aiEngine = aiEngine;

    console.log('✅ AI 引擎已成功啟動');
    console.log('📊 可用功能：預測性維護、品質智慧分析、異常檢測、製程最佳化');

}, 2000); // 等待2秒確保所有圖表載入完成

    // 登出功能
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('確定要登出系統嗎？')) {
            sessionStorage.removeItem('factoryAuth');
            window.location.href = '/login.html';
        }
    });

} // 結束認證通過的區塊

// 頁面載入函數
function loadLoginPage() {
    document.querySelector('#app').innerHTML = `
        <div style="font-family: 'Microsoft JhengHei', Arial, sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 40px; backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); width: 100%; max-width: 400px; text-align: center;">
                <div style="margin-bottom: 30px;">
                    <h1 style="font-size: 24px; font-weight: 600; color: #e8f4ff; margin-bottom: 8px;">🔐 系統登入</h1>
                    <p style="font-size: 14px; opacity: 0.8; color: #00d4ff;">輸入授權帳號密碼</p>
                </div>

                <form id="loginForm">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">授權帳號</label>
                        <input type="text" id="username" placeholder="請輸入授權帳號" required
                               style="width: 100%; padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 16px;">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">系統密碼</label>
                        <input type="password" id="password" placeholder="請輸入系統密碼" required
                               style="width: 100%; padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 16px;">
                    </div>

                    <button type="submit" id="loginBtn"
                            style="width: 100%; padding: 12px; background: rgba(76, 175, 80, 0.3); border: 1px solid rgba(76, 175, 80, 0.5); color: #4CAF50; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                        🔐 驗證登入
                    </button>

                    <div id="errorMessage" style="display: none; margin-top: 15px; padding: 10px; background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.3); color: #dc3545; border-radius: 8px;"></div>
                </form>

                <div style="margin-top: 20px;">
                    <button onclick="window.location.href='/'" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">← 返回首頁</button>
                </div>
            </div>
        </div>
    `;

    // 載入認證邏輯
    import('./auth.js');
}

function loadManagePage() {
    // 檢查是否已登入（管理頁面需要認證）
    const authData = sessionStorage.getItem('factoryAuth');
    let isAuthenticated = false;

    if (authData) {
        try {
            const auth = JSON.parse(authData);
            isAuthenticated = Date.now() < auth.expires && auth.authenticated;
        } catch (e) {
            isAuthenticated = false;
        }
    }

    if (!isAuthenticated) {
        // 未登入，顯示需要登入的訊息
        document.querySelector('#app').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; font-family: 'Microsoft JhengHei', Arial, sans-serif;">
                <div style="text-align: center; background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(20px);">
                    <h1>🔐 需要登入</h1>
                    <p style="margin: 20px 0;">請先登入系統才能訪問管理介面</p>
                    <button onclick="window.location.href='/?page=login'" style="padding: 12px 24px; background: rgba(0, 212, 255, 0.3); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.5); border-radius: 8px; cursor: pointer; margin: 10px;">前往登入</button>
                    <button onclick="window.location.href='/'" style="padding: 12px 24px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 8px; cursor: pointer; margin: 10px;">返回首頁</button>
                </div>
            </div>
        `;
        return;
    }

    // 已登入，載入管理介面
    document.querySelector('#app').innerHTML = `
        <div style="min-height: 100vh; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; font-family: 'Microsoft JhengHei', Arial, sans-serif; padding: 20px;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h1 style="font-size: 28px; font-weight: 600;">👥 帳號管理中心</h1>
                    <div>
                        <button onclick="window.location.href='/'" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 10px;">← 返回首頁</button>
                        <button onclick="logoutUser()" style="background: rgba(220, 53, 69, 0.3); border: 1px solid rgba(220, 53, 69, 0.5); color: #dc3545; padding: 8px 16px; border-radius: 6px; cursor: pointer;">登出</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
                        <h3 style="margin: 0 0 10px 0; color: #4CAF50;">📊 系統統計</h3>
                        <div id="statsContent">載入中...</div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
                        <h3 style="margin: 0 0 10px 0; color: #00d4ff;">🔐 當前帳號狀態</h3>
                        <div id="currentAccountStatus">載入中...</div>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px); margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0;">⚙️ 管理操作</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="createNewAccount()" style="background: rgba(40, 167, 69, 0.3); border: 1px solid rgba(40, 167, 69, 0.5); color: #28a745; padding: 10px 20px; border-radius: 6px; cursor: pointer;">🆕 創建新帳號</button>
                        <button onclick="bindTOTP()" style="background: rgba(255, 193, 7, 0.3); border: 1px solid rgba(255, 193, 7, 0.5); color: #ffc107; padding: 10px 20px; border-radius: 6px; cursor: pointer;">🔗 綁定 Authenticator</button>
                        <button onclick="exportData()" style="background: rgba(0, 212, 255, 0.3); border: 1px solid rgba(0, 212, 255, 0.5); color: #00d4ff; padding: 10px 20px; border-radius: 6px; cursor: pointer;">📤 匯出數據</button>
                        <button onclick="clearAllData()" style="background: rgba(220, 53, 69, 0.3); border: 1px solid rgba(220, 53, 69, 0.5); color: #dc3545; padding: 10px 20px; border-radius: 6px; cursor: pointer;">🗑️ 清除所有數據</button>
                    </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
                    <h3 style="margin: 0 0 15px 0;">👥 帳號列表</h3>
                    <div id="accountsList">載入中...</div>
                </div>
            </div>
        </div>
    `;

    // 載入管理功能
    loadManageFunctions();
}

function loadResetPage() {
    document.querySelector('#app').innerHTML = `
        <div id="reset-loading" style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; font-family: 'Microsoft JhengHei', Arial, sans-serif;">
            <div style="text-align: center;">
                <h1>🔧 載入重置工具...</h1>
                <button onclick="window.location.href='/'" style="margin-top: 20px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">← 返回首頁</button>
            </div>
        </div>
    `;

    // 這裡可以載入重置邏輯或重定向到 reset.html
    setTimeout(() => {
        window.location.href = '/reset.html';
    }, 1000);
}

// 管理功能函數
function loadManageFunctions() {
    import('./accounts.js').then((module) => {
        const AccountManager = module.default;
        const accountManager = new AccountManager();
        accountManager.initialize();

        // 更新統計信息
        function updateStats() {
            const stats = accountManager.getStatistics();
            document.getElementById('statsContent').innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 14px;">
                    <div>總帳號數: <strong>${stats.totalAccounts}</strong></div>
                    <div>活躍帳號: <strong>${stats.activeAccounts}</strong></div>
                    <div>已綁定: <strong>${stats.boundAccounts}</strong></div>
                    <div>綁定率: <strong>${stats.bindingRate}%</strong></div>
                </div>
            `;
        }

        // 更新當前帳號狀態
        function updateCurrentStatus() {
            const authData = sessionStorage.getItem('factoryAuth');
            if (authData) {
                const auth = JSON.parse(authData);
                const isBound = accountManager.isAccountBound(auth.username);

                document.getElementById('currentAccountStatus').innerHTML = `
                    <div style="font-size: 14px;">
                        <div>帳號: <strong>${auth.username}</strong></div>
                        <div>登入時間: ${new Date(auth.loginTime).toLocaleString()}</div>
                        <div>TOTP 狀態: ${isBound ? '<span style="color: #4CAF50;">已綁定</span>' : '<span style="color: #ffc107;">未綁定</span>'}</div>
                    </div>
                `;
            }
        }

        // 更新帳號列表
        function updateAccountsList() {
            const accounts = accountManager.getAccountList();
            if (accounts.length === 0) {
                document.getElementById('accountsList').innerHTML = '<p style="text-align: center; opacity: 0.7;">暫無帳號</p>';
                return;
            }

            const accountsHTML = accounts.map(account => `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div><strong>${account.username}</strong> - ${account.description}</div>
                            <div style="font-size: 12px; opacity: 0.7;">
                                創建: ${new Date(account.createdAt).toLocaleString()} |
                                登入次數: ${account.loginCount} |
                                狀態: ${account.isActive ? '活躍' : '停用'} |
                                TOTP: ${account.isBound ? '已綁定' : '未綁定'}
                            </div>
                        </div>
                        <div>
                            ${account.isActive ?
                                `<button onclick="deactivateAccount('${account.username}')" style="background: rgba(220, 53, 69, 0.3); border: 1px solid rgba(220, 53, 69, 0.5); color: #dc3545; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">停用</button>` :
                                `<button onclick="reactivateAccount('${account.username}')" style="background: rgba(40, 167, 69, 0.3); border: 1px solid rgba(40, 167, 69, 0.5); color: #28a745; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">啟用</button>`
                            }
                        </div>
                    </div>
                </div>
            `).join('');

            document.getElementById('accountsList').innerHTML = accountsHTML;
        }

        // 全域函數
        window.createNewAccount = () => {
            const description = prompt('請輸入新帳號的描述（可選）：') || '手動創建';
            const account = accountManager.createAccount(description);
            alert(`新帳號創建成功！\\n帳號: ${account.username}\\n密碼: ${accountManager.FIXED_PASSWORD}\\n\\n請妥善保管帳號資訊。`);
            updateStats();
            updateAccountsList();
        };

        window.bindTOTP = () => {
            alert('TOTP 綁定功能將在下一版本中提供完整的 Authenticator App 整合。');
        };

        window.exportData = () => {
            accountManager.exportData();
        };

        window.clearAllData = () => {
            if (confirm('確定要清除所有數據嗎？此操作無法復原！')) {
                const success = accountManager.clearAllData();
                if (success) {
                    alert('所有數據已清除，頁面將重新載入');
                    window.location.href = '/';
                }
            }
        };

        window.logoutUser = () => {
            if (confirm('確定要登出嗎？')) {
                sessionStorage.removeItem('factoryAuth');
                window.location.href = '/';
            }
        };

        window.deactivateAccount = (username) => {
            const authData = sessionStorage.getItem('factoryAuth');
            const currentUser = authData ? JSON.parse(authData).username : '';

            if (username === currentUser) {
                alert('無法停用當前登入的帳號');
                return;
            }

            if (confirm(`確定要停用帳號 ${username} 嗎？`)) {
                const success = accountManager.deactivateAccount(username);
                if (success) {
                    alert(`帳號 ${username} 已停用`);
                    updateStats();
                    updateAccountsList();
                }
            }
        };

        window.reactivateAccount = (username) => {
            const account = accountManager.accounts.find(acc => acc.username === username);
            if (account) {
                account.isActive = true;
                accountManager.saveAccounts();
                alert(`帳號 ${username} 已重新啟用`);
                updateStats();
                updateAccountsList();
            }
        };

        // 初始載入數據
        updateStats();
        updateCurrentStatus();
        updateAccountsList();

        // 定期更新
        setInterval(() => {
            updateStats();
            updateCurrentStatus();
            updateAccountsList();
        }, 30000);
    });
}