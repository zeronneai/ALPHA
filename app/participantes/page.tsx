import PortalShell from "@/components/portal/PortalShell";
import EpisodioCard from "@/components/portal/EpisodioCard";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { exigirSesion } from "@/lib/portal/acceso";
import { leerEstados, masReciente, type EstadoEpisodio } from "@/lib/portal/episodios";
import { leerTemas } from "@/lib/portal/temas";
import { WHATSAPP_GROUP_CONFIGURADO, WHATSAPP_GROUP_LINK } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function ParticipantesPage() {
  await exigirSesion();

  const temas = leerTemas();
  let estados: EstadoEpisodio[] | null = null;
  try {
    estados = await leerEstados();
  } catch (err) {
    console.error("Error al leer el estado de los episodios:", err);
  }

  const abierto = new Set((estados ?? []).filter((e) => e.desbloqueado).map((e) => e.episodio));
  const nuevo = estados ? masReciente(estados) : null;
  const tarjeta = (n: number, esNuevo = false) => {
    const t = temas.find((x) => x.episodio === n)!;
    return <EpisodioCard key={n} numero={n} titulo={t.titulo} pregunta={t.pregunta_central} desbloqueado={abierto.has(n)} nuevo={esNuevo} />;
  };

  return (
    <PortalShell titulo="Portal de Participantes" subtitulo="Todo lo que vemos en cada sesión" conSalir>
      {!estados ? (
        <p role="alert" className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-700 shadow-sm">
          No pudimos cargar los episodios, intenta de nuevo en un momento.
        </p>
      ) : (
        <ul className="space-y-3">
          {nuevo !== null && tarjeta(nuevo, true)}
          {temas.filter((t) => t.episodio !== nuevo).map((t) => tarjeta(t.episodio))}
        </ul>
      )}

      {WHATSAPP_GROUP_CONFIGURADO && (
        <a
          href={WHATSAPP_GROUP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#15803D] px-4 py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
        >
          <WhatsAppIcon className="h-7 w-7" />
          Únete al grupo de WhatsApp
        </a>
      )}
    </PortalShell>
  );
}
