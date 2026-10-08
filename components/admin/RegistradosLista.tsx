"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "./AdminDataProvider";
import Modal from "./Modal";
import RegistroFormModal from "./RegistroFormModal";
import InvitadoMenu from "./InvitadoMenu";
import InvitarButton, { AVISO_INVITACION } from "./InvitarButton";
import SearchInput from "./SearchInput";
import { botonBorde, botonRojo } from "./SinAcceso";
import { WHATSAPP_GROUP_CONFIGURADO } from "@/lib/config";
import { SESIONES } from "@/lib/sesiones";
import { descargarCsv, generarCsv } from "@/lib/admin/csv";
import { cumpleanosTexto, fechaCorta, normalizar, origenTexto, porNombre, soloDigitos, telefonoLegible, whatsappUrl } from "@/lib/admin/formato";
import { sesionesPorRegistro } from "@/lib/admin/stats";
import type { RegistroRow } from "@/types/admin";

const linkAccion =
  "inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha";

function Telefono({ telefono }: { telefono: string }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <a href={`tel:${soloDigitos(telefono)}`} className={`${linkAccion} text-alpha underline`}>
        {telefonoLegible(telefono)}
      </a>
      <a
        href={whatsappUrl(telefono)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp a ${telefonoLegible(telefono)}`}
        className={`${linkAccion} bg-alpha text-white hover:bg-alpha-dark`}
      >
        WhatsApp
      </a>
    </span>
  );
}

export default function RegistradosLista() {
  const { registros, asistencias, actualizarRegistro, eliminarRegistro } = useAdminData();
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<RegistroRow | null>(null);
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [errorInvitar, setErrorInvitar] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<RegistroRow | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const porRegistro = useMemo(() => sesionesPorRegistro(asistencias), [asistencias]);
  const visibles = useMemo(() => {
    const ordenados = [...registros].sort(porNombre);
    const q = normalizar(busqueda.trim());
    const digitos = soloDigitos(busqueda);
    const base = soloPendientes ? ordenados.filter((r) => !r.invitado_whatsapp) : ordenados;
    if (!q) return base;
    return base.filter((r) => normalizar(r.nombre).includes(q) || (digitos.length > 0 && soloDigitos(r.telefono).includes(digitos)));
  }, [registros, busqueda, soloPendientes]);
  const pendientes = registros.filter((r) => !r.invitado_whatsapp).length;

  const asistencias_de = (r: RegistroRow) => `${porRegistro.get(String(r.id))?.size ?? 0}/${SESIONES.length}`;
  const invitacion = (r: RegistroRow) =>
    r.invitado_whatsapp ? <InvitadoMenu registro={r} onError={() => setErrorInvitar("No se pudo marcar como no invitado, intenta de nuevo")} /> : <InvitarButton registro={r} onError={() => setErrorInvitar(AVISO_INVITACION)} />;
  const eliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminarRegistro(aEliminar.id);
      setAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar el registro:", err);
      setErrorEliminar(`No se pudo eliminar a ${aEliminar.nombre}, intenta de nuevo`);
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };
  const botonEliminar = (r: RegistroRow) => (
    <button
      type="button"
      onClick={() => setAEliminar(r)}
      aria-label={`Eliminar a ${r.nombre}`}
      title="Eliminar"
      className={`${linkAccion} gap-1.5 border border-alpha text-alpha hover:bg-alpha-soft`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m4 5v6m6-6v6" />
      </svg>
      Eliminar
    </button>
  );
  const editar = (r: RegistroRow) => (
    <button type="button" onClick={() => setEditando(r)} className={`${linkAccion} border border-neutral-300 text-neutral-800 hover:border-alpha hover:text-alpha`}>
      Editar
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-neutral-900">Registrados ({registros.length})</h1>
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={() => descargarCsv(`alpha-registrados-${new Date().toISOString().slice(0, 10)}.csv`, generarCsv([...registros].sort(porNombre), asistencias))}
            className={botonBorde}
          >
            Exportar a Excel (CSV)
          </button>
        </div>
      </div>

      <SearchInput valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o teléfono" etiqueta="Buscar por nombre o teléfono" />

      {errorEliminar && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {errorEliminar}
        </p>
      )}

      {errorInvitar && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {errorInvitar}
        </p>
      )}

      {WHATSAPP_GROUP_CONFIGURADO && (
        <button
          type="button"
          aria-pressed={soloPendientes}
          onClick={() => setSoloPendientes((v) => !v)}
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 ${
            soloPendientes ? "border-alpha bg-alpha text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-alpha"
          }`}
        >
          Pendientes de invitar ({pendientes})
        </button>
      )}

      {visibles.length === 0 ? (
        <p className="py-8 text-center text-neutral-600">{busqueda || soloPendientes ? "Nadie coincide con tu búsqueda." : "Todavía no hay personas registradas."}</p>
      ) : (
        <>
          {/* Celular: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {visibles.map((r) => (
              <li key={String(r.id)} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-extrabold text-neutral-900">{r.nombre}</h2>
                  <span className="shrink-0 rounded-full bg-alpha-soft px-3 py-1 text-sm font-bold text-alpha-dark">{asistencias_de(r)}</span>
                </div>
                <dl className="mt-2 space-y-1 text-sm text-neutral-700">
                  <div>
                    <dt className="inline font-semibold">Edad: </dt>
                    <dd className="inline">{r.edad}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Cumpleaños: </dt>
                    <dd className="inline">{cumpleanosTexto(r.fecha_nacimiento)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Se enteró: </dt>
                    <dd className="inline">{origenTexto(r)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Registro: </dt>
                    <dd className="inline">{fechaCorta(r.created_at)}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <Telefono telefono={r.telefono} />
                  <span className="flex gap-2">
                    {editar(r)}
                    {botonEliminar(r)}
                  </span>
                </div>
                {WHATSAPP_GROUP_CONFIGURADO && (
                  <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3 text-sm">
                    <span className="font-semibold text-neutral-700">WhatsApp:</span>
                    {invitacion(r)}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Pantallas grandes: tabla */}
          <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-alpha-soft text-alpha-dark">
                <tr>
                  {["Nombre", "Edad", "Teléfono", "Cumpleaños", "Cómo se enteró", "Registro", "Asistencias", ...(WHATSAPP_GROUP_CONFIGURADO ? ["WhatsApp"] : []), ""].map((h) => (
                    <th key={h} scope="col" className="px-3 py-3 font-bold">
                      {h || <span className="sr-only">Acciones</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {visibles.map((r) => (
                  <tr key={String(r.id)}>
                    <th scope="row" className="px-3 py-3 font-semibold text-neutral-900">
                      {r.nombre}
                    </th>
                    <td className="px-3 py-3">{r.edad}</td>
                    <td className="px-3 py-3">
                      <Telefono telefono={r.telefono} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{cumpleanosTexto(r.fecha_nacimiento)}</td>
                    <td className="px-3 py-3">{origenTexto(r)}</td>
                    <td className="whitespace-nowrap px-3 py-3">{fechaCorta(r.created_at)}</td>
                    <td className="px-3 py-3 font-bold text-alpha">{asistencias_de(r)}</td>
                    {WHATSAPP_GROUP_CONFIGURADO && <td className="whitespace-nowrap px-3 py-3">{invitacion(r)}</td>}
                    <td className="px-3 py-3"><span className="flex gap-2">{editar(r)}{botonEliminar(r)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editando && (
        <RegistroFormModal
          titulo="Editar registro"
          textoBoton="Guardar cambios"
          registro={editando}
          onGuardar={(data) => actualizarRegistro(editando.id, data)}
          onClose={() => setEditando(null)}
          onBuscar={(telefono) => {
            setBusqueda(telefono);
            setEditando(null);
          }}
        />
      )}

      {aEliminar && (
        <Modal titulo="Eliminar registro" onClose={() => !eliminando && setAEliminar(null)}>
          <p className="text-neutral-800">
            ¿Eliminar a <strong>{aEliminar.nombre}</strong>? También se borrarán sus asistencias. Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setAEliminar(null)} disabled={eliminando} className={botonBorde}>
              Cancelar
            </button>
            <button type="button" onClick={() => void eliminar()} disabled={eliminando} className={botonRojo}>
              {eliminando ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
