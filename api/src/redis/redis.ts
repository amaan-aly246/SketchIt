import Redis from "ioredis";

// Create the Redis instance
const redis = new Redis({
  port: 6379, // Default Redis port
  host: "127.0.0.1", // Localhost
  // This strategy attempts to reconnect if the connection is lost
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Event listeners for debugging
redis.on("connect", () => console.log("🚀 Redis connected successfully"));
redis.on("error", (err) => console.error("❌ Redis connection error:", err));
redis.on("close", () => console.log("Redis server successfully closed "));

export default redis;
