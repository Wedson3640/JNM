"use server";

import { createClient } from "@supabase/supabase-js";
import { normalizeAdminProfile, type AdminProfile } from "@/lib/admin-access";

function getProfileWriteErrorMessage(message: string) {
  if (message.includes("schema cache") || message.includes("user_profiles")) {
    return [
      "Tabela de perfis nao encontrada no Supabase.",
      "Execute supabase/migration_user_profiles.sql no SQL Editor e rode NOTIFY pgrst, 'reload schema'; antes de cadastrar novamente.",
      `Detalhe: ${message}`
    ].join(" ");
  }

  return message;
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  profile: AdminProfile
): Promise<{ error?: string; success?: boolean }> {
  const adminProfile = normalizeAdminProfile(profile);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const placeholders = ["COLE_AQUI", "sua-chave", "seu-codigo"];
  if (!supabaseUrl || !serviceKey || placeholders.some((p) => serviceKey.includes(p))) {
    return { error: "Chave do servidor nao configurada. Preencha SUPABASE_SERVICE_ROLE_KEY no .env.local." };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  async function upsertUserProfile(userId: string) {
    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        profile: adminProfile
      },
      { onConflict: "user_id" }
    );

    return profileError;
  }

  async function findUserIdByEmail() {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (error) return null;

    return data.users.find((user) => user.email?.toLowerCase() === normalizedEmail)?.id ?? null;
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        admin_profile: adminProfile,
        perfil: adminProfile
      }
    });

    if (error) {
      if (error.message === "User already registered") {
        const existingUserId = await findUserIdByEmail();

        if (!existingUserId) {
          return { error: "Este e-mail ja esta cadastrado, mas nao foi possivel localizar o usuario para gravar o perfil." };
        }

        const profileError = await upsertUserProfile(existingUserId);

        if (profileError) {
          return { error: `Usuario ja existia, mas o perfil nao foi gravado: ${getProfileWriteErrorMessage(profileError.message)}` };
        }

        return { success: true };
      }

      return { error: error.message };
    }

    if (data.user) {
      const profileError = await upsertUserProfile(data.user.id);

      if (profileError) {
        return { error: `Usuario criado, mas o perfil nao foi gravado: ${getProfileWriteErrorMessage(profileError.message)}` };
      }
    }
  } catch {
    return { error: "Nao foi possivel conectar ao Supabase. Verifique a chave de servico." };
  }

  return { success: true };
}
