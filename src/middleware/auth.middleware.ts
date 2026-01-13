import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error, user: Express.User) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};
