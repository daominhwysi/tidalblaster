import Redis from "ioredis";
export const redis_client = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);
