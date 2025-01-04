-- CreateEnum
CREATE TYPE "LoginMethodEnum" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "NotificationTimeEnum" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'HALF_MONTHLY', 'THIRTY_MONTHLY');

-- AlterTable
ALTER TABLE "TB_USER" ADD COLUMN     "login_method" "LoginMethodEnum" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "notification_time" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "notification_time_enum" "NotificationTimeEnum" NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "notifications_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "TB_EMAIL_VERIFICATIONS" (
    "_id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "TB_EMAIL_VERIFICATIONS_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TB_EMAIL_VERIFICATIONS_email_key" ON "TB_EMAIL_VERIFICATIONS"("email");
