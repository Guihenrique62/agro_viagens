-- CreateTable
CREATE TABLE "passwordReset" (
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passwordReset_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "passwordReset_token_key" ON "passwordReset"("token");

-- AddForeignKey
ALTER TABLE "passwordReset" ADD CONSTRAINT "passwordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
