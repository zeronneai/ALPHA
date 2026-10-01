import PortalShell from "@/components/portal/PortalShell";
import EntrarForm from "@/components/portal/EntrarForm";

export default function EntrarPage() {
  return (
    <PortalShell titulo="Portal de Participantes" ancho="md" solapar>
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-8">
        <EntrarForm />
      </div>
    </PortalShell>
  );
}
