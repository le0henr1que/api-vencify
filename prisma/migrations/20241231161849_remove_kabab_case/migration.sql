/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `TB_ORGANIZATION` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TB_ORGANIZATION" DROP COLUMN "deletedAt",
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);
