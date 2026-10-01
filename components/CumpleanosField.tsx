import type { UseFormRegisterReturn } from "react-hook-form";
import { inputClasses } from "./FormField";
import { MESES } from "@/lib/schema";

type Props = {
  diaProps: UseFormRegisterReturn;
  mesProps: UseFormRegisterReturn;
  errorDia?: string;
  errorMes?: string;
};

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CumpleanosField({ diaProps, mesProps, errorDia, errorMes }: Props) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold text-neutral-800">Fecha de cumpleaños</legend>
      <div className="grid grid-cols-[1fr_1.6fr] gap-3">
        <select
          id="dia"
          aria-label="Día"
          defaultValue=""
          aria-invalid={!!errorDia}
          aria-describedby={errorDia ? "dia-error" : undefined}
          className={inputClasses(errorDia)}
          {...diaProps}
        >
          <option value="" disabled>
            Día
          </option>
          {DIAS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          id="mes"
          aria-label="Mes"
          defaultValue=""
          aria-invalid={!!errorMes}
          aria-describedby={errorMes ? "mes-error" : undefined}
          className={inputClasses(errorMes)}
          {...mesProps}
        >
          <option value="" disabled>
            Mes
          </option>
          {MESES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </div>
      {errorDia && (
        <p id="dia-error" role="alert" className="mt-1 text-sm font-medium text-alpha-dark">
          {errorDia}
        </p>
      )}
      {errorMes && (
        <p id="mes-error" role="alert" className="mt-1 text-sm font-medium text-alpha-dark">
          {errorMes}
        </p>
      )}
    </fieldset>
  );
}
