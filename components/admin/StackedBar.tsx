export type Segmento = { etiqueta: string; valor: number; fondo: string; texto: string };

type Props = { titulo: string; segmentos: Segmento[] };

/** Barra horizontal apilada con leyenda (cantidad y porcentaje). */
export default function StackedBar({ titulo, segmentos }: Props) {
  const total = segmentos.reduce((s, x) => s + x.valor, 0);
  const pct = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100));
  const resumen = segmentos.map((s) => `${s.etiqueta}: ${s.valor} (${pct(s.valor)}%)`).join(", ");

  return (
    <div>
      <h3 className="mb-2 font-bold text-neutral-900">{titulo}</h3>
      <div role="img" aria-label={`${titulo}. ${resumen}`} className="flex h-9 w-full overflow-hidden rounded-full bg-neutral-100">
        {total > 0 &&
          segmentos
            .filter((s) => s.valor > 0)
            .map((s) => (
              <div
                key={s.etiqueta}
                style={{ width: `${(s.valor / total) * 100}%`, backgroundColor: s.fondo, color: s.texto }}
                className="flex items-center justify-center text-sm font-bold"
              >
                {(s.valor / total) * 100 >= 12 ? `${pct(s.valor)}%` : ""}
              </div>
            ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">
        {segmentos.map((s) => (
          <li key={s.etiqueta} className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border border-neutral-300" style={{ backgroundColor: s.fondo }} aria-hidden="true" />
            {s.etiqueta}: <strong>{s.valor}</strong> ({pct(s.valor)}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
