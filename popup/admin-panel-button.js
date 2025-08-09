// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: ebdabf3 | Time: 2025-08-09T05:09:14Z
// Watermark: TINI_1754716154_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Admin Panel Button Handler - Lightweight overlay version
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("adminBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      // Create lightweight admin panel overlay
      createAdminPanelOverlay();
    });
  }
});

function createAdminPanelOverlay() {
  // Remove existing overlay if any
  const existingOverlay = document.querySelector('.admin-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'admin-overlay';
  
  // Create panel
  const panel = document.createElement('div');
  panel.className = 'admin-panel';
  
  panel.innerHTML = `
    <div class="admin-panel-header">
      <h3>🛡️ TINI Admin Panel</h3>
      <p>Select administration option</p>
    </div>
    
    <div class="admin-panel-buttons">
      <button class="admin-link-btn primary" onclick="openFullAdminPanel()">
        📊 Full Admin Dashboard
      </button>
      <button class="admin-link-btn secondary" onclick="openQuickSettings()">
        ⚙️ Quick Settings
      </button>
      <button class="admin-link-btn secondary" onclick="openSystemStatus()">
        📈 System Status
      </button>
    </div>
    
    <button class="admin-close-btn" onclick="closeAdminPanel()">
      ✕ Close
    </button>
  `;
  
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeAdminPanel();
    }
  });
}

function openFullAdminPanel() {
  // Only open full panel if really needed
  chrome.runtime.sendMessage({ action: "checkAdmin" }, (response) => {
    if (response && response.isAdmin) {
      chrome.windows.create({
        url: chrome.runtime.getURL("admin-panel/scripts/admin-panel.html"),
        type: "popup",
        width: 1000,
        height: 700,
      });
      closeAdminPanel();
    } else {
      showMessage("Bạn cần quyền admin để truy cập Full Dashboard", "error");
    }
  });
}

function openQuickSettings() {
  // Create quick settings overlay
  closeAdminPanel();
  createQuickSettingsOverlay();
}

function openSystemStatus() {
  // Show system status in overlay
  closeAdminPanel();
  createSystemStatusOverlay();
}

function closeAdminPanel() {
  const overlay = document.querySelector('.admin-overlay');
  if (overlay) {
    overlay.remove();
  }
}

function createQuickSettingsOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'admin-overlay';
  
  const panel = document.createElement('div');
  panel.className = 'admin-panel';
  
  panel.innerHTML = `
    <div class="admin-panel-header">
      <h3>⚙️ Quick Settings</h3>
      <p>Fast configuration options</p>
    </div>
    
    <div class="admin-panel-buttons">
      <button class="admin-link-btn secondary" onclick="toggleBlockerMode()">
        🛡️ Toggle Blocker Mode
      </button>
      <button class="admin-link-btn secondary" onclick="clearCache()">
        🧹 Clear Cache
      </button>
      <button class="admin-link-btn secondary" onclick="exportSettings()">
        📁 Export Settings
      </button>
    </div>
    
    <button class="admin-close-btn" onclick="closeAdminPanel()">
      ← Back
    </button>
  `;
  
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAdminPanel();
  });
}

function createSystemStatusOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'admin-overlay';
  
  const panel = document.createElement('div');
  panel.className = 'admin-panel';
  
  panel.innerHTML = `
    <div class="admin-panel-header">
      <h3>📈 System Status</h3>
      <p>Current system information</p>
    </div>
    
    <div style="text-align: left; font-size: 12px; margin: 15px 0;">
      <div style="margin-bottom: 8px;">🟢 Extension: <span style="color: #4caf50;">Active</span></div>
      <div style="margin-bottom: 8px;">🛡️ Security: <span style="color: #4caf50;">Protected</span></div>
      <div style="margin-bottom: 8px;">📊 Memory: <span style="color: #ff9800;">Normal</span></div>
      <div style="margin-bottom: 8px;">🔄 Version: <span style="color: #1e88e5;">v4.0.0</span></div>
    </div>
    
    <button class="admin-close-btn" onclick="closeAdminPanel()">
      ← Back
    </button>
  `;
  
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAdminPanel();
  });
}

// Quick action functions
function toggleBlockerMode() {
  showMessage("Blocker mode toggled!", "success");
  closeAdminPanel();
}

function clearCache() {
  chrome.storage.local.clear(() => {
    showMessage("Cache cleared successfully!", "success");
  });
  closeAdminPanel();
}

function exportSettings() {
  chrome.storage.local.get(null, (items) => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tini-settings.json';
    a.click();
    showMessage("Settings exported!", "success");
  });
  closeAdminPanel();
}

function showMessage(text, type) {
  // Simple message display function
  const msg = document.createElement('div');
  msg.className = `popup-message message-${type}`;
  msg.textContent = text;
  msg.style.position = 'fixed';
  msg.style.top = '20px';
  msg.style.right = '20px';
  msg.style.zIndex = '10001';
  msg.style.padding = '10px 15px';
  msg.style.borderRadius = '4px';
  msg.style.fontSize = '13px';
  
  if (type === 'success') {
    msg.style.background = '#d4edda';
    msg.style.color = '#155724';
    msg.style.border = '1px solid #c3e6cb';
  } else if (type === 'error') {
    msg.style.background = '#f8d7da';
    msg.style.color = '#721c24';
    msg.style.border = '1px solid #f5c6cb';
  }
  
  document.body.appendChild(msg);
  
  setTimeout(() => {
    if (msg.parentNode) {
      msg.parentNode.removeChild(msg);
    }
  }, 3000);
}
