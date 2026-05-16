// src/constants/risk.ts

/**
 * Mapping Profile User (5 jenis persona) ke Cluster ML (3 jenis: Low, Medium, High)
 */
export const USER_TO_ML_RISK_MAPPING: Record<string, string> = {
  lion: "High",       // Singa (Very High)
  wolf: "High",       // Serigala (High)
  capybara: "Medium", // Capybara (Medium)
  hippo: "Low",       // Kuda Nil (Low)
  turtle: "Low",      // Kura Kura (Very Low)
  eagle: "High",      // Fallback untuk profil lama jika ada
};
