"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "./Modal";
import { botonBorde, botonRojo } from "./SinAcceso";
import FormField from "@/components/FormField";
import SelectField from "@/components/SelectField";
import CumpleanosField from "@/components/CumpleanosField";
import { OPCIONES_ORIGEN, registroSchema, type RegistroFormValues } from "@/lib/schema";
import { armarRegistro, valoresIniciales } from "@/lib/admin/registro";
import { esDuplicado } from "@/lib/errores";
import type { Registro } from "@/types/registro";
import type { RegistroRow } from "@/types/admin";

type Props = {
  titulo: string;
  textoBoton: string;
  /** Si se pasa, el formulario edita ese registro. */
  registro?: RegistroRow;
  onGuardar: (data: Registro) => Promise<void>;
  onClose: () => void;
  /** Si el teléfono ya existe (23505), ofrece cerrar el modal y buscar a esa persona con su teléfono. */
  onBuscar?: (telefono: string) => void;
};

/** Mismos campos que el registro público; sirve para agregar y para editar. */
export default function RegistroFormModal({ titulo, textoBoton, registro, onGuardar, onClose, onBuscar }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [duplicado, setDuplicado] = useState<string | null>(null); // teléfono repetido (solo dígitos)
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormValues>({ resolver: zodResolver(registroSchema), defaultValues: valoresIniciales(registro) });

  const origen = watch("como_se_entero");

  const onSubmit = async (v: RegistroFormValues) => {
    setError(null);
    setDuplicado(null);
    const data = armarRegistro(v, registro);
    try {
      await onGuardar(data);
      onClose();
    } catch (err) {
      console.error("Error al guardar el registro:", err);
      if (esDuplicado(err)) setDuplicado(data.telefono);
      else setError("Hubo un problema, intenta de nuevo");
    }
  };

  return (
    <Modal titulo={titulo} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField label="Nombre completo" autoComplete="off" error={errors.nombre?.message} {...register("nombre")} />
        <FormField label="Edad" type="number" inputMode="numeric" min={1} step={1} error={errors.edad?.message} {...register("edad")} />
        <FormField label="Teléfono" type="tel" inputMode="tel" placeholder="10 dígitos" error={errors.telefono?.message} {...register("telefono")} />
        <CumpleanosField
          diaProps={register("dia")}
          mesProps={register("mes", { onChange: () => watch("dia") && trigger("dia") })}
          errorDia={errors.dia?.message}
          errorMes={errors.mes?.message}
        />
        <SelectField label="¿Cómo se enteró de Alpha?" options={OPCIONES_ORIGEN} error={errors.como_se_entero?.message} {...register("como_se_entero")} />
        {origen === "Otro" && (
          <FormField label="Cuéntanos cómo" placeholder="Especifica cómo se enteró" error={errors.como_se_entero_otro?.message} {...register("como_se_entero_otro")} />
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
            {error}
          </p>
        )}
        {duplicado && (
          <div role="alert" className="space-y-3 rounded-xl bg-alpha-soft px-4 py-3">
            <p className="text-sm font-semibold text-alpha-dark">Esta persona ya está registrada</p>
            {onBuscar && (
              <button type="button" onClick={() => onBuscar(duplicado)} className={`${botonBorde} !py-2.5 !text-sm`}>
                Buscarla en la lista
              </button>
            )}
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className={botonRojo}>
          {isSubmitting ? "Guardando..." : textoBoton}
        </button>
      </form>
    </Modal>
  );
}
