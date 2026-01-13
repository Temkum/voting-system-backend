import { createClient } from 'redis';

let redisClient: any = null;
let isRedisAvailable = false;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const initRedis = async () => {
  try {
    redisClient = createClient({
      url: redisUrl,
    });

    await redisClient.connect();
    isRedisAvailable = true;
    console.log('Redis Connected');
  } catch (error) {
    if (error instanceof Error) {
      console.warn('Redis unavailable - running without cache:', error.message);
    } else {
      console.warn('Redis unavailable - running without cache:', error);
    }
    isRedisAvailable = false;
  }
};

export const connectRedis = initRedis;
export { redisClient, isRedisAvailable };
