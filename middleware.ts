import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { canAccessAdminPath, getAdminProfile, getDefaultAdminPath, normalizeAdminProfile } from "@/lib/admin-access";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return response;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login?config=missing", request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("profile")
    .eq("user_id", user.id)
    .maybeSingle();

  const profile = userProfile?.profile
    ? normalizeAdminProfile(userProfile.profile)
    : getAdminProfile(user.user_metadata);

  if (!canAccessAdminPath(profile, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(getDefaultAdminPath(profile), request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
