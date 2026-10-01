import type { Metadata } from "next";
import EvaluacionShell from "@/components/EvaluacionShell";
import QrLista from "@/components/QrLista";

export const metadata: Metadata = {
  title: "QRs de evaluación | Alpha Jóvenes",
  robots: { index: false, follow: false },
};

export default function QrPage() {
  return (
    <EvaluacionShell titulo="QRs de evaluación" subtitulo="Un código por sesión" ancho="2xl">
      <QrLista />
    </EvaluacionShell>
  );
}
