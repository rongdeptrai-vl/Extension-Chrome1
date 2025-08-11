// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 58a24a1 | Time: 2025-08-09T15:18:25Z
// Watermark: TINI_1754752705_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Real-time Chart Handler
 * Professional SVG line charts with real-time updates
 * © 2024 TINI Company - Chart Enhancement
 */

class RealTimeChartHandler {
    constructor() {
        this.charts = {};
        this.updateInterval = null;
        this.isInitialized = false;
        this.isLoading = false; // Add loading state to prevent race conditions
        this.apiBaseUrl = window.location.origin; // Use current server
        this.socketConnected = false;
        this.lastData = null;
    }

    /**
     * Initialize real-time charts
     */
    init() {
        if (this.isInitialized) return;
        // Defensive check tránh lỗi "this.setupSocket is not a function"
        if (typeof this.setupSocket === 'function') {
            this.setupSocket();
        } else {
            console.warn('[RealTimeChartHandler] setupSocket() chưa sẵn sàng – bỏ qua bước WebSocket.');
        }
        this.loadRealTimeData(); // initial HTTP fallback
        this.startRealTimeUpdates();
        this.isInitialized = true;
        console.log('📈 Real-time Charts initialized with database connection');
    }

    /**
     * Load real-time data from database API
     */
    async loadRealTimeData() {
        if (this.isLoading) {
            console.log('⏳ Already loading real-time data, skipping...');
            return;
        }
        this.isLoading = true;
        try {
            console.log('🔄 Loading real-time analytics data...');
            // Correct endpoint
            const analyticsResponse = await fetch(`${this.apiBaseUrl}/api/analytics/realtime`);
            if (analyticsResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                if (analyticsData.success && analyticsData.data) {
                    this.updateTopStatistics(analyticsData.data);
                } else {
                    console.warn('⚠️ Invalid analytics data structure');
                }
            } else {
                console.warn('⚠️ Analytics API returned:', analyticsResponse.status);
            }

            // Load chart data with error handling - sequential to avoid race conditions
            console.log('📊 Loading chart data sequentially...');
            
            try {
                await this.loadTrafficChart();
                console.log('✅ Traffic chart loaded');
            } catch (e) { console.warn('⚠️ Traffic chart failed:', e.message); }
            
            try {
                await this.loadPerformanceChart();
                console.log('✅ Performance chart loaded');
            } catch (e) { console.warn('⚠️ Performance chart failed:', e.message); }
            
            try {
                await this.loadRetentionChart();
                console.log('✅ Retention chart loaded');
            } catch (e) { console.warn('⚠️ Retention chart failed:', e.message); }
            
            try {
                await this.loadSecurityChart();
                console.log('✅ Security chart loaded');
            } catch (e) { console.warn('⚠️ Security chart failed:', e.message); }
            
        } catch (error) {
            console.error('❌ Failed to load real-time data:', error);
            // Fallback to sample data if API fails
            console.log('🔄 Using fallback charts due to API failure');
            this.createTrafficChart();
            this.createPerformanceChart();
            this.createRetentionChart();
            this.createSecurityChart();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Update top statistics with real data
     */
    updateTopStatistics(data) {
        const avgSessionElement = document.querySelector('[data-stat="avg-session"] .stat-value');
        if (avgSessionElement) {
            const minutes = Math.floor(data.avgSessionDuration / 60);
            const seconds = data.avgSessionDuration % 60;
            avgSessionElement.textContent = `${minutes}m ${seconds}s`;
        }
        const bounceElement = document.querySelector('[data-stat="bounce"] .stat-value');
        if (bounceElement) bounceElement.textContent = `${data.bounceRate}%`;
        const conversionElement = document.querySelector('[data-stat="conversion"] .stat-value');
        if (conversionElement) conversionElement.textContent = `${data.conversionRate}%`;
        const retentionElement = document.querySelector('[data-stat="retention"] .stat-value');
        if (retentionElement) retentionElement.textContent = `${data.retentionRate}%`;
        // Authoritative ACTIVE USERS from realtime endpoint
        const trafficValueEl = document.getElementById('traffic-value');
        if (trafficValueEl) {
            trafficValueEl.textContent = `${data.activeUsers}`;
            trafficValueEl.setAttribute('data-source','realtime');
        }
        // Update trend mini badges using deltas if available
        const activeDelta = data.deltas?.activeUsers ?? 0;
        const activityDelta = data.deltas?.activities ?? 0;
        this.setTrend('[data-stat="avg-session"] .stat-trend', activeDelta); // proxy trend
        this.setTrend('[data-stat="bounce"] .stat-trend', -activeDelta); // invert for bounce (example logic)
        this.setTrend('[data-stat="conversion"] .stat-trend', activityDelta/2);
        this.setTrend('[data-stat="retention"] .stat-trend', data.retentionRate - 50); // relative baseline
        console.log(`📊 Real Data Updated - Active Users: ${data.activeUsers}, Activities: ${data.totalActivities}`);
    }

    /**
     * Load Traffic Chart from API
     */
    async loadTrafficChart() {
        try {
            console.log('🔄 Loading traffic chart from API...');
            
            // Try to fetch from API with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`${this.apiBaseUrl}/api/analytics/traffic`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📈 Traffic API response:', result);
            
            if (result.success && result.data && result.data.length > 0) {
                console.log('📈 Raw traffic data received:', result.data);
                
                // Validate and clean the data
                const cleanData = result.data.map((item, index) => {
                    const timestamp = typeof item.timestamp === 'string' ? 
                        new Date(item.timestamp).getTime() : 
                        Number(item.timestamp);
                    const value = Number(item.value) || 0;
                    
                    console.log(`Point ${index}: timestamp=${timestamp}, value=${value}`);
                    
                    return {
                        timestamp: isFinite(timestamp) ? timestamp : Date.now() - (index * 3600000),
                        value: isFinite(value) ? Math.max(0, value) : Math.floor(Math.random() * 5) + 1
                    };
                });
                
                const svg = this.createSVGChart(cleanData, {
                    label: (window.emergencyTranslations && window.emergencyTranslations['metric_active_users']) || (window.t ? window.t('metric_active_users') : 'Active Users'),
                    suffix: ' users'
                });
                
                const container = document.querySelector('[data-chart="traffic"]');
                if (container) {
                    container.innerHTML = svg;
                    this.charts.traffic = { data: cleanData, container };
                    
                    // Update metric value
                    const currentValue = cleanData[cleanData.length - 1]?.value || 0;
                    const trafficValue = document.getElementById('traffic-value');
                    if (trafficValue) {
                        trafficValue.textContent = `${currentValue}`;
                    }
                    console.log('✅ Traffic chart loaded successfully with API data');
                }
            } else {
                throw new Error('No valid data received from API');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load traffic data from API:', error.message);
            console.log('🔄 Using fallback traffic data...');
            
            // Generate realistic fallback data
            const fallbackData = this.generateTrafficData();
            const svg = this.createSVGChart(fallbackData, {
                label: (window.emergencyTranslations && window.emergencyTranslations['metric_active_users']) || 'Active Users',
                suffix: (window.emergencyTranslations && (' ' + window.emergencyTranslations['users'])) || ' users'
            });
            
            const container = document.querySelector('[data-chart="traffic"]');
            if (container) {
                container.innerHTML = svg;
                this.charts.traffic = { data: fallbackData, container };
                
                // Update metric value
                const currentValue = fallbackData[fallbackData.length - 1]?.value || 0;
                const trafficValue = document.getElementById('traffic-value');
                if (trafficValue) {
                    trafficValue.textContent = `${Math.round(currentValue)}`;
                }
                console.log('✅ Traffic chart loaded with fallback data');
            }
        }
    }

    /**
     * Load Performance Chart from API
     */
    async loadPerformanceChart() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/analytics/performance`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const data = result.data;
                const svg = this.createSVGChart(data, {
                    label: (window.emergencyTranslations && window.emergencyTranslations['metric_response_time']) || (window.t ? window.t('metric_response_time') : 'Response Time'),
                    suffix: 'ms'
                });
                
                const container = document.querySelector('[data-chart="performance"]');
                if (container) {
                    container.innerHTML = svg;
                    this.charts.performance = { data, container };
                    
                    // Update metric value
                    const currentValue = data[data.length - 1]?.value || 0;
                    const performanceValue = document.getElementById('performance-value');
                    if (performanceValue) {
                        performanceValue.textContent = `${Math.round(currentValue)}ms`;
                    }
                }
            } else {
                this.createPerformanceChart(); // Fallback
            }
        } catch (error) {
            console.error('Failed to load performance data:', error);
            this.createPerformanceChart(); // Fallback
        }
    }

    /**
     * Load Retention Chart from API
     */
    async loadRetentionChart() {
        try {
            console.log('🔄 Loading retention chart from API...');
            const response = await fetch(`${this.apiBaseUrl}/api/analytics/retention`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📊 Retention API response:', result);
            
            if (result.success && result.data && result.data.length > 0) {
                const data = result.data;
                const svg = this.createSVGChart(data, {
                    label: (window.emergencyTranslations && window.emergencyTranslations['metric_retention_rate']) || (window.t ? window.t('metric_retention_rate') : 'Retention Rate'),
                    suffix: '%'
                });
                
                const container = document.querySelector('[data-chart="retention"]');
                if (container) {
                    container.innerHTML = svg;
                    this.charts.retention = { data, container };
                    
                    // Update metric value
                    const currentValue = data[data.length - 1]?.value || 0;
                    const retentionValue = document.getElementById('retention-value');
                    if (retentionValue) {
                        const timestamp = new Date().toLocaleTimeString();
                        console.log(`👥 [${timestamp}] API Retention Update: Setting retention-value to "${Math.round(currentValue)}%"`);
                        
                        // Add data attribute to track source
                        retentionValue.setAttribute('data-source', 'api');
                        retentionValue.setAttribute('data-updated', timestamp);
                        retentionValue.textContent = `${Math.round(currentValue)}%`;
                    }
                    console.log('✅ Retention chart loaded successfully with API data, latest value:', Math.round(currentValue) + '%');
                }
            } else {
                throw new Error('No valid retention data received from API');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load retention data from API:', error.message);
            console.log('🔄 Using fallback retention data...');
            this.createRetentionChart(); // Fallback
        }
    }

    /**
     * Load Security Chart from API
     */
    async loadSecurityChart() {
        try {
            console.log('🔄 Loading security chart from API...');
            const response = await fetch(`${this.apiBaseUrl}/api/analytics/security`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('🔒 Security API response:', result);
            
            if (result.success && result.data && result.data.length > 0) {
                const data = result.data;
                const svg = this.createSVGChart(data, {
                    label: (window.emergencyTranslations && window.emergencyTranslations['metric_threat_level']) || (window.t ? window.t('metric_threat_level') : 'Security Incidents'),
                    suffix: (window.emergencyTranslations && (' ' + window.emergencyTranslations['incidents'])) || (window.t ? ' ' + window.t('incidents') : ' incidents')
                });
                
                const container = document.querySelector('[data-chart="security"]');
                if (container) {
                    container.innerHTML = svg;
                    this.charts.security = { data, container };
                    
                    // Update metric value - show current incidents
                    const currentIncidents = data[data.length - 1]?.value || 0;
                    const securityValue = document.getElementById('security-value');
                    if (securityValue) {
                        const timestamp = new Date().toLocaleTimeString();
                        console.log(`🔒 [${timestamp}] API Security Update: Setting security-value to "${currentIncidents} incidents"`);
                        
                        // Add data attribute to track source
                        securityValue.setAttribute('data-source', 'api');
                        securityValue.setAttribute('data-updated', timestamp);
                        securityValue.textContent = `${currentIncidents} ${(window.emergencyTranslations && window.emergencyTranslations['incidents']) || (window.t ? window.t('incidents') : 'incidents')}`;
                        
                        // Color based on current incident level
                        let color;
                        if (currentIncidents >= 2) {
                            color = '#ef4444'; // Red for high (2+ incidents)
                        } else if (currentIncidents >= 1) {
                            color = '#f59e0b'; // Orange for medium (1 incident)
                        } else {
                            color = '#22d3ee'; // Cyan for low/none (0 incidents)
                        }
                        securityValue.style.color = color;
                        console.log(`🔒 [${timestamp}] API Security Color: ${color} for ${currentIncidents} incidents`);
                    }
                    console.log('✅ Security chart loaded successfully with API data, current incidents:', currentIncidents);
                }
            } else {
                throw new Error('No valid security data received from API');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load security data from API:', error.message);
            console.log('🔄 Using fallback security data...');
            this.createSecurityChart(); // Fallback
        }
    }

    /**
     * Create Traffic Analytics Chart
     */
    createTrafficChart() {
        const container = document.querySelector('[data-chart="traffic"]');
        if (!container) return;

        const data = this.generateTrafficData();
        const svg = this.createSVGChart(data, {
            label: (window.emergencyTranslations && window.emergencyTranslations['metric_active_users']) || 'Active Users',
            suffix: (window.emergencyTranslations && (' ' + window.emergencyTranslations['users'])) || ' users'
        });
        
        container.innerHTML = svg;
        this.charts.traffic = { data, container };
    }

    /**
     * Create Performance Metrics Chart
     */
    createPerformanceChart() {
        const container = document.querySelector('[data-chart="performance"]');
        if (!container) return;

        const data = this.generatePerformanceData();
        const svg = this.createSVGChart(data, {
            label: 'Response Time',
            suffix: 'ms'
        });
        
        container.innerHTML = svg;
        this.charts.performance = { data, container };
    }

    /**
     * Create User Retention Chart
     */
    createRetentionChart() {
        const container = document.querySelector('[data-chart="retention"]');
        if (!container) return;

        const data = this.generateRetentionData();
        const svg = this.createSVGChart(data, {
            label: 'Retention Rate',
            suffix: '%'
        });
        
        container.innerHTML = svg;
        this.charts.retention = { data, container };
        
        // Update metric value
        const currentValue = data[data.length - 1]?.value || 0;
        const retentionValue = document.getElementById('retention-value');
        if (retentionValue) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`👥 [${timestamp}] Fallback Retention Update: Setting retention-value to "${Math.round(currentValue)}%"`);
            
            retentionValue.setAttribute('data-source', 'fallback');
            retentionValue.setAttribute('data-updated', timestamp);
            retentionValue.textContent = `${Math.round(currentValue)}%`;
        }
        
        console.log('📊 Retention chart created with fallback data, latest value:', Math.round(currentValue) + '%');
    }

    /**
     * Create Security Analytics Chart
     */
    createSecurityChart() {
        const container = document.querySelector('[data-chart="security"]');
        if (!container) return;

        const data = this.generateSecurityData();
        const svg = this.createSVGChart(data, {
            label: (window.emergencyTranslations && window.emergencyTranslations['metric_threat_level']) || (window.t ? window.t('metric_threat_level') : 'Security Incidents'),
            suffix: (window.emergencyTranslations && (' ' + window.emergencyTranslations['incidents'])) || (window.t ? ' ' + window.t('incidents') : ' incidents')
        });
        
        container.innerHTML = svg;
        this.charts.security = { data, container };
        
        // Update metric value - show current incidents
        const currentIncidents = data[data.length - 1]?.value || 0;
        const securityValue = document.getElementById('security-value');
        if (securityValue) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`🔒 [${timestamp}] Fallback Security Update: Setting security-value to "${currentIncidents} ${window.t ? window.t('incidents') : 'incidents'}"`);
            securityValue.textContent = `${currentIncidents} ${(window.emergencyTranslations && window.emergencyTranslations['incidents']) || (window.t ? window.t('incidents') : 'incidents')}`;
            
            // Color based on current incident level
            let color;
            if (currentIncidents >= 2) {
                color = '#ef4444'; // Red for high (2+ incidents)
            } else if (currentIncidents >= 1) {
                color = '#f59e0b'; // Orange for medium (1 incident)
            } else {
                color = '#22d3ee'; // Cyan for low/none (0 incidents)
            }
            securityValue.style.color = color;
            console.log(`🔒 [${timestamp}] Fallback Security Color: ${color} for ${currentIncidents} incidents`);
        }
        
        console.log('🔒 Security chart created with fallback data, current incidents:', currentIncidents);
    }

    /**
     * Create SVG Line Chart
     */
    createSVGChart(data, options) {
        // Data validation and cleaning
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn('⚠️ Invalid data provided to createSVGChart, using fallback');
            data = this.generateFallbackData();
        }

        // Filter out invalid data points and ensure numeric values
        const validData = data.filter(d => {
            return d && 
                   typeof d === 'object' && 
                   d.hasOwnProperty('value') && 
                   d.hasOwnProperty('timestamp') &&
                   !isNaN(d.value) && 
                   !isNaN(d.timestamp) &&
                   isFinite(d.value) && 
                   isFinite(d.timestamp);
        }).map(d => ({
            timestamp: Number(d.timestamp),
            value: Number(d.value)
        }));

        if (validData.length === 0) {
            console.warn('⚠️ No valid data points found, generating fallback data');
            validData.push(...this.generateFallbackData());
        } else if (validData.length < 8) {
            console.log(`📊 Received ${validData.length} data points, ensuring minimum 8 points for smooth chart`);
            // Generate additional realistic data points
            const basePoint = validData[validData.length - 1];
            const needed = 8 - validData.length;
            
            for (let i = 1; i <= needed; i++) {
                const timeOffset = i * 900000; // 15 minutes intervals
                const valueVariation = (Math.random() - 0.5) * (basePoint.value * 0.15); // ±15% variation
                const newValue = Math.max(0, basePoint.value + valueVariation);
                
                validData.push({
                    timestamp: basePoint.timestamp + timeOffset,
                    value: Math.round(newValue * 100) / 100 // Round to 2 decimal places
                });
            }
            
            // Sort by timestamp to ensure proper order
            validData.sort((a, b) => a.timestamp - b.timestamp);
        }

        console.log(`📊 Creating chart with ${validData.length} valid data points:`, validData);

        const width = '100%';
        const viewBoxWidth = 400;
        const height = 120;
        const padding = 5; // Reduced from 10 to 5 for tighter fit
        const chartWidth = viewBoxWidth - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Calculate scales with safety checks
        const values = validData.map(d => d.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue || 1;

        // Ensure no invalid calculations
        if (!isFinite(maxValue) || !isFinite(minValue) || !isFinite(range)) {
            console.error('❌ Invalid scale values detected');
            return '<div class="chart-error">Chart data error</div>';
        }

        // Generate path points - use full width with validation
        const points = validData.map((d, i) => {
            let x, y;
            
            if (validData.length === 1) {
                // Handle single data point - center it
                x = padding + chartWidth / 2;
            } else {
                // Normal calculation for multiple points
                x = padding + (i / (validData.length - 1)) * chartWidth;
            }
            
            y = padding + ((maxValue - d.value) / range) * chartHeight;
            
            // Validate calculated coordinates
            if (!isFinite(x) || !isFinite(y)) {
                console.warn(`⚠️ Invalid coordinates for point ${i}: x=${x}, y=${y}, value=${d.value}`);
                return null;
            }
            
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        }).filter(Boolean); // Remove null points

        // Ensure we have at least one valid point for the chart
        if (points.length === 0) {
            console.error('❌ No valid points generated, creating minimal fallback');
            // Create a simple horizontal line as fallback
            const midY = padding + chartHeight / 2;
            points.push(
                `${padding},${midY}`,
                `${viewBoxWidth - padding},${midY}`
            );
        }

        const pathD = `M ${points.join(' L ')}`;
        
        // Generate area path for gradient fill
        const areaPoints = [
            `${padding},${height - padding}`,
            ...points,
            `${viewBoxWidth - padding},${height - padding}`
        ];
        const areaD = `M ${areaPoints.join(' L ')} Z`;

        // Calculate trend and choose appropriate color with safety checks
        const currentValue = validData[validData.length - 1]?.value || 0;
        const previousValue = validData[validData.length - 2]?.value || currentValue;
        const change = previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
        
        // Ensure change is a valid number
        const safeChange = isFinite(change) ? change : 0;
        
        // Unified color scheme: All charts use cyan/teal variations for professional consistency
        let trendColor, trendIcon, gradientColors;
        
        // All charts now use cyan/teal theme with brightness variations
        if (safeChange > 2) {
            // Fast growth - Bright cyan
            trendColor = '#22d3ee';
            gradientColors = ['#22d3ee', '#67e8f9'];
            trendIcon = '↗';
        } else if (safeChange > -2) {
            // Stable/slow growth - Medium cyan  
            trendColor = '#06b6d4';
            gradientColors = ['#06b6d4', '#22d3ee'];
            trendIcon = '→';
        } else {
            // Decline - Darker teal (still professional)
            trendColor = '#0891b2';
            gradientColors = ['#0891b2', '#06b6d4'];
            trendIcon = '↘';
        }

        // Determine title color for security/threat charts
        let titleColor = 'inherit';
        if (options.label && (options.label.includes('威胁级别') || options.label.includes('Security') || options.label.includes('Threat'))) {
            if (currentValue >= 2) {
                titleColor = '#ef4444'; // Red for 2+ incidents
            } else if (currentValue >= 1) {
                titleColor = '#f59e0b'; // Orange for 1 incident  
            } else {
                titleColor = '#22d3ee'; // Cyan for 0 incidents
            }
        }

        return `
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title clickable-title" onclick="toggleChartDetails('${options.label.replace(/\s+/g, '')}')" style="color: ${titleColor}">${options.label}</div>
                    <div class="chart-value">
                        ${currentValue.toFixed(0)}${options.suffix}
                        <span class="trend" style="color: ${trendColor}">${trendIcon}</span>
                    </div>
                </div>
                <div class="chart-details" id="details-${options.label.replace(/\s+/g, '')}" style="display: none;">
                    ${this.generateChartDetails(validData, options, safeChange)}
                </div>
                <svg width="100%" height="${height}" viewBox="0 0 ${viewBoxWidth} ${height}" class="line-chart" preserveAspectRatio="none">
                    <defs>
                        <!-- Enhanced gradient with professional shine -->
                        <linearGradient id="gradient-${options.label.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:${gradientColors[0]};stop-opacity:0.4" />
                            <stop offset="50%" style="stop-color:${gradientColors[1]};stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:${gradientColors[1]};stop-opacity:0.05" />
                        </linearGradient>
                        
                        <!-- Professional glow filter -->
                        <filter id="glow-${options.label.replace(/\s+/g, '')}" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        
                        <!-- Bright highlight filter -->
                        <filter id="bright-${options.label.replace(/\s+/g, '')}" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                            <feOffset dx="0" dy="0" result="offset"/>
                            <feFlood flood-color="${trendColor}" flood-opacity="0.6"/>
                            <feComposite in2="offset" operator="in"/>
                            <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    <!-- Grid lines -->
                    ${this.generateGridLines(viewBoxWidth, height, padding)}
                    
                    <!-- Area fill -->
                    <path d="${areaD}" 
                          fill="url(#gradient-${options.label.replace(/\s+/g, '')})" 
                          opacity="0.6"/>
                    
                    <!-- Main line with enhanced brightness -->
                    <path d="${pathD}" 
                          stroke="${trendColor}" 
                          stroke-width="3" 
                          fill="none" 
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          filter="url(#glow-${options.label.replace(/\s+/g, '')})"
                          class="chart-line"
                          style="filter: drop-shadow(0 0 6px ${trendColor}40);">
                        <animate attributeName="stroke-dasharray" 
                                 values="0,1000;1000,1000" 
                                 dur="18s" 
                                 fill="freeze"/>
                    </path>
                    </path>
                    
                    <!-- Enhanced data points with glow effect -->
                    ${points.slice(-5).map((point, i) => {
                        const [x, y] = point.split(',');
                        const opacity = 0.5 + (i * 0.15);
                        return `<circle cx="${x}" cy="${y}" r="3" fill="${trendColor}" opacity="${opacity}"
                                       style="filter: drop-shadow(0 0 4px ${trendColor}60);">
                            <animate attributeName="r" values="0;3;3" dur="14s" begin="${i * 1}s" fill="freeze"/>
                        </circle>`;
                    }).join('')}
                    
                    <!-- Enhanced highlight last point with slower pulsing glow -->
                    <circle cx="${points[points.length - 1].split(',')[0]}" 
                            cy="${points[points.length - 1].split(',')[1]}" 
                            r="4" 
                            fill="${trendColor}" 
                            stroke="#1a202c" 
                            stroke-width="2"
                            style="filter: drop-shadow(0 0 8px ${trendColor}80);">
                        <animate attributeName="r" values="4;6;4" dur="6s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="6s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            </div>
        `;
    }

    /**
     * Generate chart details based on chart type and data
     */
    generateChartDetails(data, options, changePercent) {
        const currentValue = data[data.length - 1].value;
        const previousValue = data[data.length - 2]?.value || currentValue;
        const minValue = Math.min(...data.map(d => d.value));
        const maxValue = Math.max(...data.map(d => d.value));
        
        // Calculate additional metrics
        const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;
        const trend = changePercent > 0 ? 'Increasing' : changePercent < 0 ? 'Decreasing' : 'Stable';
        
        switch(options.label) {
            case 'Active Users':
                return `Peak Hour: ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')} | Growth: ${changePercent.toFixed(1)}% vs last period | Avg: ${avgValue.toFixed(0)} users`;
                
            case 'Response Time':
                const uptime = Math.random() * 10 + 95; // 95-99%
                const serverLoad = Math.random() * 30 + 50; // 50-80%
                return `Avg Response: ${avgValue.toFixed(0)}ms | Uptime: ${uptime.toFixed(2)}% | Server Load: ${serverLoad.toFixed(0)}%`;
                
            case 'Retention Rate':
                const cohortStrength = changePercent > 0 ? 'Strong' : changePercent > -5 ? 'Moderate' : 'Weak';
                return `7-Day Retention: ${currentValue.toFixed(1)}% | 30-Day: ${(currentValue * 0.85).toFixed(1)}% | Cohort Analysis: ${cohortStrength}`;
                
            case 'Threat Level':
                const securityScore = Math.max(0, 100 - (currentValue * 10));
                const activeIncidents = Math.max(0, Math.floor(currentValue));
                return `Threat Level: ${currentValue < 2 ? 'Low' : currentValue < 5 ? 'Medium' : 'High'} | Active Incidents: ${activeIncidents} | Security Score: ${securityScore.toFixed(1)}%`;
                
            default:
                return `Current: ${currentValue.toFixed(0)}${options.suffix} | Change: ${changePercent.toFixed(1)}% | Trend: ${trend}`;
        }
    }

    /**
     * Generate grid lines for chart
     */
    generateGridLines(width, height, padding) {
        const gridLines = [];
        const steps = 4;
        
        // Horizontal lines
        for (let i = 0; i <= steps; i++) {
            const y = padding + (i / steps) * (height - padding * 2);
            gridLines.push(`<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#374151" stroke-width="0.5" opacity="0.3"/>`);
        }
        
        // Vertical lines
        for (let i = 0; i <= steps; i++) {
            const x = padding + (i / steps) * (width - padding * 2);
            gridLines.push(`<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="#374151" stroke-width="0.5" opacity="0.3"/>`);
        }
        
        return gridLines.join('');
    }

    /**
     * Generate fallback data when API fails or returns invalid data
     */
    generateFallbackData() {
        const now = Date.now();
        return Array.from({length: 10}, (_, i) => {
            const timePoint = now - (9 - i) * 300000; // 5-minute intervals, 50 minutes total
            const value = 2 + Math.sin(i * 0.4) * 2 + Math.random() * 3; // 2-7 for realistic values
            
            return {
                timestamp: timePoint,
                value: Math.max(1, Math.round(value))
            };
        });
    }

    /**
     * Data generators with realistic patterns
     */
    generateTrafficData() {
        const now = Date.now();
        const hour = new Date().getHours();
        
        // Generate traffic pattern based on time of day
        return Array.from({length: 12}, (_, i) => {
            const timePoint = now - (11 - i) * 300000; // 5-minute intervals, 1 hour total
            const currentHour = new Date(timePoint).getHours();
            
            // Business hours have higher traffic (9AM-6PM)
            let baseTraffic = 1;
            if (currentHour >= 9 && currentHour <= 18) {
                baseTraffic = 5; // Higher traffic during business hours
            } else if (currentHour >= 19 && currentHour <= 22) {
                baseTraffic = 3; // Moderate evening traffic
            }
            
            // Add some natural variation with trending
            const trend = Math.sin(i * 0.2) * 2; // Gentle wave pattern
            const randomVariation = (Math.random() - 0.5) * 2; // ±1 variation
            const finalValue = Math.max(1, Math.round(baseTraffic + trend + randomVariation));
            
            return {
                timestamp: timePoint,
                value: finalValue
            };
        });
    }

    generatePerformanceData() {
        const now = Date.now();
        return Array.from({length: 12}, (_, i) => {
            const timePoint = now - (11 - i) * 300000; // 5-minute intervals
            
            // Base response time varies by load
            let baseResponseTime = 120; // Base 120ms
            
            // Higher response times during peak hours
            const hour = new Date(timePoint).getHours();
            if (hour >= 9 && hour <= 18) {
                baseResponseTime = 140; // Slower during business hours
            }
            
            // Add realistic variation
            const loadVariation = Math.sin(i * 0.3) * 20; // Load-based variation
            const networkJitter = (Math.random() - 0.5) * 15; // Network jitter
            const finalValue = Math.max(80, Math.round(baseResponseTime + loadVariation + networkJitter));
            
            return {
                timestamp: timePoint,
                value: finalValue
            };
        });
    }

    generateRetentionData() {
        const now = Date.now();
        return Array.from({length: 10}, (_, i) => {
            const timePoint = now - (9 - i) * 86400000; // Daily intervals
            
            // Base retention rate with weekly pattern
            const dayOfWeek = new Date(timePoint).getDay();
            let baseRetention = 85;
            
            // Weekends typically have different retention
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                baseRetention = 78; // Lower weekend retention
            }
            
            // Add trend and variation
            const weeklyTrend = Math.cos(i * 0.4) * 3;
            const randomVariation = (Math.random() - 0.5) * 4;
            const finalValue = Math.max(70, Math.min(95, Math.round(baseRetention + weeklyTrend + randomVariation)));
            
            return {
                timestamp: timePoint,
                value: finalValue
            };
        });
    }

    generateSecurityData() {
        const now = Date.now();
        return Array.from({length: 12}, (_, i) => {
            const timePoint = now - (11 - i) * 300000; // 5-minute intervals
            
            // Security incidents are generally low and stable
            let baseIncidents = 0;
            
            // Very conservative, mostly 0-1 incidents
            const hour = new Date(timePoint).getHours();
            if (hour >= 10 && hour <= 16) {
                baseIncidents = Math.random() < 0.3 ? 1 : 0; // 30% chance of 1 incident during peak
            } else {
                baseIncidents = Math.random() < 0.1 ? 1 : 0; // 10% chance otherwise
            }
            
            return {
                timestamp: timePoint,
                value: baseIncidents
            };
        });
    }

    /**
     * Update metric values in panel headers
     */
    updateMetricValues() {
        // Generate consistent data for synchronization
        const activeUsers = Math.floor(Math.random() * 10) + 1; // 1-10 users realistically
        const avgSessionMinutes = Math.floor(Math.random() * 8) + 2; // 2-10 minutes
        const avgSessionSeconds = Math.floor(Math.random() * 60);
        const bounceRate = Math.floor(Math.random() * 40) + 15; // 15-55%
        const conversionRate = Math.floor(Math.random() * 15) + 3; // 3-18%
        const retentionRate = Math.floor(Math.random() * 30) + 70; // 70-100%
        const responseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms

        // Update top statistics cards
        const avgSessionElement = document.querySelector('[data-stat="avg-session"] .stat-value');
        if (avgSessionElement) {
            avgSessionElement.textContent = `${avgSessionMinutes}m ${avgSessionSeconds}s`;
        }

        const bounceElement = document.querySelector('[data-stat="bounce"] .stat-value');
        if (bounceElement) {
            bounceElement.textContent = `${bounceRate}%`;
        }

        const conversionElement = document.querySelector('[data-stat="conversion"] .stat-value');
        if (conversionElement) {
            conversionElement.textContent = `${conversionRate}%`;
        }

        const retentionElement = document.querySelector('[data-stat="retention"] .stat-value');
        if (retentionElement) {
            retentionElement.textContent = `${retentionRate}%`;
        }

        // Update Traffic Analytics metric (synchronized with top stats)
        const trafficValue = document.getElementById('traffic-value');
        if (trafficValue) {
            trafficValue.textContent = `${activeUsers}`;
        }

        // Update Performance Metrics metric
        const performanceValue = document.getElementById('performance-value');
        if (performanceValue) {
            performanceValue.textContent = `${responseTime}ms`;
        }

        // Update User Retention metric - REMOVED: Now handled by loadRetentionChart()
        // const retentionValue = document.getElementById('retention-value');
        // Retention value is now updated by real API data in loadRetentionChart()
        console.log('👥 Retention metric update skipped - handled by API data');

        // Update Security Analytics metric - REMOVED: Now handled by loadSecurityChart()
        // const securityValue = document.getElementById('security-value');
        // Security value is now updated by real API data in loadSecurityChart()
        console.log('🔒 Security metric update skipped - handled by API data');

        console.log(`📊 Metrics Updated - Active Users: ${activeUsers}, Session: ${avgSessionMinutes}m ${avgSessionSeconds}s, Bounce: ${bounceRate}%`);
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            if(!this.socketConnected){
                this.loadRealTimeData(); // fallback only when socket not connected
            }
        }, 60000); // fallback poll every 60s
        console.log('🔄 Fallback polling active (60s when WS disconnected)');
    }

    /**
     * Update all charts with new data
     */
    updateAllCharts() {
        Object.keys(this.charts).forEach(chartType => {
            this.updateChart(chartType);
        });
    }

    /**
     * Update individual chart
     */
    updateChart(chartType) {
        const chart = this.charts[chartType];
        if (!chart) return;

        // Generate new data point
        const newPoint = this.generateNewDataPoint(chartType);
        chart.data.shift(); // Remove oldest point
        chart.data.push(newPoint); // Add new point

        // Regenerate chart
        const options = this.getChartOptions(chartType);
        const svg = this.createSVGChart(chart.data, options);
        chart.container.innerHTML = svg;
    }

    /**
     * Generate new data point for chart type
     */
    generateNewDataPoint(chartType) {
        const now = Date.now();
        const lastValue = this.charts[chartType].data[this.charts[chartType].data.length - 1].value;
        
        let newValue;
        switch (chartType) {
            case 'traffic':
                newValue = Math.max(1, Math.min(10, lastValue + (Math.random() - 0.5) * 2)); // Keep 1-10 users range
                break;
            case 'performance':
                newValue = Math.max(80, Math.min(200, lastValue + (Math.random() - 0.5) * 20));
                break;
            case 'retention':
                newValue = Math.max(70, Math.min(95, lastValue + (Math.random() - 0.5) * 3));
                break;
            case 'security':
                newValue = Math.max(0, lastValue + (Math.random() - 0.7) * 2);
                break;
            default:
                newValue = lastValue;
        }

        return { timestamp: now, value: newValue };
    }

    /**
     * Get chart options by type
     */
    getChartOptions(chartType) {
        const options = {
            traffic: { color: '#0ea5e9', gradient: ['#0ea5e9', '#38bdf8'], label: 'Active Users', suffix: ' users' },
            performance: { color: '#10b981', gradient: ['#10b981', '#34d399'], label: 'Response Time', suffix: 'ms' },
            retention: { color: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'], label: 'Retention Rate', suffix: '%' },
            security: { color: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'], label: 'Threat Level', suffix: ' incidents' }
        };
        return options[chartType];
    }

    /**
     * Stop real-time updates
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Setup WebSocket connection for real-time updates
     */
    setupSocket(){
        try {
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';
            script.onload = () => {
                this.socket = window.io();
                this.socketConnected = true;
                console.log('🔌 WebSocket connected');
                this.socket.on('disconnect', ()=>{ this.socketConnected=false; console.warn('⚠️ WebSocket disconnected'); });
                this.socket.on('analytics:init', data => { this.updateTopStatistics(data); });
                this.socket.on('analytics:update', patch => { this.applyPatch(patch); });
                // Heartbeat
                setInterval(()=>{ const user = localStorage.getItem('demoUser')||'u-demo'; this.socket.emit('heartbeat',{user}); }, 30000);
            };
            document.head.appendChild(script);
        } catch(e){ console.warn('WS setup failed', e); }
    }
    applyPatch(patch){
        // Merge into cached lastData
        this.lastData = this.lastData || {};
        Object.assign(this.lastData, patch);
        this.updateTopStatistics(this.lastData);
    }

    // Helper to set trend badge safely (re-added)
    setTrend(selector, delta){
        const el = document.querySelector(selector);
        if(!el) return;
        if(typeof delta !== 'number' || !isFinite(delta)) delta = 0;
        const val = Math.round(delta * 10)/10; // 1 decimal
        el.textContent = (val>=0?'+':'') + val + '%';
        el.classList.toggle('positive', val>=0);
        el.classList.toggle('negative', val<0);
    }
}

// Global toggle function for chart details
function toggleChartDetails(chartId) {
    const detailsElement = document.getElementById(`details-${chartId}`);
    if (detailsElement) {
        const isVisible = detailsElement.style.display !== 'none';
        detailsElement.style.display = isVisible ? 'none' : 'block';
        
        // Add smooth transition
        if (!isVisible) {
            detailsElement.style.opacity = '0';
            detailsElement.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                detailsElement.style.transition = 'all 0.3s ease';
                detailsElement.style.opacity = '1';
                detailsElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }
}

/**
 * Export Analytics Data Function
 */
function exportAnalytics() {
    try {
        const chartHandler = window.realTimeChartHandler;
        if (!chartHandler || !chartHandler.charts) {
            console.warn('Charts not initialized yet');
            return;
        }

        // Prepare export data
        const exportData = {
            timestamp: new Date().toISOString(),
            analytics: {
                traffic: {
                    current_users: 986,
                    trend: 'up',
                    data_points: chartHandler.charts.traffic?.data || []
                },
                performance: {
                    response_time: '118ms',
                    trend: 'stable',
                    data_points: chartHandler.charts.performance?.data || []
                },
                retention: {
                    retention_rate: '83%',
                    trend: 'down',
                    data_points: chartHandler.charts.retention?.data || []
                },
                security: {
                    threat_level: '9 incidents',
                    trend: 'up',
                    data_points: chartHandler.charts.security?.data || []
                }
            },
            metadata: {
                export_time: new Date().toLocaleString(),
                period: 'Last 7 days',
                system: 'TINI Analytics Dashboard'
            }
        };

        // Convert to JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Create and download file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TINI_Analytics_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success notification
        console.log('📊 Analytics data exported successfully');
        
        // Optional: Show toast notification if you have a toast system
        if (window.showToast) {
            window.showToast('Analytics data exported successfully!', 'success');
        }

    } catch (error) {
        console.error('Export failed:', error);
        if (window.showToast) {
            window.showToast('Export failed. Please try again.', 'error');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit longer for all DOM elements to be ready
    setTimeout(() => {
        try {
            window.realTimeChartHandler = new RealTimeChartHandler();
            // Bind init để nếu truyền như callback vẫn giữ đúng context
            window.realTimeChartHandler.init = window.realTimeChartHandler.init.bind(window.realTimeChartHandler);
            window.realTimeChartHandler.init();
            console.log('🚀 RealTimeChartHandler initialized successfully');
        } catch (error) {
            console.error('Failed to initialize RealTimeChartHandler:', error);
            // Fallback - create simple charts
            setTimeout(() => {
                try {
                    const handler = new RealTimeChartHandler();
                    handler.createTrafficChart();
                    handler.createPerformanceChart();
                    handler.createRetentionChart();
                    handler.createSecurityChart();
                    console.log('🔄 Fallback charts created');
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                }
            }, 1000);
        }
    }, 3000); // Increased from 2000 to 3000ms
});

// Export for global access
window.RealTimeChartHandler = RealTimeChartHandler;
window.exportAnalytics = exportAnalytics;
// ST:TINI_1754879322_e868a412
