import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isRedisAvailable = false;

export const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  // Explicit opt-in only
  if (!redisUrl) {
    console.warn('REDIS_URL not set — Redis disabled');
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false, // avoid boot loops
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await redisClient.connect();
    isRedisAvailable = true;
    console.info('Redis connected');
  } catch (err) {
    console.warn('Redis unavailable — continuing without cache');
    redisClient = null;
    isRedisAvailable = false;
  }
};

export { redisClient, isRedisAvailable };
