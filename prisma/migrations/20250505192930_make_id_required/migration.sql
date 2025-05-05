/*
  Warnings:

  - The primary key for the `passwordReset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `id` on table `passwordReset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "passwordReset" DROP CONSTRAINT "passwordReset_pkey",
ALTER COLUMN "id" SET NOT NULL,
ADD CONSTRAINT "passwordReset_pkey" PRIMARY KEY ("id");
