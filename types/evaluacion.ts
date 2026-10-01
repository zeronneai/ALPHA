export type Valoracion = "mal" | "bien" | "super";

/** Coincide con la tabla `evaluaciones` de Supabase. */
export type Evaluacion = {
  sesion: number;
  bienvenida: Valoracion;
  comida: Valoracion;
  tema: Valoracion;
  grupo_mesa: Valoracion;
  ambiente: Valoracion;
  volvera: boolean;
  comentario: string | null;
};
