import { createClient } from "redis";
import * as dotenv from "dotenv";

dotenv.config();

export let isRedisConnected = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: false, // Jangan coba reconnect terus menerus jika Redis mati
  },
});

redisClient.on("error", (err) => {
  // Hanya log sekali saat awal, menghindari spam
  if (isRedisConnected) {
    console.log("Redis Client Error", err);
    isRedisConnected = false;
  }
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
  isRedisConnected = true;
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (error) {
    console.log("Gagal terkoneksi ke Redis. Backend akan tetap berjalan TANPA Caching.");
    isRedisConnected = false;
  }
};

export default redisClient;
