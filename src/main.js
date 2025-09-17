import Chart from 'chart.js/auto';
import './style.css';

// 將 HTML 內容插入到 app div
document.querySelector('#app').innerHTML = `
    <div class="header">
        <h1>鈺祥企業柳營再生戰情中心 - WISE-IOT Dashboard</h1>
        <div class="time" id="currentTime"></div>
    </div>

    <div class="dashboard">
        <!-- 機台OEE -->
        <div class="widget">
            <div class="widget-title">機台OEE (FPY/RTY)</div>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <div class="metric-label">First Pass Yield</div>
                    <div class="metric-value">94.2%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 94.2%"></div>
                    </div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">Roll Throughput Yield</div>
                    <div class="metric-value">89.7%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 89.7%"></div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <div class="metric-label">整體設備效率 (OEE)</div>
                <div class="metric-value">85.4% <span class="trend-indicator trend-up">↗</span></div>
            </div>
        </div>

        <!-- 產出 vs 計畫 -->
        <div class="widget">
            <div class="widget-title">產出 vs 計畫</div>
            <div class="chart-container">
                <canvas id="productionChart"></canvas>
            </div>
            <div style="margin-top: 10px;">
                <div class="metric-label">WIP數量</div>
                <div class="metric-value">2,847 <span class="status-good">件</span></div>
                <div class="metric-label">目標達成率: 102.3%</div>
            </div>
        </div>

        <!-- Top 瓶頸排行榜 -->
        <div class="widget">
            <div class="widget-title">Top 瓶頸排行榜</div>
            <table class="data-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>工站</th>
                        <th>利用率</th>
                        <th>等候時間</th>
                        <th>滯留%</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>SMT-01</td>
                        <td class="status-alert">98.7%</td>
                        <td>45min</td>
                        <td>23.1%</td>
                        <td>87</td>
                    </tr>
                    <tr>
                        <td>AOI-03</td>
                        <td class="status-warning">95.2%</td>
                        <td>32min</td>
                        <td>18.5%</td>
                        <td>79</td>
                    </tr>
                    <tr>
                        <td>TEST-02</td>
                        <td class="status-warning">91.8%</td>
                        <td>28min</td>
                        <td>15.2%</td>
                        <td>72</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 品質 Pareto -->
        <div class="widget">
            <div class="widget-title">品質 Pareto</div>
            <div class="chart-container">
                <canvas id="paretoChart"></canvas>
            </div>
            <div style="margin-top: 10px;">
                <div class="metric-label">重工率</div>
                <div class="metric-value status-warning">3.2%</div>
                <div class="metric-label">較上週 +0.5%</div>
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

        <!-- SPC 烘箱關鍵製程 -->
        <div class="widget">
            <div class="widget-title">SPC 烘箱關鍵製程</div>
            <div class="chart-container">
                <canvas id="spcChart"></canvas>
            </div>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <div class="metric-label">Mitap</div>
                    <div class="metric-value status-good">1.67</div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">壓損</div>
                    <div class="metric-value status-warning">85 Pa</div>
                </div>
            </div>
        </div>

        <!-- AOI 缺陷密度 -->
        <div class="widget">
            <div class="widget-title">AOI 缺陷密度</div>
            <div class="chart-container">
                <canvas id="aoiChart"></canvas>
            </div>
            <div class="kpi-grid">
                <div class="kpi-item">
                    <div class="metric-label">FP (近7日)</div>
                    <div class="metric-value status-good">97.8%</div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">FN (近7日)</div>
                    <div class="metric-value status-good">1.2%</div>
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

        <!-- 告警牆 -->
        <div class="widget">
            <div class="widget-title">告警牆</div>
            <div class="alert-item">
                <strong>14:23</strong> SMT-01 溫度異常
            </div>
            <div class="alert-item">
                <strong>13:45</strong> AOI-03 檢測異常
            </div>
            <div class="alert-item">
                <strong>12:18</strong> 烘箱-02 壓力警告
            </div>
            <div class="kpi-grid" style="margin-top: 10px;">
                <div class="kpi-item">
                    <div class="metric-label">MTTA</div>
                    <div class="metric-value">4.2min</div>
                </div>
                <div class="kpi-item">
                    <div class="metric-label">MTTR</div>
                    <div class="metric-value">15.7min</div>
                </div>
            </div>
        </div>

        <!-- 烘箱細節 -->
        <div class="widget">
            <div class="widget-title">烘箱細節</div>
            <table class="data-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>烘箱</th>
                        <th>溫度</th>
                        <th>壓力</th>
                        <th>狀態</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Oven-01</td>
                        <td>185°C</td>
                        <td>92 Pa</td>
                        <td class="status-good">正常</td>
                    </tr>
                    <tr>
                        <td>Oven-02</td>
                        <td>182°C</td>
                        <td>95 Pa</td>
                        <td class="status-warning">警告</td>
                    </tr>
                    <tr>
                        <td>Oven-03</td>
                        <td>187°C</td>
                        <td>89 Pa</td>
                        <td class="status-good">正常</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div style="position: fixed; bottom: 10px; right: 10px; font-size: 12px; opacity: 0.7; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 5px;">
        作者：選我正解
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

// 圖表配置
Chart.defaults.color = 'white';
Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.1)';

// 產出 vs 計畫圖表
const productionCtx = document.getElementById('productionChart').getContext('2d');
new Chart(productionCtx, {
    type: 'bar',
    data: {
        labels: ['週一', '週二', '週三', '週四', '週五'],
        datasets: [{
            label: '實際產出',
            data: [850, 920, 880, 950, 890],
            backgroundColor: 'rgba(0, 212, 255, 0.7)',
        }, {
            label: '計畫產出',
            data: [900, 900, 900, 900, 900],
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

// 品質 Pareto 圖表
const paretoCtx = document.getElementById('paretoChart').getContext('2d');
new Chart(paretoCtx, {
    type: 'bar',
    data: {
        labels: ['焊接', '元件', '清潔', '測試', '其他'],
        datasets: [{
            data: [45, 28, 15, 8, 4],
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

// AOI 趨勢圖表
const aoiCtx = document.getElementById('aoiChart').getContext('2d');
new Chart(aoiCtx, {
    type: 'line',
    data: {
        labels: ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7'],
        datasets: [{
            label: '缺陷密度',
            data: [0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.6],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
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