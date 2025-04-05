import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Create a room (both direct and group)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, ownerId } = req.body;
    const room = await prisma.room.create({
      data: {
        name,
        type,
        ownerId,
        participants: {
          create: {
            userId: ownerId
          }
        }
      },
      include: {
        owner: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

// Get all rooms
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        owner: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

// Get specific room
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: true,
        participants: {
          include: {
            user: true
          }
        },
        messages: true
      }
    });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

// Get all participants in a room
router.get('/:id/participants', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const participants = await prisma.roomParticipant.findMany({
      where: { 
        roomId: parseInt(id),
        leftAt: null // Only get active participants
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            lastSeen: true
          }
        }
      }
    });
    
    // Extract just the user information
    const users = participants.map(p => p.user);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

// Add participant to room
router.post('/:id/participants', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const participant = await prisma.roomParticipant.create({
      data: {
        userId,
        roomId: parseInt(id)
      },
      include: {
        user: true,
        room: true
      }
    });
    res.status(201).json(participant);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

export default router;
