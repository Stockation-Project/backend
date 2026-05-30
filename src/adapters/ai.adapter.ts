import aiClient from "../config/ai-client.js";
import { updateStockAnomalyStatus } from "../models/stock.model.js";

export const fetchAndMapAIAnomalies = async (
  cleanTicker: string,
  companyName: string,
) => {
  let anomalyHistory = [];
  let aiSummary = "Data analisis AI belum tersedia.";
  let isAnomalyActive = false;

  try {
    const aiResponse = await aiClient.get(`/api/ai/anomalies/${cleanTicker}`);

    if (aiResponse.data && aiResponse.data.success) {
      const rawAnomalies = aiResponse.data.anomalies;

      if (rawAnomalies.length > 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        isAnomalyActive = rawAnomalies.some(
          (anomaly: any) => anomaly.date === todayStr,
        );
        
        // Memanggil fungsi model daripada direct supabase query
        await updateStockAnomalyStatus(cleanTicker, isAnomalyActive);
      }

      const statusMap: Record<string, string> = {
        critical: "Kritis",
        high: "Tinggi",
        medium: "Sedang",
        low: "Rendah",
      };
      const translateType: Record<string, string> = {
        volume_spike: "Lonjakan Volume",
        return_anomaly: "Return Ekstrem",
        price_spike: "Lonjakan Harga",
        gap_up: "Gap Up",
        gap_down: "Gap Down",
      };

      anomalyHistory = rawAnomalies.map((item: any, index: number) => {
        let movement = `Nilai: ${item.value}`;
        if (item.anomaly_type === "volume_spike")
          movement = `Vol: ${item.value.toLocaleString("id-ID")} lot`;
        else if (
          item.anomaly_type.includes("return") ||
          item.anomaly_type.includes("gap")
        )
          movement = `Ret: ${(item.value * 100).toFixed(2)}%`;

        return {
          id: String(index + 1),
          period: item.date,
          price_movement: movement,
          status: `${statusMap[item.severity] || item.severity} (${translateType[item.anomaly_type] || item.anomaly_type})`,
        };
      });

      const criticalCount = rawAnomalies.filter(
        (a: any) => a.severity === "critical",
      ).length;
      aiSummary =
        rawAnomalies.length > 0
          ? `${companyName} terpantau memiliki ${rawAnomalies.length} anomali dalam 1 tahun terakhir, termasuk ${criticalCount} anomali level kritis. Sistem AI merekomendasikan untuk memperhatikan manajemen risiko akibat pergerakan volume dan harga yang fluktuatif ini.`
          : `${companyName} menunjukkan pergerakan yang wajar dan stabil tanpa anomali ekstrem dalam 1 tahun terakhir. Saham ini cenderung aman dari volatilitas mendadak.`;
    }
  } catch (error) {
    console.log(`Gagal menghubungi AI Service untuk ${cleanTicker}.`);
  }

  return { anomalyHistory, aiSummary, isAnomalyActive };
};
