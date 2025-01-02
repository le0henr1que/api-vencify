/*
  Warnings:

  - You are about to drop the `TB_CELL` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TB_PERSON` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TB_CELL" DROP CONSTRAINT "TB_CELL_userId_fkey";

-- DropForeignKey
ALTER TABLE "TB_PERSON" DROP CONSTRAINT "TB_PERSON_cellId_fkey";

-- AlterTable
ALTER TABLE "TB_ORGANIZATION" ADD COLUMN     "address_id" VARCHAR;

-- DropTable
DROP TABLE "TB_CELL";

-- DropTable
DROP TABLE "TB_PERSON";

-- CreateTable
CREATE TABLE "TB_ADDRESS" (
    "_id" TEXT NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "number" VARCHAR(50),
    "complement" VARCHAR(255),
    "neighborhood" VARCHAR(255),
    "city" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "TB_ADDRESS_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "TB_PRODUCT" (
    "_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "price" DECIMAL(10,2) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "validate" TIMESTAMPTZ(3),
    "local" VARCHAR(255),
    "bar_code" VARCHAR(255),
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "category_id" TEXT,

    CONSTRAINT "TB_PRODUCT_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "TB_BATCH" (
    "_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "batchCode" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "supplierId" TEXT,

    CONSTRAINT "TB_BATCH_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "TB_SUPPLIER" (
    "_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contactInfo" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "TB_SUPPLIER_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "TB_CATEGORY" (
    "_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "supplier_id" TEXT NOT NULL,

    CONSTRAINT "TB_CATEGORY_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "TB_ORGANIZATION" ADD CONSTRAINT "TB_ORGANIZATION_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "TB_ADDRESS"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_PRODUCT" ADD CONSTRAINT "TB_PRODUCT_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "TB_CATEGORY"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_BATCH" ADD CONSTRAINT "TB_BATCH_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "TB_PRODUCT"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_BATCH" ADD CONSTRAINT "TB_BATCH_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "TB_SUPPLIER"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_CATEGORY" ADD CONSTRAINT "TB_CATEGORY_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "TB_SUPPLIER"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
