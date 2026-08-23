import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Base Route
app.use('/api/v1', apiRouter);

export default app;
