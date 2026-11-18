const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const GH_TOKEN = process.env['FFX-G'] || process.env.FFX_G || '';
const GH_REPO = (process.env['FFX-REPO'] || process.env.FFX_REPO || process.env.RENDER_GIT_REPO_SLUG || '').trim();
const GH_BRANCH = (process.env['FFX-BRANCH'] || process.env.FFX_BRANCH || 'ffx-data').trim();
const GH_API = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
const GH_DIR = 'ffx-data';
const USE_GH = !!GH_TOKEN;

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const ADMIN_PASSWORD = process.env['FFX-PASS'] || process.env.FFX_PASS || '';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT_DIR, 'data'));
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
};

const BLOCKED_NAMES = new Set(['server.js', 'package.json', 'package-lock.json', 'admin.html']);

const DEFAULT_PACKAGES = [
  { label: '200 FF LIKE- প্রতিদিন ১ আইডিতে ১বার', name: '200 FF LIKE', price: 30 },
  { label: '3000 FF LIKE- 15 দিন এ পাবেন', name: '3000 FF LIKE', price: 450 },
  { label: '6000 FF LIKE- 30 দিন এ পাবেন', name: '6000 FF LIKE', price: 900 },
  { label: '12000 FF LIKE- 60 দিন এ পাবেন', name: '12000 FF LIKE', price: 1800 }
];

const DEFAULT_BANNERS = ['default:Banner 1.jpg', 'default:Banner 2.jpg', 'default:Banner 3.jpg'];
const DEFAULT_QUICK = [
  { label: 'Telegram', url: '' },
  { label: 'Join Group', url: '' },
  { label: 'YouTube', url: '' }
];
const MAX_BANNERS = 10;

const PRODUCTS = [
  { key: 'ff',  view: 'ffView',  hash: 'ff-likes',         grid: 'pkGrid',    img: 'ffBanner' },
  { key: 'uid', view: 'uidView', hash: 'uid-topup',        grid: 'uidPkGrid', img: 'uid' },
  { key: 'wm',  view: 'wmView',  hash: 'weekly-monthly',   grid: 'wmPkGrid',  img: 'wm' },
  { key: 'wl',  view: 'wlView',  hash: 'weekly-lite',      grid: 'wlPkGrid',  img: 'wl' },
  { key: 'lu',  view: 'luView',  hash: 'level-up-pass',    grid: 'luPkGrid',  img: 'lu' },
  { key: 'in',  view: 'inView',  hash: 'indonesia-server', grid: 'inPkGrid',  img: 'in' },
  { key: 'uc',  view: 'ucView',  hash: 'uid-checker',      grid: null,        img: 'uc' }
];

const IMAGES = {
  logo:     { file: 'Main logo.jpg',          prefix: 'logo' },
  ffBanner: { file: 'FF LIKES.jpg',           prefix: 'ff-banner' },
  uid:      { file: 'UID TOPUP (BD).jpg',     prefix: 'img-uid' },
  wm:       { file: 'WEEKLYMONTHLY.jpg',      prefix: 'img-wm' },
  wl:       { file: 'WEEKLY LITE.jpg',        prefix: 'img-wl' },
  lu:       { file: 'LEVEL UP PASS.jpg',      prefix: 'img-lu' },
  in:       { file: 'INDONESIA SERVER.jpg',   prefix: 'img-in' },
  uc:       { file: 'uid checker.jpg',        prefix: 'img-uc' },
  pop:      { file: 'Notification.jpg',       prefix: 'img-pop' }
};
const IMG_KEYS = Object.keys(IMAGES);

const TEXTS = [
  { id: 'siteName', label: 'Website name', def: 'Nickname', max: 40 },
  { id: 'sec1', label: 'Home section title (top)', def: 'FREE FIRE TOPUP', max: 60, wrap: ['<em>', '</em>'] },
  { id: 'sec2', label: 'Home section title (UID Checker)', def: 'UID CHECKER', max: 60, wrap: ['<em>', '</em>'] },
  { id: 'pop', label: 'Popup message', def: 'সবথেকে কম দামে টপ করার জন্য সেরা ওয়েবসাইট\n১০০% বিশ্বস্ত ও দ্রুত ডেলিভারিতে\nঅর্ডার করুন নিশ্চিন্তে 🥰', max: 400, multi: true },
  { id: 'hours', label: 'Support hours', def: 'সকাল ৮টা থেকে রাত ১২টা', max: 60 },
  { id: 'warn', label: 'Footer warning', def: '১৮ বছরের নিচে অভিভাবকের অনুমতি ছাড়া অর্ডার করা সম্পূর্ণ নিষিদ্ধ।', max: 300, multi: true },
  { id: 'dlTitle', label: 'App download title', def: 'DOWNLOAD OUR MOBILE APP', max: 60 },
  { id: 'playUrl', label: 'Google Play link', def: '', max: 300, url: true }
];

function emptyCfg() { return { logo: null, ffBanner: null, banners: null, quick: null, images: null, prod: null, texts: null }; }
let config = emptyCfg();
function imgGet(c, k) { return (k === 'logo' || k === 'ffBanner') ? c[k] : ((c.images && c.images[k]) || null); }
function imgSet(next, k, v) {
  if (k === 'logo' || k === 'ffBanner') { next[k] = v; return; }
  const m = Object.assign({}, next.images || {});
  if (v) m[k] = v; else delete m[k];
  next.images = Object.keys(m).length ? m : null;
}
function uploadedFiles(c) {
  const out = [c.logo, c.ffBanner].concat(Array.isArray(c.banners) ? c.banners : []);
  if (c.images && typeof c.images === 'object') Object.keys(c.images).forEach(function (k) { out.push(c.images[k]); });
  return out.filter(isUploaded);
}
let renderCache = null;
let cfgVersion = 0;

const SAFE_FILE = /^[a-z0-9._-]+$/i;

function loadLocal() {
  config = emptyCfg();
  try {
    const j = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (typeof j.logo === 'string' && SAFE_FILE.test(j.logo) && fs.existsSync(path.join(UPLOAD_DIR, j.logo))) config.logo = j.logo;
    if (typeof j.ffBanner === 'string' && SAFE_FILE.test(j.ffBanner) && fs.existsSync(path.join(UPLOAD_DIR, j.ffBanner))) config.ffBanner = j.ffBanner;
    if (j.images && typeof j.images === 'object') {
      const im = {};
      IMG_KEYS.forEach(function (k) {
        const n = j.images[k];
        if (k !== 'logo' && k !== 'ffBanner' && typeof n === 'string' && SAFE_FILE.test(n) && fs.existsSync(path.join(UPLOAD_DIR, n))) im[k] = n;
      });
      if (Object.keys(im).length) config.images = im;
    }
  } catch (e) {}
  cfgVersion++;
  renderCache = null;
}

function writeLocalConfig(obj) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const tmp = CONFIG_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, CONFIG_FILE);
}

const storage = { mode: USE_GH ? 'github' : 'local', ok: !USE_GH, error: null, repo: GH_REPO, branch: GH_BRANCH };
loadLocal();

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit) {
  return new Promise(function (resolve, reject) {
    let size = 0; const chunks = [];
    req.on('data', function (c) {
      size += c.length;
      if (size > limit) { reject(new Error('too_large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', function () { resolve(Buffer.concat(chunks).toString('utf8')); });
    req.on('error', reject);
  });
}

async function readJson(req, limit) {
  const txt = await readBody(req, limit || 64 * 1024);
  try { return JSON.parse(txt || '{}'); } catch (e) { throw new Error('bad_json'); }
}

const server = http.createServer(async function (req, res) {
  const parsedUrl = new URL(req.url, 'http://' + req.headers.host);
  const pathname = parsedUrl.pathname;

  // ==========================================
  // অটো পেমেন্ট SMS রিসিভ করার জন্য এপিআই এন্ডপয়েন্ট
  // ==========================================
  if (req.method === 'POST' && pathname === '/api/receive_sms') {
    try {
      const body = await readJson(req, 1024);
      const sender = body.sender || '';
      const message = body.message || '';
      const trx_id = body.trx_id || '';
      const amount = parseFloat(body.amount || 0);

      if (!trx_id || amount <= 0) {
        return sendJson(res, 400, { status: "error", message: "Invalid transaction data" });
      }

      // এখানে আপনার অ্যাপস থেকে পাঠানো ট্রানজেকশন আইডি এবং অ্যামাউন্ট যাচাই করে ব্যালেন্স অটো অ্যাড করার লজিক কাজ করবে।
      // উদাহরণস্বরূপ সফল রেসপন্স:
      console.log(`Auto Payment Received -> TrxID: ${trx_id}, Amount: ${amount}, Gateway: ${sender}`);

      return sendJson(res, 200, { status: "success", message: "Balance added successfully via auto SMS" });
    } catch (err) {
      return sendJson(res, 500, { status: "error", message: err.message });
    }
  }

  // সাধারণ স্ট্যাটিক ফাইল সার্ভ করার অংশ
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'FFX.html' : pathname);
  if (pathname.startsWith('/uploads/')) {
    filePath = path.join(DATA_DIR, pathname);
  }

  fs.stat(filePath, function (err, stats) {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
