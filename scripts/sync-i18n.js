// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 58a24a1 | Time: 2025-08-09T15:18:25Z
// Watermark: TINI_1754752705_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
#!/usr/bin/env node
/**
 * I18N Sync Script
 * Base locale: en
 * - Adds missing keys to other locales with placeholder value "" (or copy English if --fill=en)
 * - Marks obsolete keys (present in target but not in base) by moving them under __obsolete object
 * - Keeps ordering same as base for readability
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LOCALES_DIRS = [
  path.join(ROOT, '_locales'),
  path.join(ROOT, 'admin-panel', '_locales')
];
const BASE_LANG = 'en';
const OPTIONS = {
  fillMode: process.argv.includes('--fill=en') ? 'english' : 'empty'
};

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function saveJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function syncDir(dir) {
  const basePath = path.join(dir, BASE_LANG, 'messages.json');
  if (!fs.existsSync(basePath)) return;
  const base = loadJSON(basePath);
  const baseKeys = Object.keys(base);

  const languages = fs.readdirSync(dir).filter(l => l !== BASE_LANG && fs.statSync(path.join(dir, l)).isDirectory());

  for (const lang of languages) {
    const file = path.join(dir, lang, 'messages.json');
    if (!fs.existsSync(file)) continue;
    const data = loadJSON(file);

    const obsolete = {};

    // Detect obsolete keys
    for (const k of Object.keys(data)) {
      if (!baseKeys.includes(k)) {
        obsolete[k] = data[k];
        delete data[k];
      }
    }

    // Build new ordered object
    const out = {};
    for (const k of baseKeys) {
      if (data[k]) {
        out[k] = data[k];
      } else {
        // missing key
        out[k] = { message: OPTIONS.fillMode === 'english' && base[k].message ? base[k].message : '' };
      }
    }

    if (Object.keys(obsolete).length) {
      out.__obsolete = obsolete; // grouped at end
    }

    saveJSON(file, out);
    console.log(`[i18n-sync] Synced ${lang} in ${dir}`);
  }
}

for (const d of LOCALES_DIRS) {
  if (fs.existsSync(d)) syncDir(d);
}

console.log('✅ i18n sync complete');
