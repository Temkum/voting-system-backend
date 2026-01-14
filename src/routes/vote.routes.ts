import { Router, Request, Response } from 'express';
import Poll from '../models/Poll';
import Vote from '../models/Vote';
import { authenticate } from '../middleware/auth.middleware';
import {
  voteValidation,
  validateRequest,
} from '../middleware/validation.middleware';
import { voteQueue } from '../jobs/voteProcessor.job';

const router = Router();

router.post(
  '/:pollId',
  authenticate,
  voteValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user!._id;

    try {
      const poll = await Poll.findById(pollId).select('options');
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      const isValidOption = poll.options.some((opt) => opt.id === optionId);

      if (!isValidOption) {
        return res.status(400).json({ error: 'Invalid option' });
      }

      const hasVoted = await Vote.exists({ userId, pollId });
      if (hasVoted) {
        return res.status(400).json({
          error: 'Already voted on this poll',
        });
      }

      await Vote.create({ userId, pollId, optionId });

      /**
       * Fire-and-forget queue job
       * Voting should succeed even if Redis is temporarily unavailable
       */
      voteQueue
        .add({ pollId, optionId })
        .catch((err) => console.error('Vote queue error:', err));

      return res.status(201).json({ message: 'Vote submitted' });
    } catch (error) {
      console.error('Vote error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get(
  '/:pollId/check',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const hasVoted = await Vote.exists({
        userId: req.user!._id,
        pollId: req.params.pollId,
      });

      return res.json({ hasVoted: !!hasVoted });
    } catch (error) {
      console.error('Check vote error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
