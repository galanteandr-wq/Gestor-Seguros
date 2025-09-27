import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId()
  const row = await prisma.policy.findFirst({ where: { id: params.id, userId } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId()
  const b = await req.json()
  try {
    const row = await prisma.policy.update({
      where: { id: params.id },
      data: { ...b },
    })
    if (row.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId()
  const row = await prisma.policy.findFirst({ where: { id: params.id, userId } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.policy.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
