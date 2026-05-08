"use server";

import { createClient } from "@supabase/supabase-js";

export async function registerUser(
  email: string,
  password: string,
  code: string
): Promise<{ error?: string; success?: boolean }> {
  if (!process.env.REGISTER_CODE || code !== process.env.REGISTER_CODE) {
    return { error: "Código de acesso inválido." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Configuração do servidor incompleta." };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    return { error: error.message === "User already registered" ? "Este e-mail já está cadastrado." : error.message };
  }

  return { success: true };
}
