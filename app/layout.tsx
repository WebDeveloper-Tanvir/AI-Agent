import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI UI Generator - Claude-Code Style',
  description: 'Deterministic UI generation with AI agent orchestration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
