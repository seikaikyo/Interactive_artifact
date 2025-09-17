// AI 組件 - UI 界面元件
// ver2.0 - AI 智慧面板組件

class AIComponents {
    constructor() {
        this.aiEngine = null;
    }

    // 初始化 AI 組件
    initialize(aiEngine) {
        this.aiEngine = aiEngine;
        this.createAIWidgets();
        this.setupEventListeners();
    }

    // 創建 AI 小工具
    createAIWidgets() {
        // AI 洞察面板
        const aiInsightsWidget = this.createAIInsightsWidget();

        // AI 建議面板
        const aiRecommendationsWidget = this.createAIRecommendationsWidget();

        // AI 健康監控面板
        const aiHealthWidget = this.createAIHealthWidget();

        // 預測性維護面板
        const predictiveMaintenanceWidget = this.createPredictiveMaintenanceWidget();

        // 將 AI 面板插入到儀表板
        const dashboard = document.querySelector('.dashboard');
        dashboard.appendChild(aiInsightsWidget);
        dashboard.appendChild(aiRecommendationsWidget);
        dashboard.appendChild(aiHealthWidget);
        dashboard.appendChild(predictiveMaintenanceWidget);
    }

    // AI 洞察面板
    createAIInsightsWidget() {
        const widget = document.createElement('div');
        widget.className = 'widget ai-widget';
        widget.innerHTML = `
            <div class="widget-title">
                🤖 AI 智慧洞察
                <span class="ai-status online">即時分析中</span>
                <div class="ai-model-info">
                    <span class="model-name">GPT-4o</span>
                    <span class="tech-stack">JavaScript + TensorFlow.js</span>
                </div>
            </div>
            <div id="ai-insights-content">
                <div class="ai-insight-item loading">
                    <div class="insight-icon">🔍</div>
                    <div class="insight-content">
                        <div class="insight-title">正在分析製程數據...</div>
                        <div class="insight-description">AI 引擎正在進行深度學習分析</div>
                    </div>
                </div>
            </div>
            <div class="ai-summary">
                <div class="summary-item">
                    <span class="summary-label">信心度</span>
                    <span class="summary-value" id="ai-confidence">--</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">分析次數</span>
                    <span class="summary-value" id="analysis-count">0</span>
                </div>
            </div>
        `;
        return widget;
    }

    // AI 建議面板
    createAIRecommendationsWidget() {
        const widget = document.createElement('div');
        widget.className = 'widget ai-widget';
        widget.innerHTML = `
            <div class="widget-title">
                💡 AI 最佳化建議
                <span class="recommendation-count" id="rec-count">0</span>
                <div class="ai-model-info">
                    <span class="model-name">Claude-3.5-Sonnet</span>
                    <span class="tech-stack">Python + scikit-learn</span>
                </div>
            </div>
            <div id="ai-recommendations-content">
                <div class="recommendation-placeholder">
                    等待 AI 分析結果...
                </div>
            </div>
            <div class="ai-actions">
                <button class="ai-btn" onclick="aiComponents.refreshRecommendations()">
                    刷新建議
                </button>
                <button class="ai-btn secondary" onclick="aiComponents.exportReport()">
                    匯出報告
                </button>
            </div>
        `;
        return widget;
    }

    // AI 健康監控面板
    createAIHealthWidget() {
        const widget = document.createElement('div');
        widget.className = 'widget ai-widget';
        widget.innerHTML = `
            <div class="widget-title">
                📊 AI 系統健康度
                <div class="ai-model-info">
                    <span class="model-name">LSTM-AutoEncoder</span>
                    <span class="tech-stack">PyTorch + ONNX.js</span>
                </div>
            </div>
            <div class="health-metrics">
                <div class="health-item">
                    <div class="health-label">整體健康度</div>
                    <div class="health-bar">
                        <div class="health-fill" id="system-health" style="width: 0%"></div>
                    </div>
                    <div class="health-value" id="health-percentage">0%</div>
                </div>
                <div class="health-item">
                    <div class="health-label">AI 效率分數</div>
                    <div class="health-bar">
                        <div class="health-fill efficiency" id="ai-efficiency" style="width: 0%"></div>
                    </div>
                    <div class="health-value" id="efficiency-percentage">0%</div>
                </div>
            </div>
            <div class="health-indicators">
                <div class="indicator" id="pred-maintenance">
                    <span class="indicator-dot"></span>
                    預測維護
                </div>
                <div class="indicator" id="quality-analysis">
                    <span class="indicator-dot"></span>
                    品質分析
                </div>
                <div class="indicator" id="anomaly-detection">
                    <span class="indicator-dot"></span>
                    異常檢測
                </div>
            </div>
        `;
        return widget;
    }

    // 預測性維護面板
    createPredictiveMaintenanceWidget() {
        const widget = document.createElement('div');
        widget.className = 'widget ai-widget';
        widget.innerHTML = `
            <div class="widget-title">
                🔧 預測性維護
                <div class="ai-model-info">
                    <span class="model-name">XGBoost + Random Forest</span>
                    <span class="tech-stack">Python + Node.js</span>
                </div>
            </div>
            <div id="maintenance-predictions">
                <div class="prediction-item">
                    <div class="equipment-name">系統掃描中...</div>
                    <div class="prediction-status">正在分析設備狀態</div>
                </div>
            </div>
            <div class="maintenance-summary">
                <div class="summary-metric">
                    <span class="metric-label">預警設備</span>
                    <span class="metric-value" id="alert-equipment">0</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-label">平均可靠度</span>
                    <span class="metric-value" id="avg-reliability">--</span>
                </div>
            </div>
        `;
        return widget;
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽 AI 引擎更新
        window.addEventListener('aiUpdate', (event) => {
            const { component, data } = event.detail;
            this.updateComponent(component, data);
        });

        // 定期更新 AI 摘要
        setInterval(() => {
            if (this.aiEngine) {
                this.updateAISummary();
            }
        }, 5000);
    }

    // 更新組件
    updateComponent(component, data) {
        switch (component) {
            case 'insights':
                this.updateInsights(data);
                break;
            case 'recommendations':
                this.updateRecommendations(data);
                break;
            case 'alerts':
                this.updateMaintenanceAlerts(data);
                break;
        }
    }

    // 更新洞察
    updateInsights(insights) {
        const container = document.getElementById('ai-insights-content');
        if (!container || !insights.length) return;

        const latestInsight = insights[0];
        container.innerHTML = `
            <div class="ai-insight-item">
                <div class="insight-icon">${this.getInsightIcon(latestInsight.type)}</div>
                <div class="insight-content">
                    <div class="insight-title">${latestInsight.title}</div>
                    <div class="insight-description">${latestInsight.analysis}</div>
                    <div class="insight-recommendation">
                        <strong>建議：</strong>${latestInsight.recommendation}
                    </div>
                    <div class="insight-confidence">
                        信心度: ${Math.round(latestInsight.confidence * 100)}%
                    </div>
                </div>
            </div>
        `;

        // 更新信心度
        const confidenceEl = document.getElementById('ai-confidence');
        if (confidenceEl) {
            confidenceEl.textContent = `${Math.round(latestInsight.confidence * 100)}%`;
        }
    }

    // 更新建議
    updateRecommendations(recommendations) {
        const container = document.getElementById('ai-recommendations-content');
        const countEl = document.getElementById('rec-count');

        if (!container) return;

        if (recommendations.length === 0) {
            container.innerHTML = '<div class="recommendation-placeholder">暫無最佳化建議</div>';
            if (countEl) countEl.textContent = '0';
            return;
        }

        let html = '';
        recommendations.forEach((rec, index) => {
            html += `
                <div class="recommendation-item priority-${rec.priority}">
                    <div class="rec-header">
                        <span class="rec-title">${rec.title}</span>
                        <span class="rec-priority ${rec.priority}">${this.getPriorityText(rec.priority)}</span>
                    </div>
                    <div class="rec-description">${rec.description}</div>
                    <div class="rec-impact">預期效益: ${rec.impact}</div>
                    <div class="rec-action">
                        <strong>執行動作:</strong> ${rec.action}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        if (countEl) countEl.textContent = recommendations.length;
    }

    // 更新維護告警
    updateMaintenanceAlerts(alerts) {
        const container = document.getElementById('maintenance-predictions');
        if (!container) return;

        const maintenanceAlerts = alerts.filter(alert => alert.type === 'maintenance');

        if (maintenanceAlerts.length === 0) {
            container.innerHTML = `
                <div class="prediction-item">
                    <div class="equipment-name">所有設備正常</div>
                    <div class="prediction-status good">無預測故障風險</div>
                </div>
            `;
            return;
        }

        let html = '';
        maintenanceAlerts.forEach(alert => {
            html += `
                <div class="prediction-item risk-${this.getRiskClass(alert.probability)}">
                    <div class="equipment-name">${alert.equipment}</div>
                    <div class="prediction-status">${alert.message}</div>
                    <div class="probability">故障機率: ${Math.round(alert.probability * 100)}%</div>
                    <div class="recommendation">${alert.recommendation}</div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 更新統計
        const alertCountEl = document.getElementById('alert-equipment');
        if (alertCountEl) alertCountEl.textContent = maintenanceAlerts.length;
    }

    // 更新 AI 摘要
    updateAISummary() {
        if (!this.aiEngine) return;

        const summary = this.aiEngine.getAISummary();

        // 更新健康度
        const healthBar = document.getElementById('system-health');
        const healthPercentage = document.getElementById('health-percentage');
        if (healthBar && healthPercentage) {
            healthBar.style.width = `${summary.systemHealth}%`;
            healthPercentage.textContent = `${summary.systemHealth}%`;
            healthBar.className = `health-fill ${this.getHealthClass(summary.systemHealth)}`;
        }

        // 更新效率
        const efficiencyBar = document.getElementById('ai-efficiency');
        const efficiencyPercentage = document.getElementById('efficiency-percentage');
        if (efficiencyBar && efficiencyPercentage) {
            efficiencyBar.style.width = `${summary.efficiency}%`;
            efficiencyPercentage.textContent = `${Math.round(summary.efficiency)}%`;
        }

        // 更新分析次數
        const analysisCount = document.getElementById('analysis-count');
        if (analysisCount) {
            const currentCount = parseInt(analysisCount.textContent) || 0;
            analysisCount.textContent = currentCount + 1;
        }

        // 更新指示器狀態
        this.updateIndicators();
    }

    // 更新狀態指示器
    updateIndicators() {
        const indicators = ['pred-maintenance', 'quality-analysis', 'anomaly-detection'];
        indicators.forEach(id => {
            const indicator = document.getElementById(id);
            if (indicator) {
                indicator.className = `indicator ${Math.random() > 0.3 ? 'active' : 'inactive'}`;
            }
        });
    }

    // 輔助方法
    getInsightIcon(type) {
        const icons = {
            quality: '🎯',
            maintenance: '🔧',
            efficiency: '⚡',
            anomaly: '⚠️'
        };
        return icons[type] || '📊';
    }

    getPriorityText(priority) {
        const text = {
            high: '高優先',
            medium: '中優先',
            low: '低優先'
        };
        return text[priority] || priority;
    }

    getRiskClass(probability) {
        if (probability > 0.8) return 'high';
        if (probability > 0.6) return 'medium';
        return 'low';
    }

    getHealthClass(health) {
        if (health > 80) return 'good';
        if (health > 60) return 'warning';
        return 'critical';
    }

    // 公共方法
    refreshRecommendations() {
        if (this.aiEngine) {
            this.aiEngine.updateRecommendations();
        }
    }

    exportReport() {
        // 模擬報告匯出
        const report = {
            timestamp: new Date().toLocaleString('zh-TW'),
            insights: this.aiEngine?.insights || [],
            recommendations: this.aiEngine?.recommendations || [],
            alerts: this.aiEngine?.alerts || []
        };

        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `AI分析報告_${new Date().getTime()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }
}

// 導出 AI 組件
export default AIComponents;