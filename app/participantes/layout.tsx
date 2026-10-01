import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Portal de Participantes | Alpha Jóvenes",
  robots: { index: false, follow: false },
};

export default function ParticipantesLayout({ children }: { children: ReactNode }) {
  return children;
}
