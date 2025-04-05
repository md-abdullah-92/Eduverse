import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        lastSeen: true
      }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

// Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: 'default', // Since we're not using authentication
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        lastSeen: true
      }
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'An error occurred' });
  }
});

export default router;
