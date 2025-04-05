import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class WebSocketService {
  private io: Server;
  private connectedUsers: Map<number, Socket>;

  constructor(io: Server) {
    this.io = io;
    this.connectedUsers = new Map();
    this.initialize();
  }

  public initialize(): void {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  public async close(): Promise<void> {
    this.io.close();
    for (const [userId, socket] of this.connectedUsers) {
      await this.handleDisconnect(socket);
    }
  }

  private async handleConnection(socket: Socket): Promise<void> {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    try {
      // Update user status to online
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { 
          status: 'ONLINE',
          lastSeen: new Date()
        }
      });

      this.connectedUsers.set(parseInt(userId), socket);
      socket.on('disconnect', () => this.handleDisconnect(socket));

      // Handle messages
      socket.on('message', async (data: { roomId: number; content: string }) => {
        try {
          const message = await prisma.message.create({
            data: {
              content: data.content,
              roomId: data.roomId,
              senderId: parseInt(userId)
            },
            include: {
              sender: true
            }
          });

          this.io.to(`room:${data.roomId}`).emit('message', message);
        } catch (error) {
          logger.error('Error handling message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Join rooms
      const userRooms = await prisma.room.findMany({
        where: {
          participants: {
            some: {
              id: parseInt(userId)
            }
          }
        }
      });

      userRooms.forEach(room => {
        socket.join(`room:${room.id}`);
      });

    } catch (error) {
      logger.error('Error in handleConnection:', error);
      socket.disconnect();
    }
  }

  private async handleDisconnect(socket: Socket): Promise<void> {
    const userId = socket.handshake.auth.userId;
    if (!userId) return;

    try {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { 
          status: 'OFFLINE',
          lastSeen: new Date()
        }
      });

      this.connectedUsers.delete(parseInt(userId));
    } catch (error) {
      logger.error('Error in handleDisconnect:', error);
    }
  }
}
