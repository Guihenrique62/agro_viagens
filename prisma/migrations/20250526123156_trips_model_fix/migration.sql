/*
  Warnings:

  - You are about to drop the column `acompanhante` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `destino` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `motivo` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `value_adiantamento` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the `expenses_children` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `advance_value` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `trips` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expenses_children" DROP CONSTRAINT "expenses_children_expensesId_fkey";

-- AlterTable
ALTER TABLE "trip_transports" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "trips" DROP COLUMN "acompanhante",
DROP COLUMN "destino",
DROP COLUMN "motivo",
DROP COLUMN "value_adiantamento",
ADD COLUMN     "advance_value" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "escort" TEXT,
ADD COLUMN     "reason" TEXT NOT NULL;

-- DropTable
DROP TABLE "expenses_children";

-- CreateTable
CREATE TABLE "trip_expenses" (
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
    "tripId" INTEGER NOT NULL,

    CONSTRAINT "trip_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trip_expenses_tripId_expensesId_key" ON "trip_expenses"("tripId", "expensesId");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_id_fkey" FOREIGN KEY ("id") REFERENCES "transports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_expensesId_fkey" FOREIGN KEY ("expensesId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
