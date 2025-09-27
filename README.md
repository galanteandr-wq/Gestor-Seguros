# Gestor de Seguros — Starter (Next.js + Tailwind + Prisma + Clerk + PostgreSQL)

Este repo es el punto de partida para migrar tu app a la web con una UI moderna.

## 0) Requisitos
- Node.js 20+ (recomendado: nvm)
- Cuenta en **Vercel** (deploy), **Neon** o **Supabase** (PostgreSQL), y **Clerk** (Auth).

## 1) Inicializar proyecto
```bash
npm install
cp .env.example .env
# completá las variables de Clerk y DATABASE_URL (Neon/Supabase)
```

## 2) DB y Prisma
```bash
npx prisma generate
npm run prisma:migrate -- --name init
npm run prisma:studio   # opcional, explorar base
```

## 3) Ejecutar en local
```bash
npm run dev
# Abrí http://localhost:3000/sign-in y creá tu usuario
# Luego visitá http://localhost:3000/debug/me para ver tu userId
```

## 4) Importar datos desde SQLite
1. Copiá tu `seguros.db` dentro de `scripts/data/`.
2. Seteá en `.env`:
   - `IMPORT_USER_ID=<tu Clerk user id>` (obtenido en /debug/me)
   - `SQLITE_PATH=./scripts/data/seguros.db`
3. Ejecutá:
```bash
npm run import:sqlite
```

> El import respeta el índice único por `(userId, empresa, numeroPoliza)`. Si falla por duplicados, primero limpiá tu base local (como ya hiciste).

## 5) Deploy en Vercel
- Conectá el repo a Vercel.
- Agregá en **Settings → Environment Variables**: `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_APP_URL`.
- Deploy.
- Configurá **Neon/Supabase** con **SSL** y backups.
- (Opcional) Agregá CRON de Vercel para avisos de vencimientos.

## 6) UI (shadcn/ui) — opcional pero recomendado
```bash
# inicializar shadcn
npx shadcn@latest init
# luego podés agregar componentes
npx shadcn@latest add button card input table dialog toast
```
Reemplazá las clases Tailwind en `app/` y `components/` por los componentes de shadcn para un look & feel premium.

---

## Estructura
- `app/` Next.js App Router (dashboard, policies y APIs)
- `lib/` prisma client y helpers
- `prisma/` schema y migraciones
- `scripts/` utilidades (importar desde SQLite)

## Notas
- Autenticación con **Clerk**; si preferís **Auth0** te indico los cambios.
- Al crear pólizas nuevas, el **userId** del usuario autenticado se asocia automáticamente.
- El campo **patente** se normaliza a mayúsculas en el API.

¡Listo! Cualquier duda, te guío paso a paso.
