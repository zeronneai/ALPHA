import WhatsAppIcon from "./WhatsAppIcon";
import { WHATSAPP_GROUP_CONFIGURADO, WHATSAPP_GROUP_LINK } from "@/lib/config";

type Props = { onReset: () => void };

export default function SuccessScreen({ onReset }: Props) {
  return (
    <div className="py-6 text-center" role="status">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-alpha-soft">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-alpha" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-5 text-2xl font-extrabold text-neutral-900">¡Listo! Ya estás registrado en Alpha</h2>
      <p className="mt-2 text-neutral-600">Gracias por unirte. ¡Nos vemos pronto!</p>
      {WHATSAPP_GROUP_CONFIGURADO && (
        <div className="mt-6">
          <p className="font-semibold text-neutral-800">No te pierdas nada, únete al grupo</p>
          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-[#15803D] px-4 py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="h-7 w-7" />
            Únete al grupo de WhatsApp
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={onReset}
        className="mt-4 w-full rounded-xl border-2 border-alpha px-4 py-3 text-base font-bold text-alpha transition hover:bg-alpha-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2"
      >
        Registrar a otra persona
      </button>
    </div>
  );
}
