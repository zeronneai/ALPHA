"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAdminData } from "./AdminDataProvider";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { invitacionUrl } from "@/lib/admin/invitacion";
import type { RegistroRow } from "@/types/admin";

type Props = {
  registro: RegistroRow;
  /** Se llama si no se pudo guardar el cambio (el aviso lo muestra quien contiene la fila). */
  onError?: () => void;
};

const itemBase =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-neutral-800 transition hover:bg-alpha-soft focus-visible:bg-alpha-soft focus-visible:outline-none";

/** "Invitado ✓" clickeable: abre un menú con "Volver a invitar" y "Marcar como no invitado". */
export default function InvitadoMenu({ registro, onError }: Props) {
  const { marcarInvitado } = useAdminData();
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const boton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const cerrar = (devolverFoco = false) => {
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  };

  const alternar = () => {
    if (abierto) return cerrar();
    const r = boton.current?.getBoundingClientRect();
    if (!r) return;
    // Posición fija (portal): no la recorta el scroll horizontal de la tabla.
    const ancho = 256;
    const alto = 112; // alto aproximado del menú (2 opciones)
    // Si no cabe debajo del botón, se abre hacia arriba.
    const abajo = r.bottom + 4 + alto <= window.innerHeight - 8;
    setPos({
      top: abajo ? r.bottom + 4 : Math.max(8, r.top - alto - 4),
      left: Math.max(8, Math.min(r.left, window.innerWidth - ancho - 8)),
    });
    setAbierto(true);
  };

  useEffect(() => {
    if (!abierto) return;
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const fuera = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !boton.current?.contains(t)) setAbierto(false);
    };
    const alCerrar = () => setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("touchstart", fuera);
    window.addEventListener("scroll", alCerrar, true);
    window.addEventListener("resize", alCerrar);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("touchstart", fuera);
      window.removeEventListener("scroll", alCerrar, true);
      window.removeEventListener("resize", alCerrar);
    };
  }, [abierto]);

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      cerrar(true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      const i = items.indexOf(document.activeElement as HTMLElement);
      items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    } else if (e.key === "Tab") {
      setAbierto(false);
    }
  };

  const desmarcar = () => {
    cerrar();
    marcarInvitado(registro.id, false).catch(() => onError?.());
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Invitado, opciones para ${registro.nombre}`}
        onClick={alternar}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha"
      >
        Invitado ✓
        <svg viewBox="0 0 20 20" className={`h-4 w-4 transition ${abierto ? "rotate-180" : ""}`} fill="currentColor" aria-hidden="true">
          <path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {abierto &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            aria-label={`Opciones de invitación para ${registro.nombre}`}
            onKeyDown={teclas}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[70] w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-xl"
          >
            <a
              role="menuitem"
              href={invitacionUrl(registro.telefono, registro.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              // El menú se cierra después del clic: si se desmonta antes, el navegador no abre el enlace.
              onClick={() => setTimeout(() => setAbierto(false), 0)}
              className={itemBase}
            >
              <WhatsAppIcon className="h-4 w-4 text-[#15803D]" />
              Volver a invitar
            </a>
            <button type="button" role="menuitem" onClick={desmarcar} className={itemBase}>
              <span aria-hidden="true" className="w-4 text-center">
                ↺
              </span>
              Marcar como no invitado
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
