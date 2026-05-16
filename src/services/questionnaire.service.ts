import supabase from "../config/supabase.js";
import { updateUserRiskProfile } from "../models/user.model.js";
import { findOrCreateWallet } from "../models/wallet.model.js";
import { delCache } from "../utils/redis.util.js";


export interface QuestionnairePayload {
  answers: number[];
}

export const processQuestionnaireService = async (
  userId: string,
  payload: QuestionnairePayload,
) => {
  const { answers } = payload;

  // validasi jumlah jawaban
  if (!answers || answers.length !== 13) {
    throw new Error("Harus menjawab 13 pertanyaan");
  }

  // hitung total score dari array jawaban
  const totalScore = answers.reduce((sum, current) => sum + Number(current), 0);

  // TAMBAHKAN CONSOLE LOG INI SEMENTARA UNTUK BUKTI:
  console.log("HASIL TOTAL SCORE:", totalScore);
  console.log("TIPE DATANYA:", typeof totalScore);

  // logic penentuan profile
  let assignedProfile = "capybara";

  if (totalScore >= 0 && totalScore <= 18) {
    assignedProfile = "turtle";
  } else if (totalScore >= 19 && totalScore <= 22) {
    assignedProfile = "hippo";
  } else if (totalScore >= 23 && totalScore <= 28) {
    assignedProfile = "capybara";
  } else if (totalScore >= 29 && totalScore <= 32) {
    assignedProfile = "wolf";
  } else if (totalScore >= 33 && totalScore <= 47) {
    assignedProfile = "lion";
  }

  // update profile dan skor user di db
  const updatedUser = await updateUserRiskProfile(userId, assignedProfile, totalScore);

  // isiin dompet user 100jt (safe: skip jika wallet sudah ada — cegah error 500 saat retake)
  const newWallet = await findOrCreateWallet(userId);

  // Hapus cache rekomendasi lama agar langsung update sesuai profil baru
  await delCache(`stocks:recommendations:${userId}`);

  return {

    user: updatedUser,
    newWallet: newWallet,
    score: totalScore,
  };
};