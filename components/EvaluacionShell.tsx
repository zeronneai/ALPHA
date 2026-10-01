import Image from "next/image";
import type { ReactNode } from "react";

type Props = { titulo: string; subtitulo?: string; children: ReactNode; ancho?: "md" | "2xl" };

export default function EvaluacionShell({ titulo, subtitulo, children, ancho = "md" }: Props) {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-alpha px-4 pb-16 pt-8 text-center text-white">
        <Image
          src="/logo.png"
          alt="Alpha Jóvenes"
          width={800}
          height={722}
          priority
          className="mx-auto h-20 w-auto object-contain"
        />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-white/90">{subtitulo}</p>}
      </header>
      <section className="-mt-10 px-4 pb-12">
        <div
          className={`mx-auto w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8 ${
            ancho === "2xl" ? "max-w-2xl" : "max-w-md"
          }`}
        >
          {children}
        </div>
      </section>
    </main>
  );
}
