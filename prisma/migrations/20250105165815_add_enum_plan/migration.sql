/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `TB_PLAN` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `TB_PLAN` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "enumPlan" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "TB_PLAN" DROP COLUMN "name",
ADD COLUMN     "name" "enumPlan" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TB_PLAN_name_key" ON "TB_PLAN"("name");
