/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp_number]` on the table `TB_USER` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `TB_USER` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TB_USER" ADD COLUMN     "phone_number" VARCHAR(255),
ADD COLUMN     "whatsapp_number" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "TB_USER_whatsapp_number_key" ON "TB_USER"("whatsapp_number");

-- CreateIndex
CREATE UNIQUE INDEX "TB_USER_phone_number_key" ON "TB_USER"("phone_number");
