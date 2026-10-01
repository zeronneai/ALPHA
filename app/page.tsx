import Image from "next/image";
import RegistroForm from "@/components/RegistroForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-alpha px-4 pb-16 pt-8 text-center text-white">
        <Image
          src="/logo.png"
          alt="Alpha Jóvenes"
          width={160}
          height={80}
          priority
          className="mx-auto h-20 w-auto object-contain"
        />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Alpha Jóvenes</h1>
        <p className="mt-1 text-sm text-white/90">Regístrate y sé parte del grupo</p>
      </header>

      <section className="-mt-10 px-4 pb-12">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
          <RegistroForm />
        </div>
      </section>
    </main>
  );
}
