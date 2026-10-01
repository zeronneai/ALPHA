import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const inputClasses = (error?: string) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus-visible:ring-2 focus-visible:ring-alpha focus-visible:border-alpha ${
    error ? "border-alpha" : "border-neutral-300"
  }`;

const FormField = forwardRef<HTMLInputElement, Props>(function FormField(
  { label, error, hint, id, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;
  const errorId = `${fieldId}-error`;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-neutral-800">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={inputClasses(error)}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-alpha-dark">
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;
