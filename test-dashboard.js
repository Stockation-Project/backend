import { fetchRecommendedStocksService } from "./src/services/stock.service.js";
import supabase from "./src/config/supabase.js";

async function run() {
  const { data: users } = await supabase.from("users").select("id, risk_profile").not("risk_profile", "is", null).limit(1);
  if (!users || users.length === 0) return;
  const userId = users[0].id;
  console.log("User:", userId, users[0].risk_profile);

  try {
    const data = await fetchRecommendedStocksService(userId);
    console.log("Recommended Prices:", data.recommendations.map(s => s.current_price));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
