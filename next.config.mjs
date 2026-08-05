/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático: genera HTML/CSS/JS puro en /out, sin backend.
  // Se puede subir tal cual a Netlify, Vercel, o embeberse como sub-ruta
  // de la futura landing de Proyecto Ingeniería.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
