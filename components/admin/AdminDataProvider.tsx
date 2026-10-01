"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Cargando from "./Cargando";
import SinAcceso from "./SinAcceso";
import {
  borrarAsistencia,
  crearAsistencia,
  crearAsistencias,
  crearRegistro,
  editarRegistro,
  guardarInvitado,
  leerAsistencias,
  leerEvaluaciones,
  leerRegistros,
} from "@/lib/admin/queries";
import type { Registro } from "@/types/registro";
import type { AsistenciaRow, EvaluacionRow, Id, RegistroRow } from "@/types/admin";

type AdminData = {
  registros: RegistroRow[];
  asistencias: AsistenciaRow[];
  evaluaciones: EvaluacionRow[];
  agregarRegistro: (data: Registro) => Promise<RegistroRow>;
  actualizarRegistro: (id: Id, data: Registro) => Promise<void>;
  /** Actualización optimista: si falla, se revierte y se lanza el error. */
  marcarAsistencia: (registroId: Id, sesion: number, presente: boolean) => Promise<void>;
  marcarVarios: (registroIds: Id[], sesion: number) => Promise<void>;
  /** Marca como invitado al grupo de WhatsApp (optimista; si falla se revierte y se lanza el error). */
  marcarInvitado: (id: Id) => Promise<void>;
};

const Ctx = createContext<AdminData | null>(null);

export function useAdminData(): AdminData {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminData debe usarse dentro de AdminDataProvider");
  return ctx;
}

type Estado = "cargando" | "ok" | "sin_acceso" | "error";

function esErrorDePermisos(err: unknown): boolean {
  const e = err as { code?: string; status?: number; message?: string };
  return e?.code === "42501" || e?.status === 401 || e?.status === 403 || /permission denied|jwt|not authorized/i.test(e?.message ?? "");
}

const mismaAsistencia = (a: AsistenciaRow, id: Id, sesion: number) =>
  String(a.registro_id) === String(id) && a.sesion === sesion;

export default function AdminDataProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [registros, setRegistros] = useState<RegistroRow[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaRow[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionRow[]>([]);

  const cargar = useCallback(async () => {
    setEstado("cargando");
    try {
      const [r, a, e] = await Promise.all([leerRegistros(), leerAsistencias(), leerEvaluaciones()]);
      setRegistros(r);
      setAsistencias(a);
      setEvaluaciones(e);
      // Con RLS, un usuario sin permiso recibe listas vacías en vez de un error.
      setEstado(r.length === 0 && a.length === 0 && e.length === 0 ? "sin_acceso" : "ok");
    } catch (err) {
      console.error("Error al cargar los datos del panel:", err);
      setEstado(esErrorDePermisos(err) ? "sin_acceso" : "error");
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const aplicar = useCallback((id: Id, sesion: number, presente: boolean) => {
    setAsistencias((prev) => {
      const sinEsa = prev.filter((a) => !mismaAsistencia(a, id, sesion));
      return presente ? [...sinEsa, { registro_id: id, sesion }] : sinEsa;
    });
  }, []);

  const marcarAsistencia = useCallback(
    async (id: Id, sesion: number, presente: boolean) => {
      aplicar(id, sesion, presente);
      try {
        if (presente) await crearAsistencia(id, sesion);
        else await borrarAsistencia(id, sesion);
      } catch (err) {
        console.error("Error al guardar la asistencia:", err);
        aplicar(id, sesion, !presente);
        throw err;
      }
    },
    [aplicar],
  );

  const marcarVarios = useCallback(async (ids: Id[], sesion: number) => {
    await crearAsistencias(ids, sesion);
    setAsistencias((prev) => {
      const ya = new Set(prev.filter((a) => a.sesion === sesion).map((a) => String(a.registro_id)));
      return [...prev, ...ids.filter((id) => !ya.has(String(id))).map((registro_id) => ({ registro_id, sesion }))];
    });
  }, []);

  const agregarRegistro = useCallback(async (data: Registro) => {
    const fila = await crearRegistro(data);
    setRegistros((prev) => [...prev, fila]);
    return fila;
  }, []);

  const actualizarRegistro = useCallback(async (id: Id, data: Registro) => {
    const fila = await editarRegistro(id, data);
    setRegistros((prev) => prev.map((r) => (String(r.id) === String(id) ? fila : r)));
  }, []);

  const marcarInvitado = useCallback(async (id: Id) => {
    const aplicar = (valor: boolean) =>
      setRegistros((prev) => prev.map((r) => (String(r.id) === String(id) ? { ...r, invitado_whatsapp: valor } : r)));
    aplicar(true);
    try {
      await guardarInvitado(id);
    } catch (err) {
      console.error("Error al marcar como invitado:", err);
      aplicar(false);
      throw err;
    }
  }, []);

  if (estado === "cargando") return <Cargando />;
  if (estado === "sin_acceso")
    return (
      <SinAcceso detalle="Tu cuenta no tiene permiso para ver esta información. Si crees que es un error, avisa a quien administra Alpha." />
    );
  if (estado === "error")
    return (
      <SinAcceso
        titulo="No se pudieron cargar los datos"
        detalle="Revisa tu conexión e inténtalo de nuevo."
        onReintentar={() => void cargar()}
        mostrarSalir={false}
      />
    );

  return (
    <Ctx.Provider value={{ registros, asistencias, evaluaciones, agregarRegistro, actualizarRegistro, marcarAsistencia, marcarVarios, marcarInvitado }}>
      {children}
    </Ctx.Provider>
  );
}
