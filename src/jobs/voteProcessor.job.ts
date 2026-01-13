import Queue from 'bull';
import Poll from '../models/Poll';
import { emitPollUpdate } from '../services/socket.service';

export const voteQueue = new Queue('vote-processing', process.env.REDIS_URL!);

interface VoteJobData {
  pollId: string;
  optionId: string;
}

voteQueue.process(async (job) => {
  const { pollId, optionId } = job.data as VoteJobData;

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      throw new Error('Option not found');
    }

    option.votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    emitPollUpdate(pollId, poll);

    return { success: true, pollId };
  } catch (error) {
    console.error('Vote processing error:', error);
    throw error;
  }
});

voteQueue.on('completed', (job) => {
  console.log(`Vote job ${job.id} completed`);
});

voteQueue.on('failed', (job, err) => {
  console.error(`Vote job ${job?.id} failed:`, err);
});
