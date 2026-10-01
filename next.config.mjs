/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // La página de QRs ahora vive dentro del panel de admin.
    return [{ source: "/evaluacion/qr", destination: "/admin/qr", permanent: false }];
  },
};
export default nextConfig;
