"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField, { inputClasses } from "./FormField";
import CumpleanosField from "./CumpleanosField";
import SelectField from "./SelectField";
import SuccessScreen from "./SuccessScreen";
import { OPCIONES_ORIGEN, registroSchema, type RegistroFormValues } from "@/lib/schema";
import { calcularFechaNacimiento } from "@/lib/calcularFechaNacimiento";
import { esDuplicado } from "@/lib/errores";
import { submitRegistro } from "@/lib/submitRegistro";
import type { Registro } from "@/types/registro";

const emptyValues: RegistroFormValues = {
  nombre: "",
  edad: "",
  telefono: "",
  dia: "",
  mes: "",
  como_se_entero: "",
  como_se_entero_otro: "",
};

export default function RegistroForm() {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: emptyValues,
  });

  const origen = watch("como_se_entero");

  const onSubmit = async (v: RegistroFormValues) => {
    setSubmitError(null);
    const data: Registro = {
      nombre: v.nombre.trim(),
      edad: Number(v.edad),
      telefono: v.telefono.replace(/\D/g, ""),
      fecha_nacimiento: calcularFechaNacimiento(Number(v.edad), Number(v.dia), Number(v.mes)),
      como_se_entero: v.como_se_entero,
      como_se_entero_otro: v.como_se_entero === "Otro" ? v.como_se_entero_otro?.trim() || null : null,
    };
    try {
      await submitRegistro(data);
      setDone(true);
    } catch (error) {
      console.error("Error al registrar:", error);
      if (esDuplicado(error)) {
        // Teléfono repetido: se avisa en el campo y se conserva todo lo demás que escribió.
        setError(
          "telefono",
          { type: "server", message: "Este teléfono ya está registrado en Alpha. Si crees que es un error, avísale a tu líder." },
          { shouldFocus: true },
        );
        return;
      }
      setSubmitError("Hubo un problema, intenta de nuevo");
    }
  };

  if (done) {
    return (
      <SuccessScreen
        onReset={() => {
          reset(emptyValues);
          setDone(false);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <h2 className="text-xl font-extrabold text-neutral-900">Regístrate</h2>

      <FormField
        label="Nombre completo"
        autoComplete="name"
        placeholder="Tu nombre y apellido"
        error={errors.nombre?.message}
        {...register("nombre")}
      />
      <FormField
        label="Edad"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        placeholder="Tu edad"
        error={errors.edad?.message}
        {...register("edad")}
      />
      <FormField
        label="Teléfono"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="10 dígitos"
        hint="Ejemplo: 555 123 4567"
        error={errors.telefono?.message}
        {...register("telefono")}
      />
      <CumpleanosField
        diaProps={register("dia")}
        mesProps={register("mes", { onChange: () => watch("dia") && trigger("dia") })}
        errorDia={errors.dia?.message}
        errorMes={errors.mes?.message}
      />
      <SelectField
        label="¿Cómo te enteraste de Alpha?"
        options={OPCIONES_ORIGEN}
        error={errors.como_se_entero?.message}
        {...register("como_se_entero")}
      />
      {origen === "Otro" && (
        <FormField
          label="Cuéntanos cómo"
          placeholder="Especifica cómo te enteraste"
          error={errors.como_se_entero_otro?.message}
          {...register("como_se_entero_otro")}
        />
      )}

      {submitError && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-alpha px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-alpha-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-30" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
        {isSubmitting ? "Enviando..." : "Registrarme"}
      </button>
    </form>
  );
}
