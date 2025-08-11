// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * Enhanced Reports Management System
 * Professional report generation and management interface
 */

class ReportsManager {
    constructor() {
        this.reports = [];
        this.currentFilter = 'all';
        this.currentSort = { field: 'created', direction: 'desc' };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadReports();
        this.startAutoRefresh();
        this.initFormValidation();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('reportGenerateForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Filter controls
        document.querySelectorAll('[data-filter]').forEach(filter => {
            filter.addEventListener('change', (e) => this.handleFilterChange(e));
        });

        // Sort controls
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', (e) => this.handleSort(e));
        });

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="refresh-reports"]')) {
                this.refreshReports();
            }
            if (e.target.matches('[data-action="open-report-modal"]')) {
                this.scrollToForm();
            }
        });

        // Format selection
        document.querySelectorAll('input[name="format"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.updateFormatPreview(e));
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const reportConfig = Object.fromEntries(formData);
        
        // Add checkboxes that might not be in FormData
        reportConfig.includeCharts = e.target.includeCharts?.checked || false;
        reportConfig.notify = e.target.notify?.checked || false;
        reportConfig.encrypt = e.target.encrypt?.checked || false;

        this.generateReport(reportConfig);
    }

    async generateReport(config) {
        const submitBtn = document.querySelector('#reportGenerateForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateReportGeneration(config);
            
            // Show success message
            this.showNotification('报告生成成功！', 'success');
            
            // Reset form
            document.getElementById('reportGenerateForm').reset();
            document.querySelector('input[name="format"][value="pdf"]').checked = true;
            
            // Refresh reports list
            this.loadReports();
            
        } catch (error) {
            this.showNotification('报告生成失败: ' + error.message, 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateReportGeneration(config) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random failure (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('服务器暂时不可用');
        }

        // Add new report to list
        const newReport = {
            id: 'RPT-' + Date.now(),
            name: this.getReportTypeName(config.type),
            type: config.type,
            format: config.format,
            created: new Date(),
            size: (Math.random() * 5 + 0.5).toFixed(1) + ' MB',
            status: 'ready'
        };

        this.reports.unshift(newReport);
    }

    getReportTypeName(type) {
        const typeNames = {
            'activity': '用户活动报告',
            'security': '安全分析报告', 
            'performance': '性能监控报告',
            'compliance': '合规审计报告'
        };
        return typeNames[type] || '系统报告';
    }

    loadReports() {
        // Simulate loading sample reports
        if (this.reports.length === 0) {
            this.reports = [
                {
                    id: 'RPT-001234',
                    name: '性能监控报告',
                    type: 'performance', 
                    format: 'pdf',
                    created: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    size: '2.4 MB',
                    status: 'ready'
                },
                {
                    id: 'RPT-001233',
                    name: '安全分析报告',
                    type: 'security',
                    format: 'csv', 
                    created: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                    size: '1.8 MB',
                    status: 'ready'
                },
                {
                    id: 'RPT-001232',
                    name: '用户活动报告',
                    type: 'activity',
                    format: 'excel',
                    created: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                    size: '3.1 MB', 
                    status: 'ready'
                },
                {
                    id: 'RPT-001231',
                    name: '性能监控报告',
                    type: 'performance',
                    format: 'pdf',
                    created: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                    size: '4.2 MB',
                    status: 'processing'
                },
                {
                    id: 'RPT-001230', 
                    name: '合规审计报告',
                    type: 'compliance',
                    format: 'excel',
                    created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                    size: '5.7 MB',
                    status: 'ready'
                }
            ];
        }

        this.renderReports();
        this.updateSummaryStats();
    }

    renderReports() {
        const tbody = document.querySelector('[data-dynamic="reportsTable"]');
        if (!tbody) return;

        // Only render if tbody is empty (don't override existing static content)
        if (tbody.children.length > 0) {
            console.log('Reports table already has content, skipping render');
            return;
        }

        const filteredReports = this.getFilteredReports();
        
        tbody.innerHTML = filteredReports.map(report => `
            <tr class="report-row" data-report-id="${report.id}">
                <td class="report-name">
                    <div class="name-container">
                        <i class="fas fa-file-${this.getFormatIcon(report.format)} ${this.getFormatColor(report.format)}"></i>
                        <span>${report.id}</span>
                    </div>
                </td>
                <td><span class="category-badge ${report.type}">${this.getCategoryBadge(report.type)}</span></td>
                <td>${this.formatRelativeTime(report.created)}</td>
                <td>${report.size}</td>
                <td><span class="status-badge ${report.status}">${this.getStatusText(report.status)}</span></td>
                <td class="actions-cell">
                    <button class="btn-icon" onclick="reportsManager.downloadReport('${report.id}')" title="${(window.emergencyTranslations && window.emergencyTranslations['download']) || '下载'}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="reportsManager.viewReport('${report.id}')" title="${(window.emergencyTranslations && window.emergencyTranslations['view']) || '查看'}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="reportsManager.shareReport('${report.id}')" title="${(window.emergencyTranslations && window.emergencyTranslations['share']) || '分享'}">
                        <i class="fas fa-share"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getFilteredReports() {
        let filtered = [...this.reports];
        
        // Apply status filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(report => report.status === this.currentFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];
            
            if (this.currentSort.field === 'created') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }
            
            if (this.currentSort.direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }

    updateSummaryStats() {
        // Update total reports
        const totalCard = document.querySelector('[data-summary="total"] .stat-value');
        if (totalCard) {
            this.animateCounter(totalCard, this.reports.length);
        }

        // Update success rate
        const successCard = document.querySelector('[data-summary="success-rate"] .stat-value');
        if (successCard) {
            const successRate = ((this.reports.filter(r => r.status === 'ready').length / this.reports.length) * 100).toFixed(1);
            successCard.textContent = successRate + '%';
        }

        // Update queue count
        const queueCard = document.querySelector('[data-summary="in-queue"] .stat-value');
        if (queueCard) {
            const inQueue = this.reports.filter(r => r.status === 'processing').length;
            this.animateCounter(queueCard, inQueue);
        }
    }

    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const duration = 500;
        const steps = Math.abs(targetValue - currentValue);
        const stepDuration = duration / steps;

        if (steps === 0) return;

        let current = currentValue;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === targetValue) {
                clearInterval(timer);
            }
        }, stepDuration);
    }

    getFormatIcon(format) {
        const icons = {
            'pdf': 'pdf',
            'excel': 'excel', 
            'csv': 'csv'
        };
        return icons[format] || 'file';
    }

    getFormatColor(format) {
        const colors = {
            'pdf': 'text-danger',
            'excel': 'text-success',
            'csv': 'text-info'
        };
        return colors[format] || 'text-muted';
    }

    getCategoryBadge(type) {
        const badges = {
            'performance': '性能报告',
            'security': '安全报告',
            'activity': '活动报告', 
            'compliance': '合规报告'
        };
        return badges[type] || '系统报告';
    }

    getStatusText(status) {
        if (window.emergencyTranslations) {
            const statusText = {
                'ready': window.emergencyTranslations['ready'] || '已完成',
                'processing': window.emergencyTranslations['processing'] || '处理中',
                'failed': window.emergencyTranslations['failed'] || '失败'
            };
            return statusText[status] || status;
        }
        
        const statusText = {
            'ready': '已完成',
            'processing': '处理中',
            'failed': '失败'
        };
        return statusText[status] || status;
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}天前`;
        } else if (hours > 0) {
            return `${hours}小时前`;
        } else {
            return '刚刚';
        }
    }

    handleFilterChange(e) {
        const filterType = e.target.getAttribute('data-filter');
        
        if (filterType === 'report-status') {
            this.currentFilter = e.target.value;
        }
        
        this.renderReports();
    }

    handleSort(e) {
        const field = e.target.getAttribute('data-sort');
        if (!field) return;

        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = { field, direction: 'desc' };
        }

        // Update sort indicators
        document.querySelectorAll('[data-sort] i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        const icon = e.target.querySelector('i');
        if (icon) {
            icon.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'}`;
        }

        this.renderReports();
    }

    scrollToForm() {
        const form = document.querySelector('.generate-panel');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateFormatPreview(e) {
        // Add visual feedback for format selection
        document.querySelectorAll('.format-option').forEach(option => {
            option.classList.remove('selected');
        });
        e.target.closest('.format-option').classList.add('selected');
    }

    initFormValidation() {
        const form = document.getElementById('reportGenerateForm');
        if (!form) return;

        const inputs = form.querySelectorAll('select[required]');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value) {
                    input.classList.add('valid');
                    input.classList.remove('invalid');
                } else {
                    input.classList.add('invalid');
                    input.classList.remove('valid');
                }
            });
        });
    }

    refreshReports() {
        const refreshBtn = document.querySelector('[data-action="refresh-reports"]');
        if (refreshBtn) {
            refreshBtn.classList.add('fa-spin');
            setTimeout(() => {
                refreshBtn.classList.remove('fa-spin');
                this.loadReports();
                this.showNotification('报告列表已刷新', 'info');
            }, 1000);
        }
    }

    downloadReport(reportId) {
        this.showNotification(`正在下载报告 ${reportId}...`, 'info');
        // Simulate download
        setTimeout(() => {
            this.showNotification(`报告 ${reportId} 下载完成`, 'success');
        }, 1500);
    }

    viewReport(reportId) {
        this.showNotification(`正在打开报告 ${reportId}...`, 'info');
    }

    shareReport(reportId) {
        this.showNotification(`报告 ${reportId} 分享链接已复制到剪贴板`, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    startAutoRefresh() {
        // Auto refresh every 30 seconds
        setInterval(() => {
            if (document.querySelector('#reports.content-section.active')) {
                this.updateSummaryStats();
            }
        }, 30000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});

// Export for global access
window.ReportsManager = ReportsManager;
