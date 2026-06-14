import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone bundle is for FTP/Render self-hosting only; Vercel uses its own output.
  ...(process.env.DEPLOY_STANDALONE === '1' ? { output: 'standalone' as const } : {}),
  serverExternalPackages: ['google-auth-library', 'nodemailer'],
};

export default nextConfig;
