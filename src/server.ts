import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session'; // For session management
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis'; // For Bull, but you can use redis package
import Queue from 'bull';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(
  session({ secret: 'your-secret', resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/voting-app')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Placeholder for routes and more
app.get('/', (req, res) => res.send('Backend is running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
