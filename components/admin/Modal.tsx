"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = { titulo: string; onClose: () => void; children: ReactNode };

// Contador para que varios modales (uno cierra mientras otro abre) no dejen la página sin scroll.
let bloqueos = 0;
let overflowPrevio = "";
function bloquearScroll() {
  if (bloqueos++ === 0) {
    overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}
function liberarScroll() {
  if (--bloqueos === 0) document.body.style.overflow = overflowPrevio;
}

export default function Modal({ titulo, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const alCerrar = useRef(onClose);
  alCerrar.current = onClose;

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    bloquearScroll();
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && alCerrar.current();
    document.addEventListener("keydown", onKey);
    return () => {
      liberarScroll();
      document.removeEventListener("keydown", onKey);
      previo?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl outline-none sm:rounded-3xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold text-neutral-900">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 rounded-full p-2 text-2xl leading-none text-neutral-500 hover:text-alpha focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
