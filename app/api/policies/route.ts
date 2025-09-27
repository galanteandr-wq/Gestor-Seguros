import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  // Importante: mode debe ser del tipo QueryMode, no string suelto
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

  const rows = await prisma.policy.findMany({
    where,
    orderBy: { updatedAt: 'desc' }, // asegúrate de tener updatedAt en tu modelo
    take: 100,
  });

  return NextResponse.json(rows);
}
