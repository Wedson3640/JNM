"use server";

import { createClient } from "@supabase/supabase-js";

export async function registerUser(
  email: string,
  password: string,
  code: string,
  displayName: string
): Promise<{ error?: string; success?: boolean }> {
  if (!process.env.REGISTER_CODE || code !== process.env.REGISTER_CODE) {
    return { error: "Código de acesso inválido." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const placeholders = ["COLE_AQUI", "sua-chave", "seu-codigo"];
  if (!supabaseUrl || !serviceKey || placeholders.some((p) => serviceKey.includes(p))) {
    return { error: "Chave do servidor não configurada. Preencha SUPABASE_SERVICE_ROLE_KEY no .env.local." };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName }
    });

    if (error) {
      return { error: error.message === "User already registered" ? "Este e-mail já está cadastrado." : error.message };
    }
  } catch {
    return { error: "Não foi possível conectar ao Supabase. Verifique a chave de serviço." };
  }

  return { success: true };
}
