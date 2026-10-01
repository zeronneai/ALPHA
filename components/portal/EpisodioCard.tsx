import Link from "next/link";

type Props = { numero: number; titulo: string; pregunta: string; desbloqueado: boolean; nuevo?: boolean };

function Candado() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  );
}

export default function EpisodioCard({ numero, titulo, pregunta, desbloqueado, nuevo = false }: Props) {
  if (!desbloqueado) {
    return (
      <li className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-100 p-4 text-neutral-500" aria-label={`Episodio ${numero}, bloqueado`}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-lg font-extrabold text-neutral-500">{numero}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold text-neutral-600">{titulo}</h2>
          <p className="text-sm italic">{pregunta}</p>
          <p className="mt-1 text-xs font-semibold">Se desbloquea en la sesión</p>
        </div>
        <Candado />
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/participantes/${numero}`}
        className={`flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:border-alpha hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 ${
          nuevo ? "border-2 border-alpha p-5" : "border border-neutral-200"
        }`}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-alpha text-lg font-extrabold text-white">{numero}</span>
        <div className="min-w-0 flex-1">
          {nuevo && <span className="mb-1 inline-block rounded-full bg-alpha px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white">Lo más nuevo</span>}
          <h2 className="text-lg font-extrabold text-neutral-900">{titulo}</h2>
          <p className="text-sm italic text-neutral-600">{pregunta}</p>
        </div>
        <span className="text-2xl font-bold text-alpha" aria-hidden="true">
          ›
        </span>
      </Link>
    </li>
  );
}
