// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 58a24a1 | Time: 2025-08-09T15:18:25Z
// Watermark: TINI_1754752705_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
#!/usr/bin/env node
/**
 * Regenerate admin-panel/_locales/en/messages.json from English block inside custom-i18n.js
 * Keeps ONLY keys from English source of custom-i18n.js.
 */
const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'admin-panel', 'scripts', 'custom-i18n.js');
const outFile = path.join(__dirname, '..', 'admin-panel', '_locales', 'en', 'messages.json');

function extractEnglishObject(code){
  const marker = 'this.translations.en';
  const idx = code.indexOf(marker);
  if(idx === -1) throw new Error('English translations block not found');
  const startBrace = code.indexOf('{', idx);
  if(startBrace === -1) throw new Error('Opening brace not found');
  let depth = 0; let end = -1;
  for(let i=startBrace;i<code.length;i++){
    const ch = code[i];
    if(ch === '{') depth++;
    else if(ch === '}'){ depth--; if(depth===0){ end = i; break; } }
  }
  if(end === -1) throw new Error('Closing brace not found');
  const objectText = code.slice(startBrace, end+1);
  return objectText;
}

function toJsonMessages(objText){
  // Remove trailing comments inside object
  const noComments = objText
    .replace(/\/\*[\s\S]*?\*\//g,'')
    .replace(/^[ \t]*\/\/.*$/mg,'');
  // Quote unquoted keys nav_dashboard:
  const quoted = noComments.replace(/^(\s*)([A-Za-z0-9_]+)\s*:/mg,'$1"$2":');
  // Convert to plain JSON object first
  let jsonObj;
  try {
    jsonObj = JSON.parse(quoted);
  } catch(e){
    // Attempt fix for trailing commas
    const cleaned = quoted.replace(/,(\s*})/g,'$1');
    jsonObj = JSON.parse(cleaned);
  }
  // Wrap each value into { message: value }
  const messages = {};
  Object.entries(jsonObj).forEach(([k,v])=>{
    if(typeof v === 'string') messages[k] = { message: v };
  });
  return messages;
}

function main(){
  const code = fs.readFileSync(srcFile,'utf8');
  const block = extractEnglishObject(code);
  const messages = toJsonMessages(block);
  fs.writeFileSync(outFile, JSON.stringify(messages,null,2)+'\n','utf8');
  console.log(`✅ Regenerated ${outFile} with ${Object.keys(messages).length} keys.`);
}

try { main(); } catch(e){ console.error('❌ Failed:', e); process.exit(1); }
