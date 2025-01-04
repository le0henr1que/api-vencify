/*
  Warnings:

  - You are about to drop the column `planId` on the `TB_ORGANIZATION` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `TB_QUOTA` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `TB_SUBSCRIPTION` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `TB_QUOTA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `TB_SUBSCRIPTION` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TB_QUOTA" DROP CONSTRAINT "TB_QUOTA_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "TB_SUBSCRIPTION" DROP CONSTRAINT "TB_SUBSCRIPTION_organizationId_fkey";

-- AlterTable
ALTER TABLE "TB_ORGANIZATION" DROP COLUMN "planId";

-- AlterTable
ALTER TABLE "TB_QUOTA" DROP COLUMN "organizationId",
ADD COLUMN     "user_id" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "TB_SUBSCRIPTION" DROP COLUMN "organizationId",
ADD COLUMN     "user_id" VARCHAR NOT NULL;

-- AddForeignKey
ALTER TABLE "TB_SUBSCRIPTION" ADD CONSTRAINT "TB_SUBSCRIPTION_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TB_USER"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_QUOTA" ADD CONSTRAINT "TB_QUOTA_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TB_USER"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
