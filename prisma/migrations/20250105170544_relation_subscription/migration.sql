/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `TB_SUBSCRIPTION` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TB_SUBSCRIPTION" DROP CONSTRAINT "TB_SUBSCRIPTION_user_id_fkey";

-- AlterTable
ALTER TABLE "TB_SUBSCRIPTION" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TB_USER" ADD COLUMN     "subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TB_SUBSCRIPTION_user_id_key" ON "TB_SUBSCRIPTION"("user_id");

-- AddForeignKey
ALTER TABLE "TB_SUBSCRIPTION" ADD CONSTRAINT "TB_SUBSCRIPTION_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TB_USER"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
