import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ByteForge Aegis',
  description: 'Authentication and verification',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
