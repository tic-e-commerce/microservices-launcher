/*
  Warnings:

  - The `shipping_method` column on the `carts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('STANDARD', 'EXPRESS', 'STORE');

-- AlterTable
ALTER TABLE "carts" DROP COLUMN "shipping_method",
ADD COLUMN     "shipping_method" "ShippingMethod" NOT NULL DEFAULT 'STANDARD',
ALTER COLUMN "shipping_cost" SET DEFAULT 3.99;
