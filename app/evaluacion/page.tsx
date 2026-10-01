import Link from "next/link";
import EvaluacionShell from "@/components/EvaluacionShell";
import { SESIONES } from "@/lib/sesiones";

export const metadata = { title: "Evaluación | Alpha Jóvenes" };

export default function EvaluacionIndexPage() {
  return (
    <EvaluacionShell titulo="Evaluación" subtitulo="Elige la sesión que quieres evaluar">
      <ul className="grid grid-cols-2 gap-3">
        {SESIONES.map((s) => (
          <li key={s.numero}>
            <Link
              href={`/evaluacion/${s.numero}`}
              className="block rounded-2xl border-2 border-alpha px-3 py-4 text-center text-base font-bold text-alpha transition hover:bg-alpha hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2"
            >
              Sesión {s.numero}
            </Link>
          </li>
        ))}
      </ul>
    </EvaluacionShell>
  );
}
