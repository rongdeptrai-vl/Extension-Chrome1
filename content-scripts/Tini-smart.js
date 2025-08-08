// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

// ⚠️ XSS WARNING: innerHTML usage detected - potential XSS vulnerability
// Use window.secureSetHTML(element, content) instead of element.innerHTML = content
// Or use element.textContent for plain text

// ⚠️ SECURITY WARNING: localStorage usage detected
// Consider using secure storage methods to prevent XSS attacks
// Use window.secureSetStorage(), window.secureGetStorage(), window.secureRemoveStorage()
/**
 * TINI Security Fix - Auto-generated
 * TINI SMART - ADAPTIVE VERSION
 * VERSION: 3.0.0 LIMITED
 * Author: rongdeptrai-dev
 * Date: 2025-07-24
 * Contact: rongdz147@gmail.com
 * Tự động thích nghi với DOM changes
 * No fixed selectors!
 * Phiên bản limited này có thể giúp bạn chặn LIVE-ADS nhanh hơn cách người yêu cũ trở mặt
 * Sống dai như đĩa mà không cần phải nhờ đến câu: "thiếu em anh không thể nào sống nỗi".
 */

// TINI Security Fix - Auto-generated
if (typeof window !== 'undefined' && !window.TINI_SYSTEM) {
    console.warn('TINI namespace not loaded in Tini-smart.js');
}

(function() {
  'use strict';
  
  // ===== ADAPTIVE ELEMENT FINDER =====
  class SmartElementFinder {
    constructor() {
      // Không dùng selector cố định!
      this.videoContainers = new Set();
      this.learningMode = true;
      this.containerPatterns = {
        // Patterns để nhận diện video container
        minHeight: 400,
        maxWidth: 600,
        hasVideo: true,
        hasText: true,
        aspectRatio: { min: 0.4, max: 0.7 }
      };
    }
    
    findVideoContainers() {
      const containers = [];
      
      // Strategy 1: Find all elements with video
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        // Tìm container cha phù hợp
        let parent = video.parentElement;
        let depth = 0;
        
        while (parent && depth < 5) {
          if (this.isLikelyContainer(parent)) {
            containers.push(parent);
            break;
          }
          parent = parent.parentElement;
          depth++;
        }
      });
      
      // Strategy 2: Find by structure pattern
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach(div => {
        if (this.matchesContainerPattern(div)) {
          containers.push(div);
        }
      });
      
      // Remove duplicates
      return [...new Set(containers)];
    }
    
    isLikelyContainer(element) {
      const rect = element.getBoundingClientRect();
      
      // Size check
      if (rect.height < this.containerPatterns.minHeight) return false;
      if (rect.width > this.containerPatterns.maxWidth) return false;
      
      // Aspect ratio check (portrait video)
      const ratio = rect.width / rect.height;
      if (ratio < this.containerPatterns.aspectRatio.min || 
          ratio > this.containerPatterns.aspectRatio.max) return false;
      
      // Has video child
      const hasVideo = element.querySelector('video') !== null;
      
      // Has text content
      const hasText = (element.innerText || '').length > 10;
      
      // Has interactive elements
      const hasInteractive = element.querySelector('button, a') !== null;
      
      // Score based approach
      let score = 0;
      if (hasVideo) score += 3;
      if (hasText) score += 2;
      if (hasInteractive) score += 1;
      if (rect.height > 500) score += 1;
      
      return score >= 4;
    }
    
    matchesContainerPattern(element) {
      // Không check class name!
      // Check structure instead
      
      // Must be visible
      if (element.offsetHeight === 0) return false;
      
      // Check children pattern
      const children = element.children;
      if (children.length < 2) return false;
      
      // Common pattern: video container có nhiều layers
      let hasMultipleLayers = false;
      let hasMediaElements = false;
      let hasTextElements = false;
      
      for (const child of children) {
        if (child.children.length > 0) hasMultipleLayers = true;
        if (child.querySelector('video, img')) hasMediaElements = true;
        if (child.innerText && child.innerText.length > 10) hasTextElements = true;
      }
      
      return hasMultipleLayers && (hasMediaElements || hasTextElements);
    }
    
    // Learning from user behavior
    learnFromElement(element) {
      // Lưu pattern của element được confirm là video container
      const pattern = {
        tagName: element.tagName,
        childrenCount: element.children.length,
        height: element.offsetHeight,
        width: element.offsetWidth,
        depth: this.getElementDepth(element)
      };
      
      console.log('Learned pattern:', pattern);
      // Có thể lưu vào localStorage để persistent
    }
    
    getElementDepth(element) {
      let depth = 0;
      let parent = element.parentElement;
      while (parent && depth < 10) {
        depth++;
        parent = parent.parentElement;
      }
      return depth;
    }
  }

  // ===== ENHANCED DETECTOR - Không phụ thuộc DOM structure =====
  class AdaptiveDetector {
    constructor() {
      this.checked = new WeakSet();
      this.patterns = this.loadPatterns();
    }
    
    loadPatterns() {
      // Load saved patterns hoặc use default
      const saved = (window.TINI_SYSTEM?.utils?.secureStorage?.get('tiktok_blocker_patterns') || localStorage.getItem('tiktok_blocker_patterns'));
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      
      return {
        live: ['LIVE', '🔴', '• LIVE', 'TRỰC TIẾP', 'Đang phát'],
        ads: ['Sponsored', 'Quảng cáo', 'Mua ngay', 'Shop', 'Giảm giá']
      };
    }
    
    detect(element) {
      if (this.checked.has(element)) return null;
      this.checked.add(element);
      
      // Flexible detection - không phụ thuộc structure
      const result = {
        type: null,
        score: 0,
        confidence: 0,
        signals: []
      };
      
      // 1. Text analysis từ toàn bộ subtree
      const texts = this.extractAllTexts(element);
      this.analyzeTexts(texts, result);
      
      // 2. Visual signals
      this.analyzeVisualElements(element, result);
      
      // 3. Behavioral signals  
      this.analyzeBehavior(element, result);
      
      // 4. Calculate confidence
      result.confidence = this.calculateConfidence(result);
      
      // Decision
      if (result.confidence > 0.7 && result.score > 6) {
        return result;
      }
      
      return null;
    }
    
    extractAllTexts(element) {
      const texts = [];
      
      // Get all text nodes
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.length > 2) {
          texts.push(text);
        }
      }
      
      return texts;
    }
    
    analyzeTexts(texts, result) {
      const combinedText = texts.join(' ');
      
      // Check patterns với fuzzy matching
      for (const livePattern of this.patterns.live) {
        if (combinedText.includes(livePattern)) {
          result.score += 4;
          result.type = 'LIVE';
          result.signals.push(`text:${livePattern}`);
        }
      }
      
      for (const adPattern of this.patterns.ads) {
        if (combinedText.toLowerCase().includes(adPattern.toLowerCase())) {
          result.score += 3;
          if (!result.type) result.type = 'AD';
          result.signals.push(`text:${adPattern}`);
        }
      }
      
      // Phone number detection
      if (/\d{10,11}/.test(combinedText)) {
        result.score += 2;
        if (!result.type) result.type = 'AD';
        result.signals.push('phone-number');
      }
    }
    
    analyzeVisualElements(element, result) {
      // Red elements (common in LIVE)
      const redElements = this.findColoredElements(element, 'red');
      if (redElements.length > 0 && result.type === 'LIVE') {
        result.score += 2;
        result.signals.push('red-badge');
      }
      
      // Video với overlay elements
      const video = element.querySelector('video');
      if (video) {
        const overlay = this.findOverlayElements(video);
        if (overlay.length > 0) {
          result.score += 1;
          result.signals.push('video-overlay');
        }
      }
      
      // Multiple clickable elements (shopping)
      const clickables = element.querySelectorAll('[onclick], [href], button');
      if (clickables.length > 3) {
        result.score += 1;
        result.signals.push('multiple-links');
      }
    }
    
    findColoredElements(root, color) {
      const elements = [];
      const all = root.querySelectorAll('*');
      
      all.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color.includes('255, 0') || 
            style.backgroundColor.includes('255, 0') ||
            style.borderColor.includes('255, 0')) {
          elements.push(el);
        }
      });
      
      return elements;
    }
    
    findOverlayElements(video) {
      const videoRect = video.getBoundingClientRect();
      const overlays = [];
      
      // Find elements that overlap with video
      const siblings = video.parentElement.querySelectorAll('*');
      siblings.forEach(el => {
        if (el === video) return;
        
        const rect = el.getBoundingClientRect();
        if (rect.left >= videoRect.left && 
            rect.top >= videoRect.top &&
            rect.right <= videoRect.right &&
            rect.bottom <= videoRect.bottom) {
          overlays.push(el);
        }
      });
      
      return overlays;
    }
    
    analyzeBehavior(element, result) {
      // Check for commercial behavior
      const hasDataTracking = Array.from(element.attributes).some(attr => 
        attr.name.includes('track') || attr.name.includes('gtm')
      );
      
      if (hasDataTracking) {
        result.score += 1;
        result.signals.push('tracking-attrs');
      }
    }
    
    calculateConfidence(result) {
      // Multi-factor confidence
      const signalDiversity = result.signals.length;
      const scoreStrength = result.score;
      
      let confidence = 0;
      
      // More signals = higher confidence  
      confidence += Math.min(signalDiversity * 0.15, 0.6);
      
      // Higher score = higher confidence
      confidence += Math.min(scoreStrength * 0.05, 0.4);
      
      return Math.min(confidence, 0.95);
    }
  }

  // ===== MAIN APP với Adaptive approach =====
  class TikTokBlockerAdaptive {
    constructor() {
      this.finder = new SmartElementFinder();
      this.detector = new AdaptiveDetector();
      this.hidden = new Map();
      this.observer = null;
      this.stats = { ads: 0, lives: 0 };
    }
    
    init() {
      console.log('🚀 TikTok Blocker Adaptive - Started!');
      console.log('📡 Auto-adapts to DOM changes!');
      
      // Start scanning
      this.startScanning();
      
      // Setup intersection observer
      this.setupObserver();
      
      // Create UI
      this.createUI();
      
      // Auto-save patterns
      setInterval(() => this.savePatterns(), 30000);
    }
    
    startScanning() {
      const scan = () => {
        // Find containers dynamically
        const containers = this.finder.findVideoContainers();
        
        containers.forEach(container => {
          if (!this.hidden.has(container)) {
            this.observer.observe(container);
          }
        });
        
        // Debug info
        if (containers.length > 0) {
          console.log(`Found ${containers.length} video containers`);
        }
      };
      
      // Initial scan
      scan();
      
      // Periodic rescan
      setInterval(scan, 3000);
    }
    
    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const result = this.detector.detect(entry.target);
            if (result) {
              this.hideElement(entry.target, result);
            }
          }
        });
      }, {
        threshold: 0.3
      });
    }
    
    hideElement(element, result) {
      element.style.display = 'none';
      
      // Stop media
      const videos = element.querySelectorAll('video');
      videos.forEach(v => v.pause());
      
      // Save info
      this.hidden.set(element, result);
      
      // Update stats
      if (result.type === 'LIVE') this.stats.lives++;
      else if (result.type === 'AD') this.stats.ads++;
      
      console.log(`Blocked ${result.type} (confidence: ${result.confidence.toFixed(2)})`);
    }
    
    createUI() {
      const button = document.createElement('div');
      
      // SECURITY WARNING: innerHTML usage - should consider textContent for simple text
      button.innerHTML = '🚫';
      
      button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #ff0050;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(255,0,80,0.4);
        z-index: 99999;
        font-size: 24px;
      `;
      
      button.onclick = () => {
        console.log('Stats:', this.stats);
        console.log('Hidden elements:', this.hidden.size);
        
        // Toggle visibility
        this.hidden.forEach((result, element) => {
          element.style.display = element.style.display === 'none' ? '' : 'none';
        });
      };
      
      document.body.appendChild(button);
    }
    
    savePatterns() {
      // Save successful patterns
      (window.TINI_SYSTEM?.utils?.secureStorage?.set('tiktok_blocker_patterns', JSON.stringify(this.detector.patterns)) || localStorage.setItem('tiktok_blocker_patterns', JSON.stringify(this.detector.patterns)));
    }
  }

  // ===== START =====
  const app = new TikTokBlockerAdaptive();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }
  
  // Debug API
  window.TikTokBlocker = {
    app: app,
    finder: app.finder,
    rescan: () => app.startScanning()
  };

})(); 