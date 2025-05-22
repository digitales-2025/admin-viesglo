import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: [], // Añade aquí dominios externos si usas imágenes de CDNs
    unoptimized: true, // Esto ayuda con imágenes que no se cargan
  },
  // Asegurar que los assets estáticos se incluyan en la compilación standalone
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
