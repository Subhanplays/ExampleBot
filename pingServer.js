// pingServer.js — zero dependencies, uses only Node built-ins
const http = require('http');

const PORT = process.env.PORT || 3000;

// 👇 Your Render URL (Render sets RENDER_EXTERNAL_URL automatically)
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// ---- Server ----
const server = http.createServer((req, res) => {
    // CORS — lets ANY bot / app call this from anywhere
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const from = url.searchParams.get('from') || 'anonymous';

    // ---- Routes ----

    // Main ping endpoint — anyone can call this
    if (path === '/ping/me' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: 'ok',
            message: 'pong',
            timestamp: Date.now(),
            from
        }));
    }

    // Plain-text ping (simpler bots)
    if (path === '/ping' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('pong');
    }

    // Health check (for uptime monitors)
    if (path === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: 'alive',
            uptime: process.uptime()
        }));
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', path }));
});

// ---- Start ----
server.listen(PORT, () => {
    console.log(`✅ Ping server live on port ${PORT}`);
    console.log(`🌐 Try: ${SELF_URL}/ping/me`);
});

// ---- Keep-alive (prevents Render free tier sleep) ----
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes

setInterval(async () => {
    try {
        const res = await fetch(`${SELF_URL}/ping/me?from=self`);
        const data = await res.json();
        console.log(`[keep-alive] ${new Date().toISOString()} → ${data.message}`);
    } catch (err) {
        console.error('[keep-alive] failed:', err.message);
    }
}, KEEP_ALIVE_INTERVAL);
