/** Preguntas de valoración (mal / bien / súper) de la evaluación. */
export const PREGUNTAS_EVALUACION = [
  { campo: "bienvenida", etiqueta: "Bienvenida", corta: "Bienv." },
  { campo: "comida", etiqueta: "Comida", corta: "Comida" },
  { campo: "tema", etiqueta: "Tema", corta: "Tema" },
  { campo: "grupo_mesa", etiqueta: "Grupo de mesa", corta: "Grupo" },
  { campo: "ambiente", etiqueta: "Ambiente y lugar", corta: "Ambiente" },
] as const;

export type CampoPregunta = (typeof PREGUNTAS_EVALUACION)[number]["campo"];
