/*
  Warnings:

  - You are about to drop the `CartItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CartItem";

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);
