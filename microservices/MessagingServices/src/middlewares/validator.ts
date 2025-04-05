import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction, callback?: () => Promise<void>): Promise<void> => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, 'Validation failed');
      }

      if (callback) {
        await callback();
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};
