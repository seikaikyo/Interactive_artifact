import Chart from 'chart.js/auto';
import './style.css';
import AIEngine from './ai-engine.js';
import AIComponents from './ai-components.js';

// 檢查認證狀態
function checkAuthentication() {
    try {
        const authData = sessionStorage.getItem('factoryAuth');
        if (!authData) {
            window.location.href = '/login.html';
            return false;
        }

        const auth = JSON.parse(authData);
        if (Date.now() > auth.expires || !auth.authenticated) {
            sessionStorage.removeItem('factoryAuth');
            window.location.href = '/login.html';
            return false;
        }

        return true;
    } catch (error) {
        window.location.href = '/login.html';
        return false;
    }
}

// 執行認證檢查
if (!checkAuthentication()) {
    // 如果認證失敗，停止後續執行
    throw new Error('Authentication required');
}

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