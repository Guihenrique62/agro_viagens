-- AlterTable
ALTER TABLE "passwordReset" ADD COLUMN     "id" UUID;

UPDATE "passwordReset" SET "id" = gen_random_uuid();
