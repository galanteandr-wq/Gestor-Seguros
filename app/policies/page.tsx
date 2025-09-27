import { Nav } from '@/components/Nav'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'
import Link from 'next/link'

export default async function PoliciesPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const userId = await requireUserId()
  const q = (searchParams?.q || '').trim()
  const where = q ? {
    userId,
    OR: [
      { nombre: { contains: q, mode: 'insensitive' } },
      { apellido: { contains: q, mode: 'insensitive' } },
      { dniCuit: { contains: q, mode: 'insensitive' } },
      { patente: { contains: q, mode: 'insensitive' } },
    ]
  } : { userId }
  const data = await prisma.policy.findMany({
    where,
    orderBy: { fechaVencimiento: 'asc' },
    take: 50,
  })

  return (
    <div>
      <Nav />
      <div className="container py-6">
        <div className="flex items-end justify-between gap-4">
          <form className="flex gap-2">
            <input name="q" placeholder="Buscar por nombre, DNI o patente…" className="input w-80" defaultValue={q} />
            <button className="btn">Buscar</button>
          </form>
          <Link href="/policies/new" className="btn btn-primary">Nueva póliza</Link>
        </div>

        <div className="card mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left text-gray-500">
                <th>Cliente</th>
                <th>Patente</th>
                <th>Empresa</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(p => (
                <tr key={p.id} className="[&>td]:px-3 [&>td]:py-2">
                  <td>{p.apellido}, {p.nombre}</td>
                  <td>{p.patente}</td>
                  <td>{p.empresa}</td>
                  <td>{p.fechaInicio?.toISOString().slice(0,10)}</td>
                  <td>{p.fechaVencimiento?.toISOString().slice(0,10)}</td>
                  <td>
                    <span className="badge">{p.estado || 'Activa'}</span>
                  </td>
                  <td className="text-right">
                    <Link href={`/policies/${p.id}`} className="text-gray-900 hover:underline">Editar</Link>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
