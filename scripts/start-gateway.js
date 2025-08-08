// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Wrapper to start the unified gateway without path quoting issues on Windows
(async () => {
  try {
    process.env.PORT = process.env.PORT || '8099';
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    const { startServer } = require('../Docker/server 8099.js');
    await startServer();
  } catch (e) {
    console.error('Failed to start gateway:', e);
    process.exit(1);
  }
})();
