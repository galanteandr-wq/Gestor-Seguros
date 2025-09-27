// scripts/import-from-csv.ts
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Utilidades
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
  const oldFmt = /^[A-Z]{3}\d{3}$/;      // AAA000
  const newFmt = /^[A-Z]{2}\d{3}[A-Z]{2}$/; // AA000AA
  if (oldFmt.test(s) || newFmt.test(s)) return s;
  return s || null;
}

// === Filtrado dinámico según tu schema ===
// Tomamos los nombres de campos reales de "Policy" desde el DMMF de Prisma
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

async function main() {
  // Mostramos los campos que Prisma ve en tu modelo Policy (útil para depurar)
  console.log('Campos Policy en Prisma:', Array.from(policyFields).sort());

  const csvPath =
    process.argv[2] ?? path.join(process.cwd(), 'scripts', 'data', 'seguros.csv');
  console.log(`Leyendo CSV: ${csvPath}`);

  const buf = await fs.readFile(csvPath);
  const records: any[] = parse(buf, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Filas detectadas: ${records.length}`);

  let ok = 0;
  let fail = 0;

  // ⚠️ Cambiá esto por el userId real, o pásalo por argv[3]
  const userId = process.env.IMPORT_USER_ID ?? 'IMPORT-USER';

  for (const row of records) {
    // Sinónimos comunes (es/en)
    const empresa        = toStr( row.empresa ?? row.company ?? row.compania );
    const numeroPoliza   = toStr( row.numeroPoliza ?? row.policyNumber ?? row.poliza );

    // Persona (garantizamos no vacíos si tu schema los exige)
    const nombre         = toStr( row.nombre ?? row.name ) || 'N/A';
    const apellido       = toStr( row.apellido ?? row.lastName ?? row.apellidos ) || 'N/A';
    const dniCuit        = toNull( row.dniCuit ?? row.dni ?? row.cuit );

    // Vehículo
    const marca          = toNull( row.marca ?? row.brand );
    const modelo         = toNull( row.modelo ?? row.model );
    const anio           = toIntOrNull( row.anio ?? row.year );
    const patente        = normalizePlate( row.patente ?? row.plate ?? row.matricula );
    const color          = toNull( row.color );

    // ⚠️ Este campo es el conflictivo: en tu schema NO existe "motorChasis".
    // Tal vez se llame "nroMotorChasis", "motor", "chasis", etc.
    // Lo dejamos mapeado como "motorChasis" pero el filtro lo eliminará si no existe.
    const motorChasis    = toNull( row.motorChasis ?? row.engineChassis );

    // Contacto / otros (ajusta nombres según tu schema real)
    const telefono       = toNull( row.telefono ?? row.phone );
    const email          = toNull( row.email );
    const domicilio      = toNull( row.domicilio ?? row.address );
    const localidad      = toNull( row.localidad ?? row.city );
    const provincia      = toNull( row.provincia ?? row.province );
    const codigoPostal   = toNull( row.codigoPostal ?? row.postalCode ?? row.cp );
    const observaciones  = toNull( row.observaciones ?? row.notes );

    // Fechas / montos si existieran en tu schema (de lo contrario se eliminarán por el filtro)
    const fechaVencimiento = toNull(row.fechaVencimiento);
    const fechaInicio      = toNull(row.fechaInicio);
    const estado           = toNull(row.estado);
    const prima            = toIntOrNull(row.prima);

    // Armamos un "candidato" con todos los posibles campos
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
      motorChasis, // <- si NO existe en tu schema, se descarta automáticamente

      // Contacto / otros
      telefono,
      email,
      domicilio,
      localidad,
      provincia,
      codigoPostal,
      observaciones,

      // Fechas / montos (si tu schema los tiene)
      // ⚠️ Si son DateTime, conviene parsear a Date: new Date(...)
      fechaVencimiento,
      fechaInicio,
      estado,
      prima,
    };

    // Nos quedamos SOLO con los campos que existen en el modelo Policy
    const data = fitToPolicy(candidate) as any;

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
