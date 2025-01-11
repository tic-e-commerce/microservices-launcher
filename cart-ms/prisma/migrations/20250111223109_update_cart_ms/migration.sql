/*
  Warnings:

  - The primary key for the `cart_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `cart_items` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_pkey",
DROP COLUMN "id",
ADD COLUMN     "cart_item_id" SERIAL NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("cart_item_id");
