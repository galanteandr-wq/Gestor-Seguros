import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function GET(req: Request) {
  const userId = await requireUserId()
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const where = q ? {
    userId,
    OR: [
      { nombre: { contains: q, mode: 'insensitive' } },
      { apellido: { contains: q, mode: 'insensitive' } },
      { dniCuit: { contains: q, mode: 'insensitive' } },
      { patente: { contains: q, mode: 'insensitive' } },
    ]
  } : { userId }
  const rows = await prisma.policy.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 100 })
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const userId = await requireUserId()
  const b = await req.json()
  // normalize & guard mínimos
  const pat = (b.patente || '').toString().replace(/[^A-Za-z0-9]/g,'').toUpperCase()
  const payload = {
    userId,
    nombre: String(b.nombre || ''),
    apellido: String(b.apellido || ''),
    dniCuit: b.dniCuit || null,
    telefono: b.telefono || null,
    email: b.email || null,
    direccion: b.direccion || null,
    marca: b.marca || null,
    modelo: b.modelo || null,
    anio: b.anio ? Number(b.anio) : null,
    patente: pat || null,
    color: b.color || null,
    chasisMotor: b.chasisMotor || null,
    empresa: b.empresa || null,
    numeroPoliza: b.numeroPoliza || null,
    fechaInicio: b.fechaInicio ? new Date(b.fechaInicio) : null,
    fechaVencimiento: b.fechaVencimiento ? new Date(b.fechaVencimiento) : null,
    monto: b.monto ? Number(b.monto) : null,
    cobertura: b.cobertura || null,
    estado: b.estado || 'Activa',
    observaciones: b.observaciones || null,
  }
  try {
    const row = await prisma.policy.create({ data: payload })
    return NextResponse.json(row, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 400 })
  }
}
