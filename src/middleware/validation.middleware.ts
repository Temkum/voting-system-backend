import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
];

export const pollValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('options').isArray({ min: 2, max: 10 }),
  body('options.*').trim().isLength({ min: 1, max: 100 }),
];

export const voteValidation = [body('optionId').isString().trim().notEmpty()];
