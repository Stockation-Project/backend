// src/utils/persona.util.ts

/**
 * Menentukan profil risiko berdasarkan total skor kuesioner
 * @param totalScore Skor total dari jawaban kuesioner
 * @returns Nama persona (turtle, hippo, capybara, wolf, lion)
 */
export const determinePersonaFromScore = (totalScore: number): string => {
  if (totalScore >= 0 && totalScore <= 18) {
    return "turtle";
  } else if (totalScore >= 19 && totalScore <= 22) {
    return "hippo";
  } else if (totalScore >= 23 && totalScore <= 28) {
    return "capybara";
  } else if (totalScore >= 29 && totalScore <= 32) {
    return "wolf";
  } else if (totalScore >= 33 && totalScore <= 47) {
    return "lion";
  }
  return "capybara"; // Fallback
};
