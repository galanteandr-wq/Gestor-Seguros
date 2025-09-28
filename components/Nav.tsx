// components/Nav.tsx
'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Nav() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Gestor Seguros</Link>
          <Link href="/policies" className="text-sm text-gray-600 hover:text-gray-900">Pólizas</Link>
          <Link href="/policies/new" className="text-sm text-gray-600 hover:text-gray-900">Nueva</Link>
        </div>
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="text-sm text-blue-600 hover:underline">
              Iniciar sesión
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
