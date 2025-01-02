/*
  Warnings:

  - You are about to drop the column `createdAt` on the `TB_PLAN` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_PLAN` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_PLAN` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_QUOTA` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_QUOTA` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_QUOTA` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_SUBSCRIPTION` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_USER` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TB_PLAN" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_QUOTA" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_SUBSCRIPTION" DROP COLUMN "deletedAt",
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_USER" DROP COLUMN "createdAt";
