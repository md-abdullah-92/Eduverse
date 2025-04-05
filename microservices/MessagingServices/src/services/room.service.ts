import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export class RoomService {
  public async createDirectRoom(user1Id: number, user2Id: number): Promise<any> {
    try {
      // Check if direct room already exists between these users
      const existingRoom = await prisma.room.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            {
              participants: {
                some: {
                  userId: user1Id,
                  status: 'ACTIVE'
                }
              }
            },
            {
              participants: {
                some: {
                  userId: user2Id,
                  status: 'ACTIVE'
                }
              }
            }
          ]
        },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      if (existingRoom) {
        return existingRoom;
      }

      // Create new direct room
      const room = await prisma.room.create({
        data: {
          type: 'DIRECT',
          ownerId: user1Id,
          participants: {
            create: [
              { userId: user1Id },
              { userId: user2Id }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      logger.info(`Direct room created between users ${user1Id} and ${user2Id}`);
      return room;
    } catch (error) {
      logger.error('Error creating direct room:', error);
      throw new AppError(500, 'Failed to create direct room');
    }
  }

  public async createGroupRoom(name: string, ownerId: number, participantIds: number[]): Promise<any> {
    try {
      const room = await prisma.room.create({
        data: {
          name,
          type: 'GROUP',
          ownerId,
          participants: {
            create: participantIds.map(userId => ({ userId }))
          }
        },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      logger.info(`Group room "${name}" created by user ${ownerId}`);
      return room;
    } catch (error) {
      logger.error('Error creating group room:', error);
      throw new AppError(500, 'Failed to create group room');
    }
  }

  public async getRoomMessages(roomId: number, limit: number = 50, cursor?: number): Promise<any> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          roomId
        },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          sender: true
        }
      });

      return messages;
    } catch (error) {
      logger.error('Error fetching room messages:', error);
      throw new AppError(500, 'Failed to fetch room messages');
    }
  }

  public async getUserRooms(userId: number): Promise<any> {
    try {
      const rooms = await prisma.room.findMany({
        where: {
          participants: {
            some: {
              userId,
              status: 'ACTIVE'
            }
          }
        },
        include: {
          participants: {
            include: {
              user: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              sender: true
            }
          }
        }
      });

      return rooms.map(room => ({
        ...room,
        lastMessage: room.messages[0] || null
      }));
    } catch (error) {
      logger.error('Error fetching user rooms:', error);
      throw new AppError(500, 'Failed to fetch user rooms');
    }
  }
}
