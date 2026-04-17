import { updateUserRiskProfile } from "../models/user.model.js";
import { createWallet } from "../models/wallet.model.js";

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
  const totalScore = answers.reduce((sum, current) => sum + current, 0);

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

  // update profile user di db
  const updatedUser = await updateUserRiskProfile(userId, assignedProfile);

  // isiin dompet user 100jt
  const newWallet = await createWallet(userId);

  return {
    user: updatedUser,
    newWallet: newWallet,
    score: totalScore,
  };
};
