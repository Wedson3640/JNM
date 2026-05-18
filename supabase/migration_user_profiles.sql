-- ============================================================
-- Migracao: Perfis de acesso da area interna
-- Execute no Supabase SQL Editor
-- ============================================================

DO $$
BEGIN
  CREATE TYPE public.admin_profile AS ENUM (
    'admin',
    'creche',
    'palestras',
    'livraria',
    'servicos'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile    public.admin_profile NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_admin_profile()
RETURNS public.admin_profile
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile FROM public.user_profiles WHERE user_id = auth.uid();
$$;

DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.current_admin_profile() = 'admin'
);

DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.user_profiles;
CREATE POLICY "Admins can manage user profiles"
ON public.user_profiles FOR ALL
TO authenticated
USING (public.current_admin_profile() = 'admin')
WITH CHECK (public.current_admin_profile() = 'admin');

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Atualiza o cache do PostgREST usado pela API REST do Supabase.
NOTIFY pgrst, 'reload schema';
