/*
  Warnings:

  - You are about to drop the column `file_id` on the `TB_USER` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TB_USER" DROP CONSTRAINT "TB_USER_file_id_fkey";

-- AlterTable
ALTER TABLE "TB_USER" DROP COLUMN "file_id",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "fileId" TEXT;

-- AddForeignKey
ALTER TABLE "TB_USER" ADD CONSTRAINT "TB_USER_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FILE"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
