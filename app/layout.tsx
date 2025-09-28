// app/layout.tsx
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Gestor Seguros',
  description: 'Gestión de pólizas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) {
    console.warn('Falta NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider publishableKey={pk}>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

