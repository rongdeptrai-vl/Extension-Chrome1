// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Advanced Analytics & Reports System
// Professional analytics dashboard with interactive charts and comprehensive reporting

class TINIAnalyticsReports {
    constructor() {
        this.initializeAnalytics();
        this.initializeReports();
        this.setupEventListeners();
        this.loadChartLibrary();
    }

    initializeAnalytics() {
        this.analyticsData = {
            pageViews: {
                current: 45291,
                previous: 39264,
                trend: 'up',
                percentage: 15.3
            },
            blockedAds: {
                current: 2847,
                previous: 2303,
                trend: 'up', 
                percentage: 23.7
            },
            performanceScore: {
                current: 96.8,
                previous: 94.2,
                trend: 'up',
                percentage: 2.8
            },
            userSessions: {
                current: 1234,
                previous: 1089,
                trend: 'up',
                percentage: 13.3
            },
            loadTime: {
                current: 1.2,
                previous: 1.8,
                trend: 'down',
                percentage: 33.3
            },
            errorRate: {
                current: 0.02,
                previous: 0.05,
                trend: 'down',
                percentage: 60.0
            }
        };

        this.timeRanges = ['24h', '7d', '30d', '90d'];
        this.currentTimeRange = '24h';
    }

    initializeReports() {
        this.reportTypes = [
            {
                id: 'user_activity',
                icon: 'fas fa-users',
                color: 'var(--accent)',
                dataPoints: 156789
            },
            {
                id: 'security',
                icon: 'fas fa-shield-alt', 
                color: 'var(--success)',
                dataPoints: 23456
            },
            {
                id: 'performance',
                icon: 'fas fa-chart-bar',
                color: 'var(--warning)',
                dataPoints: 98765
            },
            {
                id: 'system_logs',
                icon: 'fas fa-file-alt',
                color: 'var(--danger)',
                dataPoints: 45678
            },
            {
                id: 'api_usage',
                icon: 'fas fa-exchange-alt',
                color: 'var(--accent-dark)',
                dataPoints: 234567
            },
            {
                id: 'error_tracking',
                icon: 'fas fa-bug',
                color: '#ff6b35',
                dataPoints: 1234
            }
        ];

        this.recentReports = [
            {
                name: 'daily_security_report',
                type: 'security',
                generated: '2 hours ago',
                size: '2.3 MB',
                status: 'ready',
                downloadUrl: '#'
            },
            {
                name: 'weekly_user_activity',
                type: 'user_activity', 
                generated: '1 day ago',
                size: '5.7 MB',
                status: 'ready',
                downloadUrl: '#'
            },
            {
                name: 'monthly_performance',
                type: 'performance',
                generated: '3 days ago', 
                size: '12.1 MB',
                status: 'processing',
                downloadUrl: null
            },
            {
                name: 'api_usage_weekly',
                type: 'api_usage',
                generated: '5 days ago',
                size: '8.9 MB', 
                status: 'ready',
                downloadUrl: '#'
            },
            {
                name: 'error_logs_daily',
                type: 'error_tracking',
                generated: '6 hours ago',
                size: '456 KB',
                status: 'ready', 
                downloadUrl: '#'
            }
        ];
    }

    setupEventListeners() {
        // Analytics time range selector
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-range-btn')) {
                this.changeTimeRange(e.target.dataset.range);
            }

            // Report generation buttons
            if (e.target.classList.contains('generate-report-btn')) {
                this.generateReport(e.target.dataset.reportType);
            }

            // Export analytics data
            if (e.target.classList.contains('export-analytics-btn')) {
                this.exportAnalyticsData();
            }

            // Download report buttons
            if (e.target.classList.contains('download-report-btn')) {
                this.downloadReport(e.target.dataset.reportId);
            }

            // Refresh analytics
            if (e.target.classList.contains('refresh-analytics-btn')) {
                this.refreshAnalytics();
            }
        });
    }

    loadChartLibrary() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.initializeCharts();
            document.head.appendChild(script);
        } else {
            this.initializeCharts();
        }
    }

    initializeCharts() {
        this.createPageViewsChart();
        this.createPerformanceChart();
        this.createUserActivityChart();
        this.createErrorRateChart();
    }

    createPageViewsChart() {
        const ctx = document.getElementById('pageViewsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'Page Views',
                    data: [1200, 800, 1500, 2800, 3200, 2900, 1800],
                    borderColor: 'var(--accent)',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text)'
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border)'
                        }
                    }
                }
            }
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Excellent', 'Good', 'Fair', 'Poor'],
                datasets: [{
                    data: [85, 10, 3, 2],
                    backgroundColor: [
                        'var(--success)',
                        'var(--warning)', 
                        '#ff9800',
                        'var(--danger)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text)'
                        }
                    }
                }
            }
        });
    }

    createUserActivityChart() {
        const ctx = document.getElementById('userActivityChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [450, 520, 480, 600, 580, 320, 280],
                    backgroundColor: 'var(--accent)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text)'
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border)'
                        }
                    }
                }
            }
        });
    }

    createErrorRateChart() {
        const ctx = document.getElementById('errorRateChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Error Rate %',
                    data: [0.08, 0.05, 0.03, 0.02],
                    borderColor: 'var(--danger)',
                    backgroundColor: 'rgba(255, 61, 113, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text)'
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border)'
                        }
                    }
                }
            }
        });
    }

    changeTimeRange(range) {
        this.currentTimeRange = range;
        
        // Update UI
        document.querySelectorAll('.time-range-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-range="${range}"]`).classList.add('active');

        // Refresh charts with new data
        this.refreshAnalytics();
        this.showNotification('Time range updated to ' + range, 'success');
    }

    generateReport(reportType) {
        this.showNotification(`Generating ${reportType} report...`, 'info');
        
        // Simulate report generation
        setTimeout(() => {
            const reportData = this.reportTypes.find(r => r.id === reportType);
            const reportName = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            this.showNotification(`Report "${reportName}" generated successfully!`, 'success');
            
            // Add to recent reports list
            this.recentReports.unshift({
                name: reportName,
                type: reportType,
                generated: 'Just now',
                size: '1.2 MB',
                status: 'ready',
                downloadUrl: '#'
            });
            
            this.updateReportsTable();
        }, 2000);
    }

    exportAnalyticsData() {
        const data = {
            timestamp: new Date().toISOString(),
            timeRange: this.currentTimeRange,
            analytics: this.analyticsData
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${this.currentTimeRange}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Analytics data exported successfully!', 'success');
    }

    downloadReport(reportId) {
        const report = this.recentReports.find(r => r.name === reportId);
        if (!report || report.status !== 'ready') {
            this.showNotification('Report not ready for download', 'warning');
            return;
        }

        // Simulate download
        this.showNotification(`Downloading ${report.name}...`, 'info');
        setTimeout(() => {
            this.showNotification('Download completed!', 'success');
        }, 1000);
    }

    refreshAnalytics() {
        this.showNotification('Refreshing analytics data...', 'info');
        
        // Simulate data refresh
        setTimeout(() => {
            // Update analytics cards with new data
            this.updateAnalyticsCards();
            this.showNotification('Analytics refreshed successfully!', 'success');
        }, 1500);
    }

    updateAnalyticsCards() {
        // Simulate slight variations in data
        Object.keys(this.analyticsData).forEach(key => {
            const data = this.analyticsData[key];
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            data.current = Math.round(data.current * (1 + variation));
        });

        // Update UI elements
        this.renderAnalyticsCards();
    }

    renderAnalyticsCards() {
        const analyticsContainer = document.querySelector('#analytics .dashboard-grid');
        if (!analyticsContainer) return;

        const cardData = [
            { key: 'pageViews', icon: 'fas fa-eye', i18nKey: 'page_views' },
            { key: 'blockedAds', icon: 'fas fa-shield-alt', i18nKey: 'blocked_ads' },
            { key: 'performanceScore', icon: 'fas fa-tachometer-alt', i18nKey: 'performance_score' },
            { key: 'userSessions', icon: 'fas fa-users', i18nKey: 'user_sessions' },
            { key: 'loadTime', icon: 'fas fa-clock', i18nKey: 'avg_load_time' },
            { key: 'errorRate', icon: 'fas fa-exclamation-triangle', i18nKey: 'error_rate' }
        ];

        analyticsContainer.innerHTML = cardData.map((card, index) => {
            const data = this.analyticsData[card.key];
            const isPercentage = card.key === 'performanceScore' || card.key === 'errorRate';
            const isTime = card.key === 'loadTime';
            const trendIcon = data.trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down';
            const trendClass = data.trend === 'up' ? 'positive' : 'negative';
            
            let displayValue = data.current.toLocaleString();
            if (isPercentage) displayValue += '%';
            if (isTime) displayValue += 's';

            return `
                <div class="dashboard-card animated-card" style="animation-delay: ${index * 0.1}s">
                    <div class="card-icon">
                        <i class="${card.icon}"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-title" data-i18n="${card.i18nKey}">${card.i18nKey.replace(/_/g, ' ')}</div>
                        <div class="card-value">${displayValue}</div>
                        <div class="card-change ${trendClass}">
                            <i class="fas ${trendIcon}"></i>
                            <span>${data.percentage}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateReportsTable() {
        const tableBody = document.querySelector('#reports tbody');
        if (!tableBody) return;

        tableBody.innerHTML = this.recentReports.slice(0, 5).map(report => {
            const statusClass = report.status === 'ready' ? 'status-active' : 
                               report.status === 'processing' ? 'status-pending' : 'status-inactive';
            
            const downloadBtn = report.status === 'ready' ? 
                `<button class="download-report-btn" data-report-id="${report.name}" 
                         style="background: none; border: 1px solid var(--accent); color: var(--accent); 
                                padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-download"></i>
                </button>` :
                `<button disabled style="background: none; border: 1px solid var(--text-secondary); 
                                       color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; 
                                       cursor: not-allowed;">
                    <i class="fas fa-clock"></i>
                </button>`;

            return `
                <tr>
                    <td data-i18n="${report.name}">${report.name}</td>
                    <td data-i18n="${report.type}">${report.type}</td>
                    <td>${report.generated}</td>
                    <td>${report.size}</td>
                    <td><span class="status-badge ${statusClass}" data-i18n="${report.status}">${report.status}</span></td>
                    <td>${downloadBtn}</td>
                </tr>
            `;
        }).join('');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            border: 1px solid var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'error' ? 'danger' : 'accent'});
            color: var(--text);
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    init() {
        // Initialize analytics cards
        this.renderAnalyticsCards();
        this.updateReportsTable();
        
        console.log('✅ TINI Analytics & Reports System initialized');
    }
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .animated-card {
        animation: fadeInUp 0.6s ease forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .time-range-btn {
        background: var(--bg-darker);
        border: 1px solid var(--border);
        color: var(--text-secondary);
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .time-range-btn:hover,
    .time-range-btn.active {
        background: var(--accent);
        color: var(--bg-dark);
        border-color: var(--accent);
    }
    
    .chart-container {
        height: 300px;
        background: var(--bg-darker);
        border-radius: 8px;
        padding: 20px;
        border: 1px solid var(--border);
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.analyticsReports = new TINIAnalyticsReports();
        window.analyticsReports.init();
    });
} else {
    window.analyticsReports = new TINIAnalyticsReports();
    window.analyticsReports.init();
}
