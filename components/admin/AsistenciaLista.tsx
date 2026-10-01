"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "./AdminDataProvider";
import InvitarButton, { AVISO_INVITACION } from "./InvitarButton";
import Modal from "./Modal";
import RegistroFormModal from "./RegistroFormModal";
import SearchInput from "./SearchInput";
import { botonBorde, botonRojo } from "./SinAcceso";
import { WHATSAPP_GROUP_CONFIGURADO } from "@/lib/config";
import { normalizar, porNombre } from "@/lib/admin/formato";
import type { Sesion } from "@/lib/sesiones";
import type { Registro } from "@/types/registro";
import type { Id, RegistroRow } from "@/types/admin";

export default function AsistenciaLista({ sesion }: { sesion: Sesion }) {
  const { registros, asistencias, agregarRegistro, marcarAsistencia, marcarVarios } = useAdminData();
  const [busqueda, setBusqueda] = useState("");
  const [pendientes, setPendientes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [marcando, setMarcando] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [agregadaId, setAgregadaId] = useState<Id | null>(null);

  const presentes = useMemo(
    () => new Set(asistencias.filter((a) => a.sesion === sesion.numero).map((a) => String(a.registro_id))),
    [asistencias, sesion.numero],
  );
  const ordenados = useMemo(() => [...registros].sort(porNombre), [registros]);
  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return q ? ordenados.filter((r) => normalizar(r.nombre).includes(q)) : ordenados;
  }, [ordenados, busqueda]);
  const agregada = agregadaId === null ? undefined : registros.find((r) => String(r.id) === String(agregadaId));
  const faltantes = registros.filter((r) => !presentes.has(String(r.id)));

  const alternar = async (r: RegistroRow) => {
    const clave = String(r.id);
    if (pendientes.has(clave)) return;
    setError(null);
    setPendientes((p) => new Set(p).add(clave));
    try {
      await marcarAsistencia(r.id, sesion.numero, !presentes.has(clave));
    } catch {
      setError("No se pudo guardar el cambio, intenta de nuevo");
    } finally {
      setPendientes((p) => {
        const n = new Set(p);
        n.delete(clave);
        return n;
      });
    }
  };

  const marcarTodos = async () => {
    setMarcando(true);
    setError(null);
    try {
      await marcarVarios(faltantes.map((r) => r.id), sesion.numero);
      setConfirmando(false);
    } catch (err) {
      console.error("Error al marcar a todos:", err);
      setConfirmando(false);
      setError("No se pudo marcar a todos, intenta de nuevo");
    } finally {
      setMarcando(false);
    }
  };

  const guardarNueva = async (data: Registro) => {
    const nuevo = await agregarRegistro(data);
    if (WHATSAPP_GROUP_CONFIGURADO) setAgregadaId(nuevo.id);
    try {
      await marcarAsistencia(nuevo.id, sesion.numero, true);
    } catch {
      setError("Se guardó a la persona, pero no se pudo marcar su asistencia. Márcala en la lista.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/asistencia" className="text-sm font-semibold text-alpha hover:underline">
          ← Todas las sesiones
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-neutral-900">Asistencia · {sesion.titulo}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setAgregando(true)} className={botonRojo}>
          + Agregar persona nueva
        </button>
        <button type="button" onClick={() => setConfirmando(true)} disabled={faltantes.length === 0} className={botonBorde}>
          Marcar a todos
        </button>
      </div>

      {/* Contador y buscador quedan fijos bajo el menú al hacer scroll (alto del menú: 103px / 107px) */}
      <div className="sticky top-[103px] z-20 -mx-4 space-y-2 border-b border-neutral-200 bg-neutral-50/95 px-4 pb-3 pt-2 backdrop-blur sm:top-[107px]">
        <p className="text-lg font-extrabold text-alpha" aria-live="polite">
          {presentes.size} de {registros.length} asistieron
        </p>
        <SearchInput valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre" etiqueta="Buscar por nombre" />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {error}
        </p>
      )}

      {visibles.length === 0 ? (
        <p className="py-8 text-center text-neutral-600">{busqueda ? "Nadie coincide con tu búsqueda." : "Todavía no hay personas registradas."}</p>
      ) : (
        <ul className="space-y-2">
          {visibles.map((r) => {
            const clave = String(r.id);
            const activo = presentes.has(clave);
            return (
              <li key={clave} className="flex items-center gap-2">
                <label
                  className={`flex min-w-0 flex-1 cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 py-3.5 transition ${
                    activo ? "border-alpha bg-alpha-soft" : "border-neutral-200 bg-white"
                  } ${pendientes.has(clave) ? "opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={activo}
                    disabled={pendientes.has(clave)}
                    onChange={() => void alternar(r)}
                    className="h-8 w-8 shrink-0 cursor-pointer accent-[#D7141A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2"
                  />
                  <span className="min-w-0 flex-1 text-base font-semibold text-neutral-900">{r.nombre}</span>
                </label>
                {!r.invitado_whatsapp && <InvitarButton registro={r} variante="icono" onError={() => setError(AVISO_INVITACION)} />}
              </li>
            );
          })}
        </ul>
      )}

      {confirmando && (
        <Modal titulo="Marcar a todos" onClose={() => !marcando && setConfirmando(false)}>
          <p className="text-neutral-700">
            ¿Marcar como asistentes a los <strong>{faltantes.length}</strong> registrados que faltan en {sesion.titulo}?
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setConfirmando(false)} disabled={marcando} className={botonBorde}>
              Cancelar
            </button>
            <button type="button" onClick={() => void marcarTodos()} disabled={marcando} className={botonRojo}>
              {marcando ? "Marcando..." : "Sí, marcar"}
            </button>
          </div>
        </Modal>
      )}

      {agregada && (
        <Modal titulo="¡Agregado!" onClose={() => setAgregadaId(null)}>
          <p className="text-neutral-700">
            <strong>{agregada.nombre}</strong> quedó registrado(a) y marcado(a) en {sesion.titulo}.
          </p>
          <div className="mt-6 space-y-3">
            {agregada.invitado_whatsapp ? (
              <p className="text-center font-semibold text-neutral-500">Invitado al grupo ✓</p>
            ) : (
              <div className="flex flex-col items-stretch">
                <InvitarButton registro={agregada} variante="grande" etiqueta="Invitar al grupo de WhatsApp" onError={() => setError(AVISO_INVITACION)} />
              </div>
            )}
            {error && (
              <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
                {error}
              </p>
            )}
            <button type="button" onClick={() => setAgregadaId(null)} className={botonBorde}>
              Listo
            </button>
          </div>
        </Modal>
      )}

      {agregando && (
        <RegistroFormModal titulo="Agregar persona nueva" textoBoton="Guardar y marcar asistencia" onGuardar={guardarNueva} onClose={() => setAgregando(false)} />
      )}
    </div>
  );
}
