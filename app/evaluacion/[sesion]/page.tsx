import Link from "next/link";
import EvaluacionShell from "@/components/EvaluacionShell";
import EvaluacionForm from "@/components/EvaluacionForm";
import { getSesion } from "@/lib/sesiones";

type Props = { params: Promise<{ sesion: string }> };

export const metadata = { title: "Evaluación | Alpha Jóvenes" };

export default async function EvaluacionSesionPage({ params }: Props) {
  const { sesion: valor } = await params;
  const sesion = getSesion(valor);

  if (!sesion) {
    return (
      <EvaluacionShell titulo="Evaluación">
        <div className="py-4 text-center" role="alert">
          <p className="text-4xl" aria-hidden="true">
            🤔
          </p>
          <h2 className="mt-3 text-xl font-extrabold text-neutral-900">Esa sesión no existe</h2>
          <p className="mt-2 text-neutral-600">Las sesiones van del 1 al 10.</p>
          <Link
            href="/evaluacion"
            className="mt-6 block w-full rounded-xl bg-alpha px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-alpha-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2"
          >
            Elegir una sesión
          </Link>
        </div>
      </EvaluacionShell>
    );
  }

  return (
    <EvaluacionShell titulo={`Evaluación · Sesión ${sesion.numero}`}>
      <EvaluacionForm sesion={sesion.numero} titulo={sesion.titulo} />
    </EvaluacionShell>
  );
}
