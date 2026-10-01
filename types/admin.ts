import type { Registro } from "@/types/registro";
import type { Evaluacion } from "@/types/evaluacion";

/** El id puede ser uuid (string) o bigint (number) según la tabla de Supabase. */
export type Id = string | number;

export type RegistroRow = Registro & { id: Id; created_at: string };
export type AsistenciaRow = { registro_id: Id; sesion: number };
export type EvaluacionRow = Evaluacion & { id: Id; created_at: string };
