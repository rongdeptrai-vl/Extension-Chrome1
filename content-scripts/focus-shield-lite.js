// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 661d2ea | Time: 2025-08-17T12:09:46Z
// Watermark: TINI_1755432586_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/*
 * TINI Focus Shield (Lite)
 * Purpose: reduce ads and distracting overlays while being gentle and fast.
 * Scope: skips major sites by default; can be forced via localStorage.tini_force_enable = '1'
 * No breaking changes to page logic: prefer hide over remove.
 */
(function(){
  'use strict';

  const DEBUG = !!(localStorage.getItem('tini_debug') === '1');
  const FORCE_ENABLE = !!(localStorage.getItem('tini_force_enable') === '1');

  const BIG_SITES = [
    // Search & portals
    'google.com','bing.com','yahoo.com','duckduckgo.com',
    // Google apps
    'youtube.com','mail.google.com','drive.google.com','docs.google.com','calendar.google.com','meet.google.com',
    // Social & video
    'facebook.com','instagram.com','twitter.com','x.com','reddit.com','discord.com',
    // Commerce & misc
    'amazon.com','ebay.com','aliexpress.com','shopee.vn','lazada.vn','apple.com','microsoft.com',
    // Media/streaming
    'netflix.com','spotify.com','twitch.tv','soundcloud.com',
    // Knowledge/work
    'wikipedia.org','notion.so','slack.com','figma.com','canva.com','stackoverflow.com','github.com','gitlab.com','bitbucket.org',
    // Local admin/dev
    'localhost','127.0.0.1'
  ];

  const AD_IFRAME_HOSTS = [
    'doubleclick.net','googlesyndication.com','adservice.google.com','adnxs.com','taboola.com','outbrain.com','adsafeprotected.com',
    'rubiconproject.com','yieldmo.com','criteo.com','scorecardresearch.com','zedo.com','moatads.com','pubmatic.com'
  ];

  const TEXT_MATCHES = [
    'advertisement','promo','subscribe','newsletter','allow notifications','enable notifications','cookie','consent',
    'we value your privacy','special offer','limited offer','install our app','open in app','open app'
  ];

  const cfg = {
    overlayCoverPercent: 0.35, // treat as overlay when covering >= 35% viewport
    stickyMaxHeight: 160,      // max height to consider sticky bar
    maxScanNodes: 800,         // safety cap per scan cycle
    observerDebounce: 120,     // ms
  };

  function log(...args){ if(DEBUG) console.log('[TINI-FocusShield]', ...args); }

  function hostname(){ return location.hostname.replace(/^www\./,''); }
  function endsWithHost(h){
    const host = hostname();
    return host === h || host.endsWith('.'+h);
  }
  function isBigSite(){ return BIG_SITES.some(endsWithHost); }

  // Site-level opt-out using meta tag
  function hasOptOutMeta(){
    const m = document.querySelector('meta[name="tini-focus:allow"]');
    return m && /true|1|yes/i.test(m.getAttribute('content')||'');
  }

  if (!FORCE_ENABLE && (isBigSite() || hasOptOutMeta())) {
    log('Skipping on big or opted-out site:', location.hostname);
    return;
  }

  // Utilities
  const qs = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const styleEl = document.createElement('style');
  styleEl.id = 'tini-focus-shield-style';
  styleEl.textContent = `
    /* Safe hide class */
    .tini-hidden { display: none !important; }
    /* Gentle defaults for typical ad iframes/domains */
    iframe[src*="doubleclick.net"],
    iframe[src*="googlesyndication.com"],
    iframe[src*="adnxs.com"],
    iframe[src*="taboola.com"],
    iframe[src*="outbrain.com"],
    iframe[src*="moatads.com"],
    iframe[src*="pubmatic.com"] { display: none !important; }
    /* Obvious overlay backdrops */
    [class*="backdrop" i], [class*="overlay" i] { backdrop-filter: none; }
    /* Generic sponsored content styling */
    [class*="Sponsored" i], [class*="Promoted" i] { opacity: 0.5; transition: opacity 0.3s; }
  `;
  try { document.documentElement.appendChild(styleEl); } catch(_) {}

  function getRectRatio(el){
    try {
      const r = el.getBoundingClientRect();
      const vp = { w: window.innerWidth, h: window.innerHeight };
      const area = Math.max(0, Math.min(r.right, vp.w) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vp.h) - Math.max(r.top, 0));
      const ratio = area / Math.max(1, vp.w * vp.h);
      return { r, ratio };
    } catch { return { r: {width:0,height:0}, ratio: 0 }; }
  }

  function isFixedLike(style){
    if(!style) return false;
    const pos = style.position;
    return pos === 'fixed' || pos === 'sticky' || pos === 'absolute';
  }

  function isOverlay(el){
    const cs = getComputedStyle(el);
    if(!isFixedLike(cs)) return false;
    const { ratio } = getRectRatio(el);
    if (ratio < cfg.overlayCoverPercent) return false;
    const zi = parseInt(cs.zIndex || '0', 10);
    if (zi < 999) return false;
    // Avoid hiding cookie banners from critical sites with forms
    if (el.querySelector('input, textarea, select, button')) {
      // still consider if text matches intrusive patterns
      const t = (el.textContent || '').toLowerCase();
      const hit = TEXT_MATCHES.some(k => t.includes(k));
      return hit;
    }
    return true;
  }

  function isStickyBanner(el){
    const cs = getComputedStyle(el);
    if (!isFixedLike(cs)) return false;
    const { r } = getRectRatio(el);
    const vh = Math.max(window.innerHeight, 1);
    const vw = Math.max(window.innerWidth, 1);
    const isEdge = r.top <= 4 || Math.abs(vh - r.bottom) <= 4;
    const wide = r.width >= vw * 0.8;
    const short = r.height <= cfg.stickyMaxHeight;
    if (!(isEdge && wide && short)) return false;
    const text = (el.textContent || '').toLowerCase();
    return TEXT_MATCHES.some(k => text.includes(k));
  }

  function looksLikeAdContainer(el){
    const id = (el.id || '').toLowerCase();
    const cl = (el.className || '').toString().toLowerCase();
    if (id.includes('ad') || cl.includes('ad-') || cl.includes('ads') || cl.includes('sponsor')) {
      // avoid false positives like header or badge
      if (id.includes('header') || cl.includes('header') || cl.includes('badge')) return false;
      return true;
    }
    // aria labels
    const aria = (el.getAttribute('aria-label') || '').toLowerCase();
    if (aria.includes('ad') || aria.includes('advert')) return true;
    // iframe host checks
    if (el.tagName === 'IFRAME') {
      const src = el.getAttribute('src') || '';
      try {
        const u = new URL(src, location.href);
        if (AD_IFRAME_HOSTS.some(h => u.hostname.endsWith(h))) return true;
      } catch {}
    }
    return false;
  }

  function hide(el, reason){
    if (!el || el.dataset.tiniHidden) return;
    el.dataset.tiniHidden = reason || 'hidden';
    el.classList.add('tini-hidden');
    log('hide:', reason, el);
  }

  function softRemove(el, reason){
    // Use hide by default to be safer
    hide(el, reason);
  }

  function scan(root=document){
    let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    const batch = [];
    while (walker.nextNode()) {
      const el = walker.currentNode;
      batch.push(el);
      if (++count >= cfg.maxScanNodes) break;
    }

    batch.forEach(el => {
      if (looksLikeAdContainer(el)) return hide(el, 'ad-container');
      if (isOverlay(el)) return softRemove(el, 'overlay');
      if (isStickyBanner(el)) return softRemove(el, 'sticky-banner');
    });

    // Enhanced content filtering
    applyContentFilters();

    // Handle videos (auto-play)
    qs('video, audio').forEach(m => {
      try {
        const auto = m.autoplay || m.hasAttribute('autoplay') || m.getAttribute('playsinline') === 'true';
        const loud = !m.muted && m.volume > 0.01;
        if (auto || loud) {
          m.pause();
          m.muted = true;
          m.removeAttribute('autoplay');
          m.setAttribute('data-tini-muted','1');
          log('paused media:', m.tagName);
        }
      } catch {}
    });
  }

  // Debounced observer
  let pending = false;
  let lastRun = 0;
  const runSoon = () => {
    const now = Date.now();
    if (pending) return;
    const delta = now - lastRun;
    const delay = Math.max(0, cfg.observerDebounce - delta);
    pending = true;
    setTimeout(() => {
      pending = false;
      lastRun = Date.now();
      scan();
    }, delay);
  };

  // Initial scan when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan());
  } else {
    scan();
  }

  // Observe DOM changes
  const mo = new MutationObserver(muts => {
    let added = false;
    for (const m of muts) {
      if (m.addedNodes && m.addedNodes.length) { added = true; break; }
    }
    if (added) runSoon();
  });
  try { mo.observe(document.documentElement, { childList: true, subtree: true }); } catch {}

  // Public toggle via CustomEvent
  window.addEventListener('tini-focus:toggle', (e)=>{
    const enable = !(e && e.detail === false);
    if (!enable) {
      styleEl.disabled = true; mo.disconnect();
      qs('[data-tini-hidden]').forEach(el=>{ el.classList.remove('tini-hidden'); delete el.dataset.tiniHidden;});
      log('disabled');
    } else {
      styleEl.disabled = false; scan();
      try { mo.observe(document.documentElement, { childList: true, subtree: true }); } catch {}
      log('enabled');
    }
  });

  // Content filtering
  let contentConfig = null;
  let lastConfigFetch = 0;
  let authToken = null;
  let tokenExpiry = 0;

  // Private gateway authentication
  async function getAuthToken() {
    if (authToken && Date.now() < tokenExpiry) {
      return authToken;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:3001/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'tini-extension',
          secret: 'tini-internal-2025'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        authToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000);
        return authToken;
      }
    } catch (error) {
      log('Auth failed:', error.message);
    }
    
    return null;
  }

  // Try private gateway for real rules
  async function tryPrivateGateway() {
    try {
      const token = await getAuthToken();
      if (!token) return null;
      
      const response = await fetch('http://127.0.0.1:3001/internal/blocklist.json', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      log('Private gateway failed:', error.message);
    }
    
    return null;
  }

  function applyContentFilters() {
    const now = Date.now();
    if (!contentConfig && (now - lastConfigFetch > 300000)) { // 5 minutes cache
      fetchContentRules();
    }
    if (contentConfig) {
      processContainers();
    }
  }

  function fetchContentRules() {
    lastConfigFetch = Date.now();
    try {
      // Strategy 1: Try private gateway with authentication (real rules)
      tryPrivateGateway()
        .then(data => {
          if (data) {
            contentConfig = data;
            log('Private gateway loaded (internal rules)');
            return;
          }
          throw new Error('Private gateway unavailable');
        })
        .catch(() => {
          // Strategy 2: Try public GitHub sources (clean generic rules)
          const publicSources = [
            'https://cdn.jsdelivr.net/gh/rongdeptrai-vl/filters@main/blocklist.json',
            'https://raw.githubusercontent.com/rongdeptrai-vl/filters/main/blocklist.json'
          ];
          
          return Promise.any(
            publicSources.map(url => 
              fetch(url).then(r => {
                if (!r.ok) throw new Error('Network error');
                return r.json();
              })
            )
          );
        })
        .then(data => {
          if (data) {
            contentConfig = data;
            log('Public source loaded (generic rules)');
          }
        })
        .catch(() => {
          // Strategy 3: Fallback to local file
          const configUrl = chrome.runtime?.getURL?.('blocklist.json') || '/blocklist.json';
          return fetch(configUrl)
            .then(r => r.json())
            .then(data => {
              contentConfig = data;
              log('Local fallback loaded');
            });
        })
        .catch(() => {
          // Final fallback content filters
          contentConfig = {
            fallback: {
              selectors: {
                ads_containers: ['[class*="advertisement" i]', '[class*="sponsor" i]', '[class*="promoted" i]'],
                live_containers: ['[class*="livestream" i]', '[class*="live-content" i]']
              }
            }
          };
          log('Fallback filters loaded');
        });
    } catch (e) {
      // Silent fallback
    }
  }

  function processContainers() {
    if (!contentConfig) return;
    
    // Use standard filters
    let activeSelectors = contentConfig.fallback?.selectors || {};
    
    // Apply additional rules if available
    const hostname = location.hostname.toLowerCase();
    if (contentConfig.sites) {
      for (const [domain, config] of Object.entries(contentConfig.sites)) {
        if (hostname.includes(domain)) {
          activeSelectors = {
            ...activeSelectors,
            ...config.selectors
          };
          break;
        }
      }
    }
    
    // Process advertising containers
    const adSelectors = activeSelectors.ads_containers || [];
    adSelectors.forEach(selector => {
      try {
        qs(selector).forEach(el => {
          if (!el.dataset.tiniProcessed) {
            el.dataset.tiniProcessed = 'ad';
            const isPromoted = el.querySelector('[class*="sponsor" i], [class*="promoted" i], [class*="advertisement" i]');
            const hasSponsoredText = el.textContent?.toLowerCase().includes('sponsored');
            if (isPromoted || hasSponsoredText) {
              hide(el, 'promoted-content');
            }
          }
        });
      } catch (e) {}
    });

    // Process streaming content containers
    if (localStorage.getItem('tini_block_live') === '1') {
      const liveSelectors = activeSelectors.live_containers || [];
      liveSelectors.forEach(selector => {
        try {
          qs(selector).forEach(el => {
            if (!el.dataset.tiniProcessed) {
              el.dataset.tiniProcessed = 'live';
              const liveIndicator = el.querySelector('[class*="live" i], [class*="streaming" i]');
              const hasLiveText = el.textContent?.toLowerCase().includes('live');
              if (liveIndicator || hasLiveText) {
                hide(el, 'live-content');
              }
            }
          });
        } catch (e) {}
      });
    }

    // Process suggested containers
    const recommendedSelectors = activeSelectors.recommended_containers || [];
    recommendedSelectors.forEach(selector => {
      try {
        qs(selector).forEach(el => {
          if (!el.dataset.tiniProcessed) {
            el.dataset.tiniProcessed = 'recommended';
            const hasLive = el.querySelector('[class*="live" i]');
            const hasAd = el.querySelector('[class*="sponsor" i]');
            
            if (hasLive && localStorage.getItem('tini_block_live') === '1') {
              hide(el, 'recommended-live');
            } else if (hasAd) {
              hide(el, 'recommended-ad');
            }
          }
        });
      } catch (e) {}
    });
  }

  log('initialized on', location.hostname);
})();
