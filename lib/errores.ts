/** Código de Postgres para violación de índice único (aquí: teléfono repetido). */
export const CODIGO_DUPLICADO = "23505";
/** Código de Postgres para violación de llave foránea. */
export const CODIGO_LLAVE_FORANEA = "23503";

export const tieneCodigo = (err: unknown, codigo: string): boolean => (err as { code?: string } | null)?.code === codigo;

export const esDuplicado = (err: unknown) => tieneCodigo(err, CODIGO_DUPLICADO);
