/*
  Warnings:

  - You are about to drop the `catalog_item_payment_system` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "catalog_item_payment_system" DROP CONSTRAINT "catalog_item_payment_system_catalog_category_id_fkey";

-- DropForeignKey
ALTER TABLE "catalog_item_payment_system" DROP CONSTRAINT "catalog_item_payment_system_payment_system_id_fkey";

-- DropTable
DROP TABLE "catalog_item_payment_system";

-- CreateTable
CREATE TABLE "catalog_category_payment_system" (
    "id" UUID NOT NULL,
    "catalog_category_id" UUID NOT NULL,
    "payment_system_id" UUID NOT NULL,
    "position" INTEGER,

    CONSTRAINT "catalog_category_payment_system_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "catalog_category_payment_system" ADD CONSTRAINT "catalog_category_payment_system_catalog_category_id_fkey" FOREIGN KEY ("catalog_category_id") REFERENCES "catalog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_category_payment_system" ADD CONSTRAINT "catalog_category_payment_system_payment_system_id_fkey" FOREIGN KEY ("payment_system_id") REFERENCES "payment_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
