-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('EmAndamento', 'Finalizada', 'Cancelada');

-- CreateTable
CREATE TABLE "expenses_children" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "typePayment" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "taxDocument" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proof" TEXT NOT NULL,
    "expensesId" INTEGER NOT NULL,

    CONSTRAINT "expenses_children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "destino" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "acompanhante" TEXT,
    "type" TEXT NOT NULL,
    "value_adiantamento" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'EmAndamento',
    "expensesId" INTEGER NOT NULL,
    "parameters_kmId" INTEGER NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_transports" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "transportId" INTEGER NOT NULL,

    CONSTRAINT "trip_transports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trip_transports_tripId_transportId_key" ON "trip_transports"("tripId", "transportId");

-- AddForeignKey
ALTER TABLE "expenses_children" ADD CONSTRAINT "expenses_children_expensesId_fkey" FOREIGN KEY ("expensesId") REFERENCES "expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_expensesId_fkey" FOREIGN KEY ("expensesId") REFERENCES "expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_parameters_kmId_fkey" FOREIGN KEY ("parameters_kmId") REFERENCES "parameters_km"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_transports" ADD CONSTRAINT "trip_transports_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_transports" ADD CONSTRAINT "trip_transports_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "transports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
