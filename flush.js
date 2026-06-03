import { createClient } from "redis";
import * as dotenv from "dotenv";
dotenv.config();

const flush = async () => {
  const client = createClient({ url: process.env.REDIS_URL });
  await client.connect();
  console.log("Connected to Redis...");
  await client.flushAll();
  console.log("Redis Cache Flushed Successfully!");
  await client.disconnect();
};

flush().catch(console.error);
