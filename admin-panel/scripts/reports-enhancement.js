// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * Reports Enhancement JavaScript
 * Professional & Modern Interactions
 */

class ReportsManager {
    constructor() {
        this.reports = this.generateSampleReports();
        // Pagination state
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = Math.max(1, Math.ceil(this.reports.length / this.pageSize));
        this.init();
    }

    init() {
        this.bindEvents();
        this.populateTable();
        this.startRealTimeUpdates();
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('reportGenerateForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Search functionality
        const searchInput = document.querySelector('[data-filter="report-search"]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Table sorting
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', (e) => this.handleSort(e.target.dataset.sort));
        });

        // Filter dropdowns
        document.querySelectorAll('[data-filter]').forEach(filter => {
            if (filter.tagName === 'SELECT') {
                filter.addEventListener('change', (e) => this.handleFilter());
            }
        });

        // Helper to animate collapse/expand (removes vertical space)
        const prepareCollapsible = (el) => {
            if (!el) return;
            el.classList.add('collapsible');
            el.style.transition = 'height 200ms ease, opacity 200ms ease, margin 200ms ease, padding 200ms ease';
        };
        const collapse = (el) => {
            if (!el) return;
            prepareCollapsible(el);
            const h = el.scrollHeight;
            el.style.height = h + 'px';
            void el.offsetHeight; // force reflow
            el.style.height = '0px';
            el.style.opacity = '0';
            el.style.marginTop = '0';
            el.style.paddingTop = '0';
            el.dataset.collapsed = 'true';
        };
        const expand = (el) => {
            if (!el) return;
            prepareCollapsible(el);
            const target = el;
            const finalHeight = target.scrollHeight;
            target.style.height = finalHeight + 'px';
            target.style.opacity = '1';
            target.style.marginTop = '';
            target.style.paddingTop = '';
            const onEnd = (e) => {
                if (e.propertyName === 'height') {
                    target.style.height = '';
                    target.removeEventListener('transitionend', onEnd);
                }
            };
            target.addEventListener('transitionend', onEnd);
            target.dataset.collapsed = 'false';
        };
        const toggle = (el) => {
            if (!el) return;
            if (el.dataset.collapsed === 'true' || el.style.height === '0px') {
                expand(el);
            } else {
                collapse(el);
            }
        };

        // Collapse/expand actions for Recent Reports header
        const recentTitle = document.querySelector('#reports .panel-title[data-i18n="recent_reports_list"]');
        const recentActions = recentTitle?.parentElement?.querySelector('.panel-actions');
        if (recentTitle && recentActions) {
            prepareCollapsible(recentActions);
            // Hide by default and remove vertical space
            recentActions.style.opacity = '0';
            recentActions.style.height = '0px';
            recentActions.style.marginTop = '0';
            recentActions.style.paddingTop = '0';
            recentActions.dataset.collapsed = 'true';

            recentTitle.style.cursor = 'pointer';
            recentTitle.setAttribute('role', 'button');
            recentTitle.setAttribute('aria-expanded', 'false');

            recentTitle.addEventListener('click', () => {
                toggle(recentActions);
                const expanded = recentActions.dataset.collapsed !== 'true';
                recentTitle.setAttribute('aria-expanded', String(expanded));
            });
        }

        // Toggle main section-toolbar by clicking the main header title (reports_analytics)
        const mainHeaderTitle = document.querySelector('#reports .header .header-title[data-i18n="reports_analytics"]');
        const sectionToolbar = mainHeaderTitle?.parentElement?.querySelector('.section-toolbar');
        if (mainHeaderTitle && sectionToolbar) {
            const headerEl = mainHeaderTitle.closest('.header');
            prepareCollapsible(sectionToolbar);
            // collapsed by default
            sectionToolbar.style.opacity = '0';
            sectionToolbar.style.height = '0px';
            sectionToolbar.style.marginTop = '0';
            sectionToolbar.style.paddingTop = '0';
            sectionToolbar.dataset.collapsed = 'true';
            if (headerEl) headerEl.classList.add('compact');

            mainHeaderTitle.style.cursor = 'pointer';
            mainHeaderTitle.setAttribute('role', 'button');
            mainHeaderTitle.setAttribute('aria-expanded', 'false');
            mainHeaderTitle.addEventListener('click', () => {
                toggle(sectionToolbar);
                const expanded = sectionToolbar.dataset.collapsed !== 'true';
                mainHeaderTitle.setAttribute('aria-expanded', String(expanded));
                if (headerEl) headerEl.classList.toggle('compact', !expanded);
            });
        }

        // Action buttons
        this.bindActionButtons();

        // Handle "Create Report" triggers anywhere (including empty state button)
        document.addEventListener('click', (e) => {
            const openBtn = e.target.closest('[data-action="open-report-modal"]');
            if (!openBtn) return;
            e.preventDefault();
            const formEl = document.getElementById('reportGenerateForm');
            if (formEl) {
                formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                formEl.classList.add('pulse-focus');
                setTimeout(() => formEl.classList.remove('pulse-focus'), 1200);
                const typeSelect = formEl.querySelector('select[name="type"], #reportType');
                typeSelect?.focus();
            }
        });

        // Pagination controls
        const pagination = document.querySelector('#reports .table-pagination');
        if (pagination && !pagination.dataset.bound) {
            pagination.dataset.bound = '1';
            const btns = pagination.querySelectorAll('.pagination-btn');
            const prevBtn = btns[0];
            const nextBtn = btns[1];
            prevBtn?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
            nextBtn?.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
    }

    bindActionButtons() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-icon');
            if (!target) return;

            const action = target.title || target.getAttribute('data-action');
            const row = target.closest('.report-row');
            const reportId = row?.dataset.reportId;

            switch (action) {
                case '下载':
                    this.downloadReport(reportId);
                    break;
                case '查看':
                    this.viewReport(reportId);
                    break;
                case '分享':
                    this.shareReport(reportId);
                    break;
                case '取消':
                    this.cancelReport(reportId);
                    break;
            }
        });
    }

    generateSampleReports() {
        const statuses = ['ready', 'processing', 'failed'];
        const categories = ['performance', 'security', 'activity', 'compliance'];
        const formats = ['pdf', 'csv', 'excel'];
        const reports = [];

        for (let i = 1; i <= 20; i++) {
            const id = `RPT-${String(i).padStart(6, '0')}`;
            const category = categories[Math.floor(Math.random() * categories.length)];
            const status = i <= 15 ? 'ready' : statuses[Math.floor(Math.random() * statuses.length)];
            const format = formats[Math.floor(Math.random() * formats.length)];
            
            reports.push({
                id,
                name: id,
                category,
                created: this.getRelativeTime(i),
                size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
                status,
                format,
                timestamp: Date.now() - (i * 3600000) // i hours ago
            });
        }

        return reports;
    }

    getRelativeTime(hoursAgo) {
        if (hoursAgo < 1) return '刚刚';
        if (hoursAgo < 24) return `${hoursAgo}小时前`;
        const days = Math.floor(hoursAgo / 24);
        return `${days}天前`;
    }

    // Return only the reports for the current page
    getPagedReports() {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.reports.slice(start, start + this.pageSize);
    }

    populateTable() {
        const tbody = document.querySelector('[data-dynamic="reportsTable"]');
        if (!tbody) return;

        const html = this.getPagedReports().map(report => this.createReportRow(report)).join('');
        tbody.innerHTML = html;

        // Add data attributes for filtering
        tbody.querySelectorAll('.report-row').forEach((row, index) => {
            const globalIndex = (this.currentPage - 1) * this.pageSize + index;
            row.dataset.reportId = this.reports[globalIndex].id;
        });

        // Update pagination controls/info
        this.renderPagination();
    }

    createReportRow(report) {
        const categoryMap = {
            performance: '性能报告',
            security: '安全报告',
            activity: '活动报告',
            compliance: '合规报告'
        };

        const statusMap = {
            ready: '已完成',
            processing: '处理中',
            failed: '失败'
        };

        const iconMap = {
            pdf: 'fas fa-file-pdf text-danger',
            csv: 'fas fa-file-csv text-success',
            excel: 'fas fa-file-excel text-success'
        };

        const actionButtons = report.status === 'processing' 
            ? `<button class="btn-icon" disabled><i class="fas fa-hourglass-half"></i></button>
               <button class="btn-icon" title="取消"><i class="fas fa-times"></i></button>`
            : `<button class="btn-icon" title="下载"><i class="fas fa-download"></i></button>
               <button class="btn-icon" title="查看"><i class="fas fa-eye"></i></button>
               <button class="btn-icon" title="分享"><i class="fas fa-share"></i></button>`;

        return `
            <tr class="report-row" data-status="${report.status}" data-category="${report.category}">
                <td class="report-name">
                    <div class="name-container">
                        <i class="${iconMap[report.format]}"></i>
                        <span>${report.name}</span>
                    </div>
                </td>
                <td><span class="category-badge ${report.category}">${categoryMap[report.category]}</span></td>
                <td>${report.created}</td>
                <td>${report.size}</td>
                <td><span class="status-badge ${report.status}">${statusMap[report.status]}</span></td>
                <td class="actions-cell">
                    ${actionButtons}
                </td>
            </tr>
        `;
    }

    // Pagination helpers
    renderPagination() {
        const info = document.querySelector('#reports .table-pagination .pagination-info');
        this.totalPages = Math.max(1, Math.ceil(this.reports.length / this.pageSize));
        if (info) info.textContent = `第 ${this.currentPage} 页，共 ${this.totalPages} 页`;
        this.updatePaginationButtons();
    }

    updatePaginationButtons() {
        const btns = document.querySelectorAll('#reports .table-pagination .pagination-btn');
        const prevBtn = btns[0];
        const nextBtn = btns[1];
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
    }

    goToPage(page) {
        const target = Math.min(Math.max(1, page), this.totalPages);
        if (target === this.currentPage) return;
        this.currentPage = target;
        this.populateTable();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('span');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        btnText.style.display = 'none';
        btnLoading.style.display = 'block';
        submitBtn.disabled = true;

        // Simulate report generation
        setTimeout(() => {
            this.generateReport(data);
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
            form.reset();
            this.showNotification('报告生成成功！', 'success');
        }, 2000 + Math.random() * 3000);
    }

    generateReport(data) {
        const newReport = {
            id: `RPT-${String(this.reports.length + 1).padStart(6, '0')}`,
            name: `RPT-${String(this.reports.length + 1).padStart(6, '0')}`,
            category: data.type,
            created: '刚刚',
            size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
            status: 'ready',
            format: data.format || 'pdf',
            timestamp: Date.now()
        };

        this.reports.unshift(newReport);
        // Reset to first page to see the newest report
        this.currentPage = 1;
        this.populateTable();
        this.updateSummaryCards();
    }

    handleSearch(query) {
        const rows = document.querySelectorAll('.report-row');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }

    handleSort(column) {
        // Add sorting logic here
        console.log(`Sorting by ${column}`);
        // For now, just show visual feedback
        this.showNotification(`按 ${column} 排序`, 'info');
    }

    handleFilter() {
        const rangeFilter = document.querySelector('[data-filter="report-range"]')?.value;
        const statusFilter = document.querySelector('[data-filter="report-status"]')?.value;

        document.querySelectorAll('.report-row').forEach(row => {
            let show = true;

            if (statusFilter && statusFilter !== 'all') {
                show = show && row.dataset.status === statusFilter;
            }

            row.style.display = show ? '' : 'none';
        });
    }

    downloadReport(reportId) {
        this.showNotification(`正在下载报告 ${reportId}...`, 'info');
        // Simulate download
        setTimeout(() => {
            this.showNotification(`报告 ${reportId} 下载完成`, 'success');
        }, 1000);
    }

    viewReport(reportId) {
        this.showNotification(`正在打开报告 ${reportId}...`, 'info');
    }

    shareReport(reportId) {
        this.showNotification(`正在生成报告 ${reportId} 的分享链接...`, 'info');
    }

    cancelReport(reportId) {
        this.showNotification(`已取消报告 ${reportId}`, 'warning');
        // Update status in UI
        const row = document.querySelector(`[data-report-id="${reportId}"]`);
        if (row) {
            const statusBadge = row.querySelector('.status-badge');
            statusBadge.textContent = '已取消';
            statusBadge.className = 'status-badge failed';
        }
    }

    updateSummaryCards() {
        // Update total reports
        const totalCard = document.querySelector('[data-summary="total"] .stat-value');
        if (totalCard) {
            totalCard.textContent = this.reports.length;
        }

        // Update success rate
        const readyReports = this.reports.filter(r => r.status === 'ready').length;
        const successRate = ((readyReports / this.reports.length) * 100).toFixed(1);
        const successCard = document.querySelector('[data-summary="success-rate"] .stat-value');
        if (successCard) {
            successCard.textContent = `${successRate}%`;
        }

        // Update queue count
        const queueCount = this.reports.filter(r => r.status === 'processing').length;
        const queueCard = document.querySelector('[data-summary="in-queue"] .stat-value');
        if (queueCard) {
            queueCard.textContent = queueCount;
        }
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            // Randomly update processing reports to completed
            const processingReports = this.reports.filter(r => r.status === 'processing');
            if (processingReports.length > 0 && Math.random() > 0.7) {
                const report = processingReports[0];
                report.status = 'ready';
                this.populateTable();
                this.updateSummaryCards();
                this.showNotification(`报告 ${report.id} 生成完成`, 'success');
            }
        }, 30000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            maxWidth: '300px'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #22d3ee, #06b6d4)'
        };
        return colors[type] || colors.info;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .collapsible {
        overflow: hidden;
        opacity: 1;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
    }

    .header.compact {
        margin-bottom: 0;
    }

    @keyframes pulseBorder {
        0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.8); }
        100% { box-shadow: 0 0 0 12px rgba(34, 211, 238, 0); }
    }
    .pulse-focus { animation: pulseBorder 0.6s ease 2; }
`;
document.head.appendChild(style);
// ST:TINI_1755139708_e868a412
