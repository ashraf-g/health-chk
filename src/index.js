/**
 * Health Check Middleware for Express.js
 *
 * This middleware creates a customizable HTTP GET endpoint that reports the health status
 * of your application. Useful for monitoring, orchestration tools (e.g., Kubernetes),
 * load balancers, and uptime services.
 *
 * Supports static metadata or dynamic async diagnostics (e.g., database checks).
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.path="/health"] - The HTTP route for the health check endpoint
 * @param {Object|Function} [options.info={}] - Static object or async function returning diagnostic data
 * @param {string} [options.status="ok"] - Default health status string (e.g., "ok", "healthy")
 * @param {number} [options.statusCode=200] - HTTP status code when healthy
 * @param {boolean} [options.includeEnv=false] - Include environment variables (filtered) in response
 * @param {string[]} [options.envKeys=[]] - Specific environment keys to include (used only if includeEnv is true)
 *
 * @returns {Function} Express middleware function
 */

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function healthCheck({
  path = "/health",
  info = {},
  status = "ok",
  statusCode = 200,
  includeEnv = false,
  envKeys = [],
} = {}) {
  return async function (req, res, next) {
    // Only handle GET requests to the health path
    if (req.method !== "GET" || req.path !== path) {
      return next();
    }

    try {
      // Uptime and basic info
      const uptime = process.uptime();

      // Allow async or static diagnostic info
      const customInfo = typeof info === "function" ? await info() : info;

      // Build health response
      const healthData = {
        status,
        timestamp: new Date().toISOString(),
        uptime: formatUptime(uptime),
        pid: process.pid,
        memoryUsage: {
          rss: process.memoryUsage().rss,
          heapTotal: process.memoryUsage().heapTotal,
          heapUsed: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external,
        },
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        ...customInfo,
      };

      // Optionally include selected environment variables
      if (includeEnv && Array.isArray(envKeys) && envKeys.length > 0) {
        healthData.env = envKeys.reduce((acc, key) => {
          if (process.env[key] !== undefined) {
            acc[key] = process.env[key];
          }
          return acc;
        }, {});
      }

      res.status(statusCode).json(healthData);
    } catch (error) {
      // Fail-safe response for failing diagnostics
      const isDev = process.env.NODE_ENV !== "production";

      res.status(500).json({
        status: "error",
        message: "Health check failed",
        error: error.message,
        ...(isDev && { stack: error.stack }),
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = healthCheck;
