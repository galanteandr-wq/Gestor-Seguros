import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = { params: { id: string } };

// GET /api/policies/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const row = await prisma.policy.findFirst({ where: { id: params.id, userId } });
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/policies/[id]
export async function PUT(req: Request, { params }: Params) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const current = await prisma.policy.findFirst({ where: { id: params.id, userId } });
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data = await req.json();
    delete data.id;
    delete data.userId;

    const updated = await prisma.policy.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicado (empresa + número)' },
        { status: 409 }
      );
    }
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/policies/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const current = await prisma.policy.findFirst({ where: { id: params.id, userId } });
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.policy.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



