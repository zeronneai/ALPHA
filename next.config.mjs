/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Los PDFs y temas.json son privados (viven en /content, no en /public): hay que
  // incluirlos explícitamente en las funciones de servidor que los leen con fs.
  outputFileTracingIncludes: {
    "/participantes": ["./content/episodios/**/*"],
    "/participantes/**/*": ["./content/episodios/**/*"],
    "/api/participantes/**/*": ["./content/episodios/**/*"],
    "/admin/episodios": ["./content/episodios/temas.json"],
  },
  async redirects() {
    // La página de QRs ahora vive dentro del panel de admin.
    return [{ source: "/evaluacion/qr", destination: "/admin/qr", permanent: false }];
  },
};
export default nextConfig;
