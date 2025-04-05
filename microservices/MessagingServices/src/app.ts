import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { WebSocketService } from './services/websocket.service';
import { errorHandler } from './middlewares/errorHandler';
import { authenticate } from './middlewares/auth';
import config from './config/config';
import logger from './utils/logger';

// Import routes
import roomRoutes from './routes/room.routes';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize WebSocket service
const wsService = new WebSocketService(io);

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax
}));

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal');
  
  try {
    await wsService.close();
    await prisma.$disconnect();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
