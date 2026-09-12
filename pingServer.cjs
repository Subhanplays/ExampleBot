// pingServer.cjs  — CommonJS version
const http = require('http');

const PORT = process.env.PORT || 3000;
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const server = http.createServer((req, res) => {
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

    if (path === '/ping/me' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: 'ok',
            message: 'pong',
            timestamp: Date.now(),
            from
        }));
    }

    if (path === '/ping' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('pong');
    }

    if (path === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'alive', uptime: process.uptime() }));
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', path }));
});

server.listen(PORT, () => {
    console.log(`✅ Ping server live on port ${PORT}`);
    console.log(`🌐 Try: ${SELF_URL}/ping/me`);
});

const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000;
setInterval(async () => {
    try {
        const res = await fetch(`${SELF_URL}/ping/me?from=self`);
        const data = await res.json();
        console.log(`[keep-alive] ${new Date().toISOString()} → ${data.message}`);
    } catch (err) {
        console.error('[keep-alive] failed:', err.message);
    }
}, KEEP_ALIVE_INTERVAL);
