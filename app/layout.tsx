import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Gestor de Seguros',
  description: 'Dashboard de pólizas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!publishableKey) {
    // Esto te avisa temprano si la env no está llegando
    throw new Error('Falta NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY en .env')
  }
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
