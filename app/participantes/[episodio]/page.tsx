import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import PreguntaForm from "@/components/portal/PreguntaForm";
import { exigirSesion } from "@/lib/portal/acceso";
import { leerEstados } from "@/lib/portal/episodios";
import { getTema, parseEpisodio } from "@/lib/portal/temas";

export const dynamic = "force-dynamic";

const tarjeta = "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6";

export default async function EpisodioPage({ params }: { params: Promise<{ episodio: string }> }) {
  await exigirSesion();

  const n = parseEpisodio((await params).episodio);
  const tema = n ? getTema(n) : undefined;
  if (!n || !tema) notFound();

  // El bloqueo se valida en el servidor: si no está desbloqueado, no se muestra nada.
  const estados = await leerEstados().catch((err) => {
    console.error("Error al leer el estado de los episodios:", err);
    return null;
  });
  if (!estados) {
    return (
      <PortalShell titulo="Portal de Participantes" conSalir>
        <p role="alert" className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-700 shadow-sm">
          No pudimos cargar el episodio, intenta de nuevo en un momento.
        </p>
      </PortalShell>
    );
  }
  if (!estados.find((e) => e.episodio === n)?.desbloqueado) redirect("/participantes");

  const abiertos = estados.filter((e) => e.desbloqueado).map((e) => e.episodio);
  const anterior = abiertos.filter((e) => e < n).at(-1);
  const siguiente = abiertos.find((e) => e > n);

  return (
    <PortalShell titulo="Portal de Participantes" conSalir>
      <div className="space-y-5">
        <Link href="/participantes" className="inline-block text-sm font-semibold text-alpha hover:underline">
          ← Todos los episodios
        </Link>

        <section className={`${tarjeta} border-2 border-alpha`}>
          <p className="text-sm font-bold uppercase tracking-wide text-alpha">Episodio {n}</p>
          <h2 className="mt-1 text-3xl font-extrabold text-neutral-900">{tema.titulo}</h2>
          <p className="mt-3 text-xl font-semibold italic text-alpha-dark">{tema.pregunta_central}</p>
        </section>

        <section className={tarjeta}>
          <div className="space-y-4 text-base leading-relaxed text-neutral-800">
            {tema.resumen.split(/\n\n+/).map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>
        </section>

        <section className={tarjeta}>
          <h2 className="text-lg font-extrabold text-neutral-900">Puntos clave</h2>
          <ul className="mt-3 space-y-3">
            {tema.puntos_clave.map((p) => (
              <li key={p} className="flex gap-3 text-neutral-800">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-alpha" aria-hidden="true" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={tarjeta}>
          <h2 className="text-lg font-extrabold text-neutral-900">Versículos</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tema.versiculos.map((v) => (
              <li key={v} className="rounded-full bg-alpha-soft px-3.5 py-1.5 text-sm font-bold text-alpha-dark">
                {v}
              </li>
            ))}
          </ul>
        </section>

        <a
          href={`/api/participantes/pdf/${n}`}
          download
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-alpha px-4 py-4 text-lg font-bold text-white shadow-md transition hover:bg-alpha-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
          </svg>
          Descargar PDF del episodio
        </a>

        <section className={tarjeta}>
          <h2 className="text-lg font-extrabold text-neutral-900">¿Tienes una pregunta?</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-600">Escríbela aquí y la respondemos en la siguiente sesión.</p>
          <PreguntaForm episodio={n} />
        </section>

        <nav aria-label="Episodios" className="grid grid-cols-2 gap-3">
          {anterior ? (
            <Link href={`/participantes/${anterior}`} className="rounded-xl border-2 border-alpha px-4 py-3 text-center font-bold text-alpha transition hover:bg-alpha-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha">
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          {siguiente ? (
            <Link href={`/participantes/${siguiente}`} className="col-start-2 rounded-xl border-2 border-alpha px-4 py-3 text-center font-bold text-alpha transition hover:bg-alpha-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha">
              Siguiente →
            </Link>
          ) : null}
        </nav>
      </div>
    </PortalShell>
  );
}
