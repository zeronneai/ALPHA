import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-alpha px-4 pb-16 pt-8 text-center text-white">
        <Image src="/logo.png" alt="Alpha Jóvenes" width={800} height={722} priority className="mx-auto h-20 w-auto object-contain" />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Panel de administración</h1>
      </header>
      <section className="-mt-10 px-4 pb-12">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
