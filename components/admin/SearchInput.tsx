type Props = { valor: string; onChange: (v: string) => void; placeholder: string; etiqueta: string };

export default function SearchInput({ valor, onChange, placeholder, etiqueta }: Props) {
  return (
    <div>
      <label htmlFor="buscador" className="sr-only">
        {etiqueta}
      </label>
      <input
        id="buscador"
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus-visible:border-alpha focus-visible:ring-2 focus-visible:ring-alpha"
      />
    </div>
  );
}
