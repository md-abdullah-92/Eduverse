import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get all chats for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        participants: {
          some: {
            userId: parseInt(req.params.userId),
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

    const chats = rooms.map(room => ({
      id: room.id,
      name: room.name,
      type: room.type,
      participants: room.participants.map(p => p.user),
      lastMessage: room.messages[0] || null,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      lastMessageAt: room.lastMessageAt
    }));

    res.json(chats);
  } catch (err) {
    if (err instanceof Error) {
      throw new AppError(500, err.message);
    }
    throw new AppError(500, 'An error occurred while fetching chats');
  }
});

// Send a message
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { content, roomId, senderId, receiverId } = req.body;
    const message = await prisma.message.create({
      data: {
        content,
        roomId,
        senderId,
        receiverId,
        type: 'TEXT',
        status: 'SENT'
      },
      include: {
        sender: true,
        receiver: true,
        room: true
      }
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

// Get all messages in a room
router.get('/messages/room/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        roomId: parseInt(roomId)
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

// Mark message as read
router.patch('/messages/:messageId/read', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await prisma.message.update({
      where: {
        id: parseInt(messageId)
      },
      data: {
        readAt: new Date(),
        status: 'READ'
      }
    });
    res.json(message);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

export default router;
