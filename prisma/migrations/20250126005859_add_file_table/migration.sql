/*
  Warnings:

  - You are about to drop the column `mediaId` on the `TB_USER` table. All the data in the column will be lost.
  - You are about to drop the `TB_MEDIA` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TB_USER" DROP CONSTRAINT "TB_USER_mediaId_fkey";

-- AlterTable
ALTER TABLE "TB_USER" DROP COLUMN "mediaId",
ADD COLUMN     "file_id" TEXT;

-- DropTable
DROP TABLE "TB_MEDIA";

-- CreateTable
CREATE TABLE "FILE" (
    "_id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(255) NOT NULL,
    "s3_path" VARCHAR(500) NOT NULL,
    "entity_name" "AssignmentsEnum" NOT NULL,
    "entity_id" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "FILE_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "TB_USER" ADD CONSTRAINT "TB_USER_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "FILE"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
