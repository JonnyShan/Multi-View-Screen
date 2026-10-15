// Spreadsheet readers for sheet2json: CSV/TSV and XLSX, no dependencies.
// XLSX matters for this job: it always stores UTF-8, whereas CSV exported from Excel
// can silently lose Arabic, Hindi and Chinese unless saved as "CSV UTF-8".

import fs from 'node:fs';
import path from 'node:path';
import { readZip } from './zip.mjs';

export function colName(index) {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function cellRef(row, col) {
  return `${colName(col)}${row + 1}`;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const counts = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;
  for (const ch of firstLine) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch in counts) counts[ch] += 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0
    ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    : ',';
}

export function parseCsv(text, delimiter) {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const delim = delimiter || detectDelimiter(src);
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"' && field === '') {
      quoted = true;
    } else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function decodeXml(s) {
  return s
    .replace(/_x([0-9A-Fa-f]{4})_/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// Text of an <si> or <is> element: plain <t>, or rich text runs <r><t>, ignoring
// phonetic guides (<rPh>) that Excel adds to East Asian text.
function richText(xml) {
  const withoutPhonetic = xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '');
  const parts = [...withoutPhonetic.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g)];
  return parts.map((m) => decodeXml(m[1] || '')).join('');
}

function colIndex(ref) {
  const letters = /^[A-Z]+/.exec(ref)[0];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function readXlsx(buf, sheetName) {
  const files = new Map(readZip(buf).map((e) => [e.name, e.data.toString('utf8')]));
  const workbook = files.get('xl/workbook.xml');
  if (!workbook) throw new Error('Not an XLSX workbook (xl/workbook.xml missing).');
  const rels = files.get('xl/_rels/workbook.xml.rels') || '';
  const targets = new Map([...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => {
    const id = /\bId="([^"]+)"/.exec(m[0]);
    const target = /\bTarget="([^"]+)"/.exec(m[0]);
    return [id && id[1], target && target[1]];
  }));
  const sheets = [...workbook.matchAll(/<sheet\b[^>]*>/g)].map((m) => ({
    name: decodeXml((/\bname="([^"]*)"/.exec(m[0]) || [])[1] || ''),
    rid: (/\br:id="([^"]+)"/.exec(m[0]) || [])[1]
  }));
  if (!sheets.length) throw new Error('The workbook has no sheets.');
  const chosen = sheetName ? sheets.find((s) => s.name === sheetName) : sheets[0];
  if (!chosen) throw new Error(`No sheet named "${sheetName}". Sheets: ${sheets.map((s) => s.name).join(', ')}`);
  let target = targets.get(chosen.rid) || '';
  target = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
  const sheetXml = files.get(target);
  if (!sheetXml) throw new Error(`Sheet file ${target} is missing from the workbook.`);
  const shared = [...(files.get('xl/sharedStrings.xml') || '').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => richText(m[1]));
  const rows = [];
  for (const rowMatch of sheetXml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>|<row\b([^>]*)\/>/g)) {
    const attrs = rowMatch[1] || rowMatch[3] || '';
    const r = Number((/\br="(\d+)"/.exec(attrs) || [])[1] || rows.length + 1) - 1;
    const cells = [];
    for (const cellMatch of (rowMatch[2] || '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const cAttrs = cellMatch[1];
      const inner = cellMatch[2] || '';
      const ref = (/\br="([A-Z]+\d+)"/.exec(cAttrs) || [])[1];
      const type = (/\bt="([^"]+)"/.exec(cAttrs) || [])[1] || 'n';
      const v = (/<v>([\s\S]*?)<\/v>/.exec(inner) || [])[1];
      let value = '';
      if (type === 's') value = v === undefined ? '' : shared[Number(v)] || '';
      else if (type === 'inlineStr') value = richText((/<is>([\s\S]*?)<\/is>/.exec(inner) || [])[1] || '');
      else if (type === 'b') value = v === '1' ? 'TRUE' : v === '0' ? 'FALSE' : '';
      else value = v === undefined ? '' : decodeXml(v);
      const c = ref ? colIndex(ref) : cells.length;
      cells[c] = value;
    }
    for (let i = 0; i < cells.length; i++) if (cells[i] === undefined) cells[i] = '';
    rows[r] = cells;
  }
  for (let i = 0; i < rows.length; i++) if (!rows[i]) rows[i] = [];
  return { sheets: sheets.map((s) => s.name), sheet: chosen.name, rows };
}

export function readSheet(file, { sheet } = {}) {
  const ext = path.extname(file).toLowerCase();
  const buf = fs.readFileSync(file);
  if (ext === '.xlsx') return readXlsx(buf, sheet);
  if (ext === '.xls') throw new Error('Old .xls files are not supported. Save the sheet as .xlsx (or CSV UTF-8) and run again.');
  if (ext === '.csv' || ext === '.tsv' || ext === '.txt') {
    const text = buf.toString('utf8');
    if (text.includes(String.fromCharCode(0xfffd))) {
      throw new Error('This CSV is not valid UTF-8, so non Latin text has been damaged. In Excel use Save As > "CSV UTF-8", or send the .xlsx instead.');
    }
    return { sheets: [path.basename(file)], sheet: path.basename(file), rows: parseCsv(text, ext === '.tsv' ? '\t' : undefined) };
  }
  throw new Error(`Unsupported file type ${ext}. Use .xlsx, .csv or .tsv.`);
}
