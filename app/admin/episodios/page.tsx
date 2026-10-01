import EpisodiosAdmin from "@/components/admin/EpisodiosAdmin";
import { leerTemas } from "@/lib/portal/temas";

export default function EpisodiosPage() {
  // Al panel solo llegan número y título (nada del resumen ni de los PDFs, que son contenido privado).
  const titulos = leerTemas().map((t) => ({ episodio: t.episodio, titulo: t.titulo }));
  return <EpisodiosAdmin titulos={titulos} />;
}
