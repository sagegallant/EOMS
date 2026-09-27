import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60_000, max: 20 }));

app.use('/api/v1', apiRouter);
app.use(errorHandler); // → { code, message } JSON; 500s audited

import { fileURLToPath } from 'url';

const PORT = process.env.PORT ?? 5000;

function startServer(port) {
  const server = app.listen(port, () => console.log(`✔ EOMS API ready on port ${port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${port} is already in use by another process.`);
      console.error(`To free port ${port} on Windows, run:\n  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess -Force\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
  return server;
}

const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url) === process.argv[1] ||
  process.argv[1].endsWith('app.js')
);

import { startSlaScheduler } from './services/sla.service.js';

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      startServer(PORT);
      startSlaScheduler();
    })
    .catch(err => {
      console.error('DB connection failed:', err.message);
      // In dev without running DB, still start server for testing if needed
      if (process.env.NODE_ENV === 'development') {
        startServer(PORT);
      } else {
        process.exit(1);
      }
    });
}


export default app;
