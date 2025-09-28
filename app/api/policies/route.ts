// app/api/policies/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/policies?q=...
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const mode: Prisma.QueryMode = 'insensitive';

    const where: Prisma.PolicyWhereInput = q
      ? {
          userId,
          OR: [
            { nombre:       { contains: q, mode } },
            { apellido:     { contains: q, mode } },
            { dniCuit:      { contains: q, mode } },
            { patente:      { contains: q, mode } },
            { empresa:      { contains: q, mode } },
            { numeroPoliza: { contains: q, mode } },
          ],
        }
      : { userId };

    const rows = await prisma.policy.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/policies
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = {
      ...body,
      userId,
      fechaInicio:      body.fechaInicio ? new Date(body.fechaInicio) : null,
      fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : null,
    };

    const created = await prisma.policy.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una póliza con esa empresa y número' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
