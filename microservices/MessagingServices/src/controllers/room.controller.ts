import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.service';
import { validateRequest } from '../middlewares/validator';
import { body } from 'express-validator';
import { AppError } from '../middlewares/errorHandler';

const roomService = new RoomService();

export class RoomController {
  public async createDirectRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await validateRequest([
        body('targetUserId').isInt().notEmpty()
      ])(req, res, async () => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(401, 'Unauthorized');
        
        const targetUserId = parseInt(req.body.targetUserId);
        const room = await roomService.createDirectRoom(userId, targetUserId);
        res.status(201).json(room);
      });
    } catch (error) {
      next(error);
    }
  }

  public async createGroupRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await validateRequest([
        body('name').isString().trim().notEmpty(),
        body('participants').isArray().notEmpty()
      ])(req, res, async () => {
        const userId = req.user?.id;
        if (!userId) throw new AppError(401, 'Unauthorized');
        
        const { name, participants } = req.body;
        const room = await roomService.createGroupRoom(name, userId, participants);
        res.status(201).json(room);
      });
    } catch (error) {
      next(error);
    }
  }

  public async getRoomMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roomId = parseInt(req.params.roomId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
      
      const messages = await roomService.getRoomMessages(roomId, limit, cursor);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  public async getUserRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');
      
      const rooms = await roomService.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      next(error);
    }
  }
}
