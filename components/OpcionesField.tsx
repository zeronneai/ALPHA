type Opcion<T extends string> = { valor: T; emoji: string; texto: string };

type Props<T extends string> = {
  nombre: string;
  pregunta: string;
  opciones: readonly Opcion<T>[];
  valor: T | null;
  onChange: (v: T) => void;
};

/** Grupo de botones tipo tarjeta (radio accesible). */
export default function OpcionesField<T extends string>({ nombre, pregunta, opciones, valor, onChange }: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-2 text-base font-bold text-neutral-900">{pregunta}</legend>
      <div role="radiogroup" aria-label={pregunta} className={`grid gap-3 ${opciones.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {opciones.map((o) => {
          const activo = valor === o.valor;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={activo}
              name={nombre}
              onClick={() => onChange(o.valor)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 ${
                activo
                  ? "border-alpha bg-alpha text-white shadow-md"
                  : "border-neutral-300 bg-white text-neutral-800 hover:border-alpha"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                {o.emoji}
              </span>
              {o.texto}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
