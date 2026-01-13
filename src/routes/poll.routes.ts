import { Router, Request, Response } from 'express';
import Poll from '../models/Poll';
import { authenticate } from '../middleware/auth.middleware';
import {
  pollValidation,
  validateRequest,
} from '../middleware/validation.middleware';
import { emitNewPoll } from '../services/socket.service';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(polls);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/',
  authenticate,
  pollValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { title, options } = req.body;

      const poll = await Poll.create({
        title,
        options: options.map((text: string) => ({
          id: uuidv4(),
          text,
          votes: 0,
        })),
        createdBy: req.user!._id,
        totalVotes: 0,
      });

      await poll.populate('createdBy', 'name email');

      emitNewPoll(poll);

      res.status(201).json(poll);
    } catch (error) {
      console.error('Create poll error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (poll.createdBy.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    poll.isActive = false;
    await poll.save();

    res.json({ message: 'Poll deleted' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
