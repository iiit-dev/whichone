import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import passport from 'passport';
import * as middlewares from './middlewares.js';
import api from './api/index.js';
import './auth/passport.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import socketService from './services/socketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket service
const io = socketService.initialize(server);

// Body parser middleware - ensure this comes before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// Serve the examples directory statically
app.use('/examples', express.static('./src/examples'));

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

// WebSocket stats endpoint
app.get('/api/v1/stats/realtime', (req, res) => {
  const stats = socketService.getRealtimeStats();
  res.json(stats);
});

app.use(passport.initialize());
app.use('/api/v1', api);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export { server };
export default app;
