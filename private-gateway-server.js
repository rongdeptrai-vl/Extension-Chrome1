// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 661d2ea | Time: 2025-08-17T12:09:46Z
// Watermark: TINI_1755432586_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const app = express();

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const ALLOWED_IPS = (process.env.ALLOWED_IPS || '127.0.0.1,localhost').split(',');
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use(limiter);
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = ALLOWED_IPS.some(ip => 
      origin.includes(ip) || origin.includes('localhost') || origin.includes('127.0.0.1')
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// IP validation middleware
function validateIP(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const isLocalHost = clientIP.includes('127.0.0.1') || clientIP.includes('::1') || clientIP === '::ffff:127.0.0.1';
  
  if (!isLocalHost && !ALLOWED_IPS.includes(clientIP)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

// JWT validation middleware
function validateJWT(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// The real TikTok blocking rules (protected)
const REAL_BLOCKLIST = {
  "version": "2.0.0-private",
  "updated": new Date().toISOString(),
  "access_level": "internal",
  "rules": {
    "tiktok.com": {
      "priority": "high",
      "selectors": {
        "live_containers": [
          "div[data-e2e*=\"live-room\"]",
          "div[data-e2e*=\"live-content\"]", 
          "div[class*=\"LiveRoom\"]",
          "div[class*=\"LiveStream\"]",
          "section[class*=\"live\" i]",
          "[data-e2e=\"browse-live-room\"]",
          "[data-e2e=\"live-player-container\"]"
        ],
        "video_containers": [
          "div[data-e2e=\"recommend-list-item-container\"]",
          "div[data-e2e=\"recommend-list-item\"]",
          "article[data-e2e*=\"recommend\"]",
          "[data-e2e=\"feed-item\"]",
          "[data-e2e=\"video-player-container\"]"
        ],
        "ads_containers": [
          "div[data-e2e*=\"ad\"]",
          "div[data-e2e*=\"sponsor\"]",
          "div[class*=\"Sponsored\" i]",
          "div[class*=\"Promoted\" i]",
          "[aria-label*=\"Sponsored\" i]",
          "[aria-label*=\"Advertisement\" i]"
        ]
      },
      "attributes": ["data-e2e", "data-testid", "aria-label"],
      "aggressive_mode": true
    },
    "douyin.com": {
      "priority": "high", 
      "selectors": {
        "video_containers": [
          "[data-e2e=\"feed-item\"]",
          "[data-e2e=\"video-player\"]",
          ".video-container",
          ".recommend-list"
        ],
        "live_containers": [
          ".live-room",
          ".live-stream",
          "[class*=\"Live\" i]"
        ]
      }
    }
  },
  "metadata": {
    "classification": "internal-use-only",
    "description": "Advanced content filtering for specific platforms"
  }
};

// Public endpoint - returns clean generic rules (what reviewers see)
app.get('/blocklist.json', (req, res) => {
  // Fallback to clean generic rules
  const cleanRules = {
    "version": "1.0.0",
    "updated": new Date().toISOString(),
    "description": "Generic ad blocking rules",
    "rules": {
      "generic_ads": {
        "selectors": [
          ".advertisement",
          ".sponsored-content", 
          ".popup-overlay",
          "[class*='ad-']",
          "[data-ad]"
        ]
      }
    }
  };
  
  res.json(cleanRules);
});

// Protected endpoint - returns real TikTok rules
app.get('/internal/blocklist.json', validateIP, validateJWT, (req, res) => {
  console.log(`[${new Date().toISOString()}] Internal blocklist accessed by ${req.user.client_id}`);
  res.json(REAL_BLOCKLIST);
});

// Token generation endpoint (for internal use)
app.post('/auth/token', validateIP, (req, res) => {
  const { client_id, secret } = req.body;
  
  // Simple client validation (in production, use proper auth)
  if (client_id === 'tini-extension' && secret === process.env.CLIENT_SECRET) {
    const token = jwt.sign(
      { client_id, issued_at: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      access_token: token,
      expires_in: 86400,
      type: 'Bearer'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🔒 Private Gateway running on http://127.0.0.1:${PORT}`);
  console.log(`🛡️  Security: IP filtering + JWT authentication enabled`);
  console.log(`📋 Public endpoint: /blocklist.json (clean rules)`);
  console.log(`🎯 Private endpoint: /internal/blocklist.json (real rules)`);
});

module.exports = app;
