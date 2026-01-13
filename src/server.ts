import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { connectRedis, redisClient } from './config/redis';
import passport from './config/passport';
import { initializeSocket } from './services/socket.service';
import authRoutes from './routes/auth.routes';
import pollRoutes from './routes/poll.routes';
import voteRoutes from './routes/vote.routes';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1,
      redis: false,
    },
  };

  try {
    await redisClient.ping();
    health.services.redis = true;
  } catch (error) {
    health.services.redis = false;
  }

  const statusCode =
    health.services.mongodb && health.services.redis ? 200 : 503;
  res.status(statusCode).json(health);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
