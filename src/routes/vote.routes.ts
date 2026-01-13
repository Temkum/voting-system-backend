import { Router, Request, Response } from 'express';
import Vote from '../models/Vote';
import Poll from '../models/Poll';
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
    try {
      const { pollId } = req.params;
      const { optionId } = req.body;
      const userId = req.user!._id;

      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      const optionExists = poll.options.some((opt) => opt.id === optionId);
      if (!optionExists) {
        return res.status(400).json({ error: 'Invalid option' });
      }

      const existingVote = await Vote.findOne({ userId, pollId });
      if (existingVote) {
        return res.status(400).json({ error: 'Already voted on this poll' });
      }

      await Vote.create({ userId, pollId, optionId });

      await voteQueue.add({ pollId, optionId });

      res.status(201).json({ message: 'Vote submitted' });
    } catch (error) {
      console.error('Vote error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/:pollId/check', authenticate, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      userId: req.user!._id,
      pollId: req.params.pollId,
    });

    res.json({ hasVoted: !!vote });
  } catch (error) {
    console.error('Check vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
