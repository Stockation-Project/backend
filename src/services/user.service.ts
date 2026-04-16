import supabase from "../config/supabase.js";
import {
  createUserInDB,
  UserInsert,
} from "../models/user.model.js";

// Ini data payload yang nanti dikirim frontend
export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
export const registerUserService = async (body: RegisterPayload) => {
  const { first_name, last_name, email, password } = body;

  // ini buat daftarin data auth ke supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Gagal membuat user di autentikasi");
  }

  // gunain id buat masuk ke tabel public.users
  const newUserData: UserInsert = {
    id: authData.user.id,
    first_name,
    last_name,
    email,
  };

  // simpen ke database
  return await createUserInDB(newUserData);
};
