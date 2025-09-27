-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dniCuit" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "anio" INTEGER,
    "patente" TEXT,
    "color" TEXT,
    "chasisMotor" TEXT,
    "empresa" TEXT,
    "numeroPoliza" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "monto" DOUBLE PRECISION,
    "cobertura" TEXT,
    "estado" TEXT DEFAULT 'Activa',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Policy_userId_idx" ON "Policy"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_userId_empresa_numeroPoliza_key" ON "Policy"("userId", "empresa", "numeroPoliza");
