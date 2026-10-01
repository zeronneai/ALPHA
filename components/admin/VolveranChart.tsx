"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Punto = { sesion: string; pct: number | null };

export default function VolveranChart({ datos }: { datos: Punto[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Gráfica de barras del porcentaje que volverá por sesión">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 16, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis dataKey="sesion" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v}%`, "Volverán"]} />
          <Bar dataKey="pct" fill="#D7141A" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="pct" position="top" formatter={(v) => (typeof v === "number" ? `${v}%` : "")} style={{ fontSize: 11, fill: "#404040" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
