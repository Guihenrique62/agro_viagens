/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `transports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transports_name_key" ON "transports"("name");
