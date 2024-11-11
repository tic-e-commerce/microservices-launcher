-- CreateEnum
CREATE TYPE "Products_Status" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "image_url" VARCHAR(255),
    "status" "Products_Status" NOT NULL DEFAULT 'ACTIVE',
    "creation_date" DATE NOT NULL,
    "update_date" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);
