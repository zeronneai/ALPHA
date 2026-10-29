export type SegmentoDona = { etiqueta: string; valor: number; color: string };

type Props = {
  segmentos: SegmentoDona[];
  /** Texto grande al centro (ej. la calificación). */
  centro: string;
  /** Texto chico debajo del centro. */
  subcentro?: string;
  tamano?: number;
  titulo: string;
};

/** Gráfica de dona en SVG puro (sin librerías). */
export default function Dona({ segmentos, centro, subcentro, tamano = 140, titulo }: Props) {
  const total = segmentos.reduce((s, x) => s + x.valor, 0);
  const grosor = tamano * 0.14;
  const r = (tamano - grosor) / 2;
  const circ = 2 * Math.PI * r;
  const pct = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100));
  const resumen = segmentos.map((s) => `${s.etiqueta}: ${s.valor} (${pct(s.valor)}%)`).join(", ");

  let acumulado = 0;
  const arcos = segmentos
    .filter((s) => s.valor > 0)
    .map((s) => {
      const largo = (s.valor / total) * circ;
      const arco = { ...s, largo, desfase: -acumulado };
      acumulado += largo;
      return arco;
    });

  return (
    <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" aria-label={`${titulo}. ${resumen}`}>
      <circle cx={tamano / 2} cy={tamano / 2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={grosor} />
      <g transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}>
        {arcos.map((a) => (
          <circle
            key={a.etiqueta}
            cx={tamano / 2}
            cy={tamano / 2}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={grosor}
            strokeDasharray={`${a.largo} ${circ - a.largo}`}
            strokeDashoffset={a.desfase}
          />
        ))}
      </g>
      <text x="50%" y={subcentro ? "47%" : "50%"} textAnchor="middle" dominantBaseline="middle" fontSize={tamano * 0.22} fontWeight={800} fill="#171717">
        {centro}
      </text>
      {subcentro && (
        <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle" fontSize={tamano * 0.085} fill="#737373">
          {subcentro}
        </text>
      )}
    </svg>
  );
}

export const COLORES = { mal: "#404040", bien: "#F4A6A9", super: "#D7141A" } as const;

export function segmentosValoracion(c: { mal: number; bien: number; super: number }): SegmentoDona[] {
  return [
    { etiqueta: "Mal", valor: c.mal, color: COLORES.mal },
    { etiqueta: "Bien", valor: c.bien, color: COLORES.bien },
    { etiqueta: "Súper", valor: c.super, color: COLORES.super },
  ];
}

export function Leyenda({ segmentos }: { segmentos: SegmentoDona[] }) {
  const total = segmentos.reduce((s, x) => s + x.valor, 0);
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-neutral-700">
      {segmentos.map((s) => (
        <li key={s.etiqueta} className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
          {s.etiqueta} <strong>{s.valor}</strong>
          <span className="text-neutral-500">({total === 0 ? 0 : Math.round((s.valor / total) * 100)}%)</span>
        </li>
      ))}
    </ul>
  );
}
