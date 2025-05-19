-- CreateTable
CREATE TABLE "transports" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "calculateKM" BOOLEAN NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("id")
);
