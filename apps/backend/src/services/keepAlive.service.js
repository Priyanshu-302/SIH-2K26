import logger from '../config/logger.js';
import config from '../config/index.js';

let intervalId = null;

/**
 * Initializes an automated self-pinger to prevent cloud free-tier containers
 * (Render, Railway, Fly.io, etc.) from sleeping due to inactivity.
 */
export function startKeepAliveService() {
  // Render automatically provides RENDER_EXTERNAL_URL in production environment
  const targetUrl =
    process.env.KEEP_ALIVE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    null;

  if (!targetUrl) {
    logger.info('Keep-alive self-pinger inactive (no KEEP_ALIVE_URL or RENDER_EXTERNAL_URL specified).');
    return;
  }

  const pingEndpoint = targetUrl.endsWith('/') ? `${targetUrl}ping` : `${targetUrl}/ping`;
  const INTERVAL_MS = 10 * 60 * 1000; // Ping every 10 minutes (Render sleeps after 15 mins)

  logger.info(`🔄 Keep-alive self-pinger initialized for: ${pingEndpoint} (interval: 10m)`);

  // Initial delay of 2 minutes before the first ping
  setTimeout(() => {
    pingServer(pingEndpoint);

    intervalId = setInterval(() => {
      pingServer(pingEndpoint);
    }, INTERVAL_MS);
  }, 2 * 60 * 1000);
}

async function pingServer(url) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      logger.info(`[Keep-Alive] Ping successful to ${url} (Status: ${res.status})`);
    } else {
      logger.warn(`[Keep-Alive] Ping returned status ${res.status} from ${url}`);
    }
  } catch (err) {
    logger.warn(`[Keep-Alive] Ping failed to ${url}: ${err.message}`);
  }
}

export function stopKeepAliveService() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
