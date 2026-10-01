import Link from "next/link";

export default function SesionInvalida({ volverA }: { volverA: string }) {
  return (
    <div className="py-12 text-center" role="alert">
      <h1 className="text-2xl font-extrabold text-neutral-900">Esa sesión no existe</h1>
      <p className="mt-2 text-neutral-600">Las sesiones van del 1 al 10.</p>
      <Link href={volverA} className="mt-6 inline-block rounded-xl bg-alpha px-6 py-3 font-bold text-white hover:bg-alpha-dark">
        Volver
      </Link>
    </div>
  );
}
