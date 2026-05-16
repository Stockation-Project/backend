import redisClient, { isRedisConnected } from "../config/redis.js";

export { redisClient };


export const getSmartTTL = (): number => {
  const now = new Date();
  
  // Konversi UTC ke WIB (UTC+7)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (3600000 * 7));
  
  const day = wibTime.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const hour = wibTime.getHours();
  
  const isWeekday = day >= 1 && day <= 5;
  const isTradingHour = hour >= 9 && hour < 16; // Antara 09:00 dan 15:59 WIB
  
  if (isWeekday && isTradingHour) {
    return 300; // 5 menit selama jam bursa aktif
  }
  
  return 43200; // 12 jam di luar jam bursa
};

export const getCache = async (key: string) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

export const setCache = async (key: string, ttl: number, data: any) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {}
};

export const delCache = async (key: string) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.del(key);
  } catch (error) {}
};
