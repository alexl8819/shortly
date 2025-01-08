import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';

import { NAMESPACE } from './constants';

interface RedisConfig {
    url: string,
    token: string
}

function rateLimit (redisConfig: RedisConfig, slidingWindow: number = 10, maxRequests: number = 100) {
    const _redis = new Redis(redisConfig);

    return Object.freeze({
        shouldLimit: async (value: string) => {
            if (!value) {
                throw new Error('Value must be provided');
            }

            value = `${NAMESPACE}_${createHash('SHA256').update(value).digest('hex')}`;

            const getCount: string | null = await _redis.get(value);
            const current: number = getCount ? parseInt(getCount) : 0;

            if (current >= maxRequests) {
                return true;
            }
            
            const pipeline = _redis.pipeline();
            pipeline.incr(value);
            pipeline.expire(value, slidingWindow);
            await pipeline.exec();
            
            return false;
        }
    });
}

export const ratelimiter = rateLimit({
    url: import.meta.env.UPSTASH_REDIS_REST_URL,
    token: import.meta.env.UPSTASH_REDIS_REST_TOKEN
});