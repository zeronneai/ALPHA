"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Punto = { sesion: string; asistentes: number | null };

export default function AsistenciaChart({ datos }: { datos: Punto[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Gráfica de línea de asistencia por sesión">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="sesion" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [v as number, "Asistentes"]} />
          <Line type="monotone" dataKey="asistentes" stroke="#D7141A" strokeWidth={3} dot={{ r: 4, fill: "#D7141A" }} connectNulls={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
