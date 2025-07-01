# Express Health Check Middleware

A customizable, production-ready health check middleware for Express.js applications.  
Provides detailed system metrics, application uptime, and optional custom diagnostics (e.g., database status) for monitoring and orchestration tools like **Kubernetes**, **Docker**, **AWS ELB**, etc.

---

## 🚀 Features

- ✅ Simple GET endpoint for health monitoring
- ⏱ Uptime & memory usage reporting
- 🧠 Custom async diagnostics support
- 🔐 Environment-based error reporting
- 📦 Optional environment variable output
- 📊 Ideal for use in container probes and uptime checks

---

## 📦 Installation

```bash
npm install health-chk
```

## 🔧 Usage

```bash
const express = require('express');
const healthCheck = require('./health-chk');

const app = express();

// Optional async diagnostics (e.g., DB check)
async function diagnostics() {
  return {
    database: "connected",
    version: "1.0.0",
    service: "auth-service"
  };
}

app.use(
  healthCheck({
    path: '/healthz',
    info: diagnostics,
    status: 'ok',
    statusCode: 200,
    includeEnv: true,
    envKeys: ['NODE_ENV', 'SERVICE_NAME']
  })
);

app.listen(3000, () => {
  console.log("Health check available at http://localhost:3000/healthz");
});
```

## ⚙️ Options

| Option       | Type                         | Default     | Description                                                       |
| ------------ | ---------------------------- | ----------- | ----------------------------------------------------------------- |
| `path`       | `string`                     | `"/health"` | Route for the health check endpoint                               |
| `info`       | `object` or `async function` | `{}`        | Custom diagnostic metadata or logic (e.g., DB ping)               |
| `status`     | `string`                     | `"ok"`      | Default status message                                            |
| `statusCode` | `number`                     | `200`       | HTTP status code for healthy responses                            |
| `includeEnv` | `boolean`                    | `false`     | Whether to include environment variables in the response          |
| `envKeys`    | `string[]`                   | `[]`        | Environment keys to include (used only if `includeEnv` is `true`) |

## 📘 Sample Response

```bash
{
  "status": "ok",
  "timestamp": "2025-07-01T11:45:30.145Z",
  "uptime": "0h 7m 15s",
  "pid": 12345,
  "memoryUsage": {
    "rss": 32358400,
    "heapTotal": 10944512,
    "heapUsed": 7527680,
    "external": 1258291
  },
  "cpuUsage": {
    "user": 200000,
    "system": 30000
  },
  "nodeVersion": "v20.12.0",
  "platform": "linux",
  "architecture": "x64",
  "database": "connected",
  "version": "1.0.0",
  "service": "auth-service",
  "env": {
    "NODE_ENV": "production",
    "SERVICE_NAME": "auth-service"
  }
}
```

## 🛑 Error Example

```bash
{
  "status": "error",
  "message": "Health check failed",
  "error": "Database timeout",
  "timestamp": "2025-07-01T11:47:00.431Z"
}
```

## 🧪 Best Practices

- Use this endpoint for:
  - Kubernetes **readiness** and **liveness** probes
  - Load balancer **health checks**
  - External **uptime monitoring** (e.g., **Pingdom**, **UptimeRobot**)
- Gracefully degrade by catching errors inside your custom `info()` logic (e.g., when partial systems fail)
- Use **caching** for expensive diagnostics (e.g., database or network calls)

## 🙋‍♂️ Support

Feel free to open issues or submit pull requests!

## 📄 License

Implementation (c) 2025 Gulam Ashraf. [MIT LICENSE](./LICENSE)
