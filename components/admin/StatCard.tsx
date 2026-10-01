type Props = { etiqueta: string; valor: string; detalle?: string };

export default function StatCard({ etiqueta, valor, detalle }: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-neutral-600">{etiqueta}</p>
      <p className="mt-1 text-3xl font-extrabold text-alpha">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-neutral-500">{detalle}</p>}
    </div>
  );
}
