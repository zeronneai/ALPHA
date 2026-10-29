"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

type Punto = { sesion: string; calificacion: number | null; volvera: number | null };

/** Evolución de la calificación general y del % que volverá, sesión por sesión. */
export default function CalificacionChart({ datos }: { datos: Punto[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Línea de calificación general y porcentaje que volverá por sesión">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 16, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis dataKey="sesion" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="calificacion" name="Calificación" stroke="#D7141A" strokeWidth={3} dot={{ r: 5 }} connectNulls />
          <Line type="monotone" dataKey="volvera" name="% volverá" stroke="#404040" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 4 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
