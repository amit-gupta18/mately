import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import sessionRoutes from './routes/sessionRoutes';
import userRoutes from './routes/userRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { initSocket } from './socket';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

// Socket.io
initSocket(io);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
