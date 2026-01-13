import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User';
import {
  registerValidation,
  loginValidation,
  validateRequest,
} from '../middleware/validation.middleware';

const router = Router();

const jwtOptions: SignOptions = {
  expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
};

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, jwtOptions);
};

router.post(
  '/register',
  registerValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
        name,
      });

      const token = generateToken(user._id.toString());

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post(
  '/login',
  loginValidation,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'local',
      { session: false },
      (err: Error | null, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        if (!user) {
          return res
            .status(401)
            .json({ error: info?.message || 'Invalid credentials' });
        }

        const token = generateToken(user._id.toString());

        res.json({
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        });
      }
    )(req, res, next);
  }
);

router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      user: {
        id: req.user!._id,
        email: req.user!.email,
        name: req.user!.name,
      },
    });
  }
);

export default router;
