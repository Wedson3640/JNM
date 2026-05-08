import { RegisterForm } from "@/components/admin/register-form";

export const metadata = {
  title: "Cadastro",
  robots: { index: false, follow: false }
};

export default function RegisterPage() {
  return (
    <main className="container-page grid min-h-screen place-items-center py-10">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}
