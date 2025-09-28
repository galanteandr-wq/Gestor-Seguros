// app/policies/page.tsx
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Nav from '@/components/Nav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PoliciesPage({
  searchParams,
}: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q || '').trim();
  const mode: Prisma.QueryMode = 'insensitive';

  const where: Prisma.PolicyWhereInput = q
    ? {
        OR: [
          { nombre:       { contains: q, mode } },
          { apellido:     { contains: q, mode } },
          { dniCuit:      { contains: q, mode } },
          { patente:      { contains: q, mode } },
          { empresa:      { contains: q, mode } },
          { numeroPoliza: { contains: q, mode } },
        ],
      }
    : {};

  const data = await prisma.policy.findMany({
    where,
    orderBy: { fechaVencimiento: 'asc' },
    take: 50,
  });

  return (
    <>
      <Nav />
      <main className="p-6 mx-auto max-w-5xl">
        <h1 className="text-xl font-semibold mb-4">Pólizas</h1>
        <div className="text-sm text-gray-500 mb-2">Total: {data.length}</div>
        <div className="overflow-auto border rounded">
          <table className="min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Empresa</th>
                <th className="px-3 py-2 text-left">Nº Póliza</th>
                <th className="px-3 py-2 text-left">Patente</th>
                <th className="px-3 py-2 text-left">Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.apellido}, {p.nombre}</td>
                  <td className="px-3 py-2">{p.empresa || '-'}</td>
                  <td className="px-3 py-2">{p.numeroPoliza || '-'}</td>
                  <td className="px-3 py-2">{p.patente || '-'}</td>
                  <td className="px-3 py-2">
                    {p.fechaVencimiento
                      ? new Date(p.fechaVencimiento).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
