type Props = { activo: boolean; onChange: (v: boolean) => void; etiquetaActivo: string; etiquetaInactivo: string; deshabilitado?: boolean; nombre: string };

/** Switch grande y accesible (role="switch"). */
export default function Interruptor({ activo, onChange, etiquetaActivo, etiquetaInactivo, deshabilitado, nombre }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={nombre}
      disabled={deshabilitado}
      onClick={() => onChange(!activo)}
      className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 disabled:opacity-60"
    >
      <span className={`relative inline-block h-9 w-16 shrink-0 rounded-full transition-colors ${activo ? "bg-alpha" : "bg-neutral-300"}`}>
        <span className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${activo ? "translate-x-7" : ""}`} />
      </span>
      <span className={`text-base font-bold ${activo ? "text-alpha" : "text-neutral-600"}`}>{activo ? etiquetaActivo : etiquetaInactivo}</span>
    </button>
  );
}
