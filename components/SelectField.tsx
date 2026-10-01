import { forwardRef, type SelectHTMLAttributes } from "react";
import { inputClasses } from "./FormField";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly string[];
  placeholder?: string;
  error?: string;
};

const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { label, options, placeholder = "Selecciona una opción", error, id, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;
  const errorId = `${fieldId}-error`;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-neutral-800">
        {label}
      </label>
      <select
        ref={ref}
        id={fieldId}
        defaultValue=""
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={inputClasses(error)}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-alpha-dark">
          {error}
        </p>
      )}
    </div>
  );
});

export default SelectField;
