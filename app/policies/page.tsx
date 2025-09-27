// app/policies/page.tsx
import { auth } from '@clerk/nextjs/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

type PageProps = {
  searchParams?: { q?: string };
};

export default async function PoliciesPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) return null; // o redirigir a /sign-in

  const q = (searchParams?.q ?? '').toString().trim();
  const mode: Prisma.QueryMode = 'insensitive';

  const where: Prisma.PolicyWhereInput = q
    ? {
        userId,
        OR: [
          { nombre:   { contains: q, mode } },
          { apellido: { contains: q, mode } },
          { dniCuit:  { contains: q, mode } },
          { patente:  { contains: q, mode } },
        ],
      }
    : { userId };

  const data = await prisma.policy.findMany({
    where,
    orderBy: { updatedAt: 'desc' }, // si preferís: { fechaVencimiento: 'asc' } si existe en tu modelo
    take: 50,
  });

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Pólizas</h1>
      {/* Reemplazá esto por tu tabla UI cuando quieras */}
      <pre className="text-sm bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
