const redis = require('ioredis');

// Initialize Redis connection with error handling
const redisClient = new redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // Silent mode - won't crash the server if Redis not available
    lazyConnect: true
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
    console.log('⚠️  Redis Connection Warning - Cache disabled:', err.message);
    isRedisConnected = false;
});

redisClient.on('connect', () => {
    console.log('✅ Redis Client Connected');
    isRedisConnected = true;
});

// Try to connect (non-blocking)
redisClient.connect().catch(err => {
    console.log('⚠️  Could not connect to Redis. Running without caching.');
    isRedisConnected = false;
});

// Cache key constants
const CACHE_KEYS = {
    RESTAURANTS: 'restaurants:all',
    RESTAURANT: (id) => `restaurant:${id}`,
    FOODS: (restaurantId) => `foods:restaurant:${restaurantId}`,
    FOOD: (id) => `food:${id}`,
    BANNERS: 'banners:all',
    CATEGORIES: 'categories:all',
    COUPONS: 'coupons:all',
};

// Cache TTL (in seconds)
const CACHE_TTL = {
    RESTAURANTS: 600, // 10 minutes
    FOODS: 300, // 5 minutes
    BANNERS: 1800, // 30 minutes
    CATEGORIES: 3600, // 1 hour
    COUPONS: 600, // 10 minutes
};

// Get from cache (with fallback if Redis unavailable)
const getCache = async (key) => {
    if (!isRedisConnected) return null;
    try {
        const data = await redisClient.get(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Cache get error:', error.message);
        return null;
    }
};

// Set to cache (with fallback if Redis unavailable)
const setCache = async (key, data, ttl = 300) => {
    if (!isRedisConnected) return;
    try {
        await redisClient.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
        console.error('Cache set error:', error.message);
    }
};

// Delete cache
const deleteCache = async (key) => {
    if (!isRedisConnected) return;
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Cache delete error:', error.message);
    }
};

// Delete multiple cache keys by pattern
const deleteCacheByPattern = async (pattern) => {
    if (!isRedisConnected) return;
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    } catch (error) {
        console.error('Cache delete pattern error:', error.message);
    }
};

// Flush all cache
const flushCache = async () => {
    if (!isRedisConnected) return;
    try {
        await redisClient.flushdb();
    } catch (error) {
        console.error('Cache flush error:', error.message);
    }
};

module.exports = {
    redisClient,
    getCache,
    setCache,
    deleteCache,
    deleteCacheByPattern,
    flushCache,
    CACHE_KEYS,
    CACHE_TTL
};
