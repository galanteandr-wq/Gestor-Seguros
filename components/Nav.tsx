import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export function Nav() {
  return (
    <div className="w-full border-b bg-white">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-semibold">Gestor de Seguros</div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/">Dashboard</Link>
          <Link href="/policies">Pólizas</Link>
          <Link href="/reports">Reportes</Link>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </div>
  )
}
