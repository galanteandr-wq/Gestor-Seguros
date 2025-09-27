// scripts/import-from-sqlite.ts
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs/promises';

const prisma = new PrismaClient();

// ---------- Utils ----------
const toStr = (v: any) => (v == null ? '' : String(v).trim());
const toNull = (v: any) => {
  const s = toStr(v);
  return s === '' ? null : s;
};
const toIntOrNull = (v: any) => {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
};

function normalizePlate(raw: any): string | null {
  if (!raw) return null;
  let s = String(raw).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  const oldFmt = /^[A-Z]{3}\d{3}$/;       // AAA000
  const newFmt = /^[A-Z]{2}\d{3}[A-Z]{2}$/; // AA000AA
  if (oldFmt.test(s) || newFmt.test(s)) return s;
  return s || null;
}

// ---------- Tomar campos reales del modelo Policy en Prisma ----------
const policyFields = new Set(
  (Prisma as any)?.dmmf?.datamodel?.models
    ?.find((m: any) => m.name === 'Policy')
    ?.fields?.map((f: any) => f.name) ?? []
);

function fitToPolicy(input: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (policyFields.has(k)) out[k] = v;
  }
  return out;
}

// ---------- Descubrir tabla en SQLite ----------
function pickExistingTable(db: Database.Database, candidates: string[]) {
  const rows = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table'`
  ).all() as { name: string }[];
  const names = new Set(rows.map(r => r.name));
  for (const c of candidates) if (names.has(c)) return c;
  return null;
}

async function main() {
  console.log('Campos Policy en Prisma:', Array.from(policyFields).sort());

  const dbPath = process.argv[2] ?? path.join(process.cwd(), 'scripts', 'data', 'seguros.db');

  // Chequear que exista el archivo
  try {
    await fs.access(dbPath);
  } catch {
    console.error(`No se encontró la base SQLite en: ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });

  // Intentar tablas comunes (ajustá si tu tabla tiene otro nombre)
  const table =
    process.env.SQLITE_TABLE ||
    pickExistingTable(db, ['policies', 'policy', 'seguros', 'polizas', 'polizas_vehiculares']);

  if (!table) {
    console.error('No pude encontrar una tabla compatible (policies/policy/seguros/polizas).');
    process.exit(1);
  }

  console.log(`Leyendo filas desde tabla SQLite: ${table}`);

  const rows = db.prepare(`SELECT * FROM ${table}`).all() as any[];
  console.log(`Filas detectadas: ${rows.length}`);

  let ok = 0;
  let fail = 0;

  // ⚠️ Usá un userId válido; o pasalo por env/argv
  const userId = process.env.IMPORT_USER_ID ?? 'IMPORT-USER';

  for (const row of rows) {
    // --------- Mapeo flexible ES/EN ----------
    const empresa        = toStr( row.empresa ?? row.company ?? row.compania );
    const numeroPoliza   = toStr( row.numeroPoliza ?? row.policyNumber ?? row.poliza );

    // Persona (poner fallback si tu schema lo exige como requerido)
    const nombre         = toStr( row.nombre ?? row.name ) || 'N/A';
    const apellido       = toStr( row.apellido ?? row.lastName ?? row.apellidos ) || 'N/A';
    const dniCuit        = toNull( row.dniCuit ?? row.dni ?? row.cuit );

    // Vehículo
    const marca          = toNull( row.marca ?? row.brand );
    const modelo         = toNull( row.modelo ?? row.model );
    const anio           = toIntOrNull( row.anio ?? row.year );
    const patente        = normalizePlate( row.patente ?? row.plate ?? row.matricula );
    const color          = toNull( row.color );

    // Si tu schema NO tiene este campo, el filtro lo elimina
    const motorChasis    = toNull( row.motorChasis ?? row.engineChassis ?? row.nroMotorChasis );

    // Contacto / otros
    const telefono       = toNull( row.telefono ?? row.phone );
    const email          = toNull( row.email );
    const domicilio      = toNull( row.domicilio ?? row.address );
    const localidad      = toNull( row.localidad ?? row.city );
    const provincia      = toNull( row.provincia ?? row.province );
    const codigoPostal   = toNull( row.codigoPostal ?? row.postalCode ?? row.cp );
    const observaciones  = toNull( row.observaciones ?? row.notes );

    // Fechas / montos (ajustá si tu schema los tiene y son DateTime)
    const fechaVencimiento = toNull(row.fechaVencimiento);
    const fechaInicio      = toNull(row.fechaInicio);
    const estado           = toNull(row.estado);
    const prima            = toIntOrNull(row.prima);

    // --------- Candidato con todos los posibles campos ----------
    const candidate: Record<string, any> = {
      userId,

      // Identificación póliza
      empresa,
      numeroPoliza,

      // Persona
      nombre,
      apellido,
      dniCuit,

      // Vehículo
      marca,
      modelo,
      anio,
      patente,
      color,
      motorChasis, // si no existe en Policy, se descarta

      // Contacto / otros
      telefono,
      email,
      domicilio,
      localidad,
      provincia,
      codigoPostal,
      observaciones,

      // Fechas / montos
      // Si en tu schema son DateTime, conviene new Date(...)
      fechaVencimiento,
      fechaInicio,
      estado,
      prima,
    };

    // --------- Ajustar al modelo real de Prisma ----------
    const data = fitToPolicy(candidate) as any; // cast intencional para evitar errores de TS en build

    try {
      await prisma.policy.create({ data });
      ok++;
    } catch (e: any) {
      fail++;
      console.error('Error creando fila:', e?.code ?? e?.message ?? e);
    }
  }

  console.log(`Importación terminada: OK=${ok} FAIL=${fail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
