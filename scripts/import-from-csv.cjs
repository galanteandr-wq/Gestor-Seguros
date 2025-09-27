// scripts/import-from-csv.cjs
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient()

function toDate(s) {
  if (!s) return null
  const str = String(s).trim()
  if (!str) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + 'T00:00:00')
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const d = m[1].padStart(2, '0')
    const mo = m[2].padStart(2, '0')
    const y = m[3]
    return new Date(`${y}-${mo}-${d}T00:00:00`)
  }
  return null
}

function toInt(s) {
  if (s === null || s === undefined) return null
  const n = parseInt(String(s).replace(/[^\d-]/g, ''), 10)
  return Number.isFinite(n) ? n : null
}

function toNumber(s) {
  if (s === null || s === undefined) return null
  let str = String(s).trim()
  if (!str) return null
  str = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(str)
  return Number.isFinite(n) ? n : null
}

function normPlate(p) {
  if (!p) return null
  return String(p).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

async function main() {
  const userId = process.env.IMPORT_USER_ID
  if (!userId) { console.error('Falta IMPORT_USER_ID en .env'); process.exit(1) }

  const csvPath = process.env.CSV_PATH || path.join('scripts', 'data', 'policies.csv')
  if (!fs.existsSync(csvPath)) { console.error('No existe el CSV en:', csvPath); process.exit(1) }

  const content = fs.readFileSync(csvPath, 'utf8')
  const rows = parse(content, { columns: true, skip_empty_lines: true, bom: true, trim: true })

  let ok = 0, dup = 0, bad = 0
  for (const r of rows) {
    try {
      const data = {
        userId,
        company: (r['Empresa'] ?? '').toString().trim(),
        policyNumber: (r['Nº de póliza'] ?? '').toString().trim(),
        brand: r['Marca'] ? String(r['Marca']).trim() : null,
        model: r['Modelo'] ? String(r['Modelo']).trim() : null,
        year: toInt(r['Año']),
        plate: normPlate(r['Patente']),
        color: r['Color'] ? String(r['Color']).trim() : null,
        engineChassis: r['Chasis/Motor'] ? String(r['Chasis/Motor']).trim() : null,
        startDate: toDate(r['Inicio']),
        endDate: toDate(r['Vencimiento']),
        premium: toNumber(r['Monto / Prima']),
        coverage: r['Cobertura'] ? String(r['Cobertura']).trim() : null,
        status: r['Estado'] ? String(r['Estado']).trim() : null,
        notes: r['Observaciones'] ? String(r['Observaciones']).trim() : null,
        dni: r['DNI'] ? String(r['DNI']).trim() : null,
        cuit: r['CUIT'] ? String(r['CUIT']).trim() : null,
      }

      if (!data.company || !data.policyNumber) { bad++; console.warn('Fila incompleta:', r); continue }

      try {
        await prisma.policy.create({ data })
        ok++
      } catch (e) {
        if (e?.code === 'P2002') { dup++; console.warn('Duplicado:', data.userId, data.company, data.policyNumber) }
        else { bad++; console.error('Error al insertar:', e?.message || e) }
      }
    } catch (e) { bad++; console.error('Error procesando fila:', e?.message || e) }
  }

  console.log(`Importación CSV terminada: OK=${ok} DUP=${dup} BAD=${bad}`)
  await prisma.$disconnect()
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1) })
