import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Worker refuses the optimizer endpoints; serve every image as-is.
  images: { unoptimized: true },
};

export default nextConfig;
