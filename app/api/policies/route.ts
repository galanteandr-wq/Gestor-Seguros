import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma'; // ruta relativa desde app/api/policies

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  // EVITA el error: Prisma.QueryMode no puede ser un string suelto
  const mode: Prisma.QueryMode = 'insensitive';

  const where: Prisma.PolicyWhereInput =
    q.length > 0
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
    orderBy: { updatedAt: 'desc' }, // si no tenés updatedAt, usa createdAt o quita orderBy
    take: 100,
  });

  return NextResponse.json(rows);
}
