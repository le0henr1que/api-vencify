/*
  Warnings:

  - You are about to drop the column `createdAt` on the `TB_BATCH` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `TB_BATCH` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `TB_BATCH` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_BATCH` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_CATEGORY` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_CATEGORY` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_CATEGORY` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_PRODUCT` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_PRODUCT` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_PRODUCT` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_SUPPLIER` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_SUPPLIER` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_USER` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_USER` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TB_BATCH" DROP CONSTRAINT "TB_BATCH_supplierId_fkey";

-- AlterTable
ALTER TABLE "TB_BATCH" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "supplierId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "expires_at" TIMESTAMPTZ(3),
ADD COLUMN     "supplier_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_CATEGORY" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_PRODUCT" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_SUPPLIER" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_USER" DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AddForeignKey
ALTER TABLE "TB_BATCH" ADD CONSTRAINT "TB_BATCH_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "TB_SUPPLIER"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
