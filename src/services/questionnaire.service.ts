import supabase from "../config/supabase.js";
import { updateUserRiskProfile } from "../models/user.model.js";
import { findOrCreateWallet } from "../models/wallet.model.js";
import { delCache } from "../utils/redis.util.js";
import { determinePersonaFromScore } from "../utils/persona.util.js";


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

  // logic penentuan profile menggunakan utility
  const assignedProfile = determinePersonaFromScore(totalScore);

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