import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 [Forge Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🗄️  DB Health Check: http://localhost:${PORT}/api/v1/health/db`);
});
