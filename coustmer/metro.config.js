const path = require('path');
const http = require('http');
const https = require('https');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Prevent Metro watcher crashes on transient expo-router maven folders (Windows).
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  new RegExp(
    `${path
      .join(__dirname, 'node_modules', '.expo-router-')
      .replace(/[/\\]/g, '[\\\\/]')}.*[\\\\/]local-maven-repo[\\\\/].*`
  ),
];

/**
 * Web-only: proxy API calls through Metro so the browser talks same-origin.
 * Gateway CORS currently rejects Origin http://localhost:* with 500, which
 * makes Expo web login look like a CSRF/network failure. Native apps are fine
 * because they don't send a browser Origin header.
 */
const API_PROXY_TARGET = (
  process.env.EXPO_PUBLIC_API_URL || 'https://api.tokajofoods.com'
).replace(/\/+$/, '');

function shouldProxyApi(url = '') {
  return (
    url.startsWith('/api/') ||
    url === '/api' ||
    url === '/health' ||
    url.startsWith('/health/')
  );
}

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const url = req.url || '';
      if (!shouldProxyApi(url.split('?')[0])) {
        return middleware(req, res, next);
      }

      let target;
      try {
        target = new URL(url, `${API_PROXY_TARGET}/`);
      } catch {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Invalid API proxy target' }));
        return;
      }

      const transport = target.protocol === 'https:' ? https : http;
      const headers = { ...req.headers, host: target.host };
      // Strip browser Origin so gateway CORS allowlist is not hit from localhost.
      delete headers.origin;
      delete headers.Origin;
      // Avoid compressed responses that Node may not decode when piping.
      delete headers['accept-encoding'];

      const proxyReq = transport.request(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port || (target.protocol === 'https:' ? 443 : 80),
          path: `${target.pathname}${target.search}`,
          method: req.method,
          headers,
        },
        (proxyRes) => {
          const outHeaders = { ...proxyRes.headers };
          // Browser is same-origin to Metro; allow credentials locally.
          outHeaders['access-control-allow-origin'] =
            req.headers.origin || 'http://localhost:8081';
          outHeaders['access-control-allow-credentials'] = 'true';
          res.writeHead(proxyRes.statusCode || 502, outHeaders);
          proxyRes.pipe(res);
        }
      );

      proxyReq.on('error', (err) => {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            message: `API proxy failed: ${err.message}`,
          })
        );
      });

      req.pipe(proxyReq);
    };
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
