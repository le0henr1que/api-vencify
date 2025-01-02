/*
  Warnings:

  - You are about to drop the column `createdAt` on the `TB_ADDRESS` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_ADDRESS` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_ADDRESS` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_ASSIGNMENT` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_ASSIGNMENT` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_AUDIT_LOG` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_ORGANIZATION` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TB_ORGANIZATION` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TB_ROLE` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TB_ROLE` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TB_ADDRESS" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_ASSIGNMENT" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_AUDIT_LOG" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TB_ORGANIZATION" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TB_ROLE" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);
