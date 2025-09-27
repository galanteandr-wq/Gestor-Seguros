// scripts/import-from-csv.ts
// Ejecutar con: npm run import:csv
// Requisitos: npm i csv-parse
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

function toDate(s?: string | number | null): Date | null {
  if (!s) return null
  const str = String(s).trim()
  if (!str) return null
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + 'T00:00:00')
  // DD/MM/YYYY
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const [, d, mo, y] = m
    const mm = mo.padStart(2, '0')
    const dd = d.padStart(2, '0')
    return new Date(`${y}-${mm}-${dd}T00:00:00`)
  }
  return null
}

function toInt(s?: string | number | null): number | null {
  if (s === null || s === undefined) return null
  const n = parseInt(String(s).replace(/[^\d-]/g, ''), 10)
  return Number.isFinite(n) ? n : null
}

function toNumber(s?: string | number | null): number | null {
  if (s === null || s === undefined) return null
  let str = String(s).trim()
  if (!str) return null
  // Quitar separadores de miles comunes y normalizar decimal
  str = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(str)
  return Number.isFinite(n) ? n : null
}

function normPlate(p?: string | null): string | null {
  if (!p) return null
  return String(p).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

async function main() {
  const userId = process.env.IMPORT_USER_ID
  if (!userId) {
    console.error('Falta IMPORT_USER_ID en .env')
    process.exit(1)
  }
  const csvPath = process.env.CSV_PATH || path.join('scripts', 'data', 'policies.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('No existe el CSV en:', csvPath)
    process.exit(1)
  }
  const content = fs.readFileSync(csvPath, 'utf8')
  const rows: any[] = parse(content, { columns: true, skip_empty_lines: true, bom: true, trim: true })

  let ok = 0, dup = 0, bad = 0
  for (const r of rows) {
    try {
      const data = {
        userId,
        company: (r['Empresa'] ?? '').toString().trim(),
        policyNumber: (r['Nº de póliza'] ?? '').toString().trim(),
        brand: (r['Marca'] ?? null) ? String(r['Marca']).trim() : null,
        model: (r['Modelo'] ?? null) ? String(r['Modelo']).trim() : null,
        year: toInt(r['Año']),
        plate: normPlate(r['Patente'] ?? null),
        color: (r['Color'] ?? null) ? String(r['Color']).trim() : null,
        engineChassis: (r['Chasis/Motor'] ?? null) ? String(r['Chasis/Motor']).trim() : null,
        startDate: toDate(r['Inicio'] ?? null),
        endDate: toDate(r['Vencimiento'] ?? null),
        premium: toNumber(r['Monto / Prima'] ?? null),
        coverage: (r['Cobertura'] ?? null) ? String(r['Cobertura']).trim() : null,
        status: (r['Estado'] ?? null) ? String(r['Estado']).trim() : null,
        notes: (r['Observaciones'] ?? null) ? String(r['Observaciones']).trim() : null,
        dni: (r['DNI'] ?? null) ? String(r['DNI']).trim() : null,
        cuit: (r['CUIT'] ?? null) ? String(r['CUIT']).trim() : null,
      }

      if (!data.company || !data.policyNumber) {
        bad++
        console.warn('Fila sin Empresa o Nº de póliza. Saltando:', r)
        continue
      }

      try {
        await prisma.policy.create({ data })
        ok++
      } catch (e: any) {
        if (e?.code === 'P2002') {
          dup++
          console.warn('Duplicado (userId, empresa, numeroPoliza):', data.userId, data.company, data.policyNumber)
        } else {
          bad++
          console.error('Error al insertar fila:', e?.message || e)
        }
      }
    } catch (e: any) {
      bad++
      console.error('Error procesando fila:', e?.message || e)
    }
  }

  console.log(`Importación CSV terminada: OK=${ok} DUP=${dup} BAD=${bad}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
