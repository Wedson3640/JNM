import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <main className="container-page grid min-h-screen place-items-center py-10">
      <div className="w-full max-w-[34rem]">
        <Link href="/" className="mb-5 inline-flex text-sm font-semibold text-primary hover:text-orange-600">
          Voltar ao site
        </Link>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
