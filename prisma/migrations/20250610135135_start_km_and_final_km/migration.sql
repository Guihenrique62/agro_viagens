/*
  Warnings:

  - Added the required column `endKM` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startKM` to the `trips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "endKM" INTEGER NOT NULL,
ADD COLUMN     "startKM" INTEGER NOT NULL;
