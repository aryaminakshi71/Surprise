import Redis from 'ioredis';

class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  connect() {
    if (this.client) return this.client;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.isConnected = false;
    });

    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) this.connect();
      const data = await this.client!.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (!this.isConnected) this.connect();
      await this.client!.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!this.isConnected) this.connect();
      await this.client!.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      if (!this.isConnected) this.connect();
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
    } catch (error) {
      console.error('Cache deletePattern error:', error);
    }
  }

  async invalidatePattern(prefix: string): Promise<void> {
    await this.deletePattern(`${prefix}:*`);
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const data = await fetchFn();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

export const cache = new RedisCache();

export function withCache<T>(
  key: string,
  ttlSeconds: number = 300
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = typeof key === 'function' 
        ? key(...args) 
        : `${propertyKey}:${args.join(':')}`;

      const cached = await cache.get<T>(cacheKey);
      if (cached) return cached;

      const result = await originalMethod.apply(this, args);
      await cache.set(cacheKey, result, ttlSeconds);
      return result;
    };

    return descriptor;
  };
}
