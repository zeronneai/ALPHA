export default function Cargando({ texto = "Cargando..." }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-neutral-600" role="status">
      <svg className="h-6 w-6 animate-spin text-alpha" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {texto}
    </div>
  );
}
