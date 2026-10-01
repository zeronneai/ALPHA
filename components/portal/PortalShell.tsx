import Image from "next/image";
import type { ReactNode } from "react";
import SalirButton from "./SalirButton";

type Props = { titulo: string; subtitulo?: string; conSalir?: boolean; ancho?: "md" | "2xl"; children: ReactNode };

export default function PortalShell({ titulo, subtitulo, conSalir = false, ancho = "2xl", children }: Props) {
  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="relative bg-alpha px-4 pb-16 pt-8 text-center text-white">
        {conSalir && (
          <div className="absolute right-3 top-3">
            <SalirButton />
          </div>
        )}
        <Image src="/logo.png" alt="Alpha Jóvenes" width={800} height={722} priority className="mx-auto h-20 w-auto object-contain" />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-white/90">{subtitulo}</p>}
      </header>
      <section className="-mt-10 px-4 pb-12">
        <div className={`mx-auto w-full ${ancho === "2xl" ? "max-w-2xl" : "max-w-md"}`}>{children}</div>
      </section>
    </main>
  );
}
