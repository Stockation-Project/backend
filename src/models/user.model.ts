import supabase from "../config/supabase.js";

// interfase buat typescript
export interface UserInsert {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Logic buat ngisi data ke tabel di supabase
export const createUserInDB = async (userData: UserInsert) => {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select();

  if (error) throw error;
  return data[0];
};

