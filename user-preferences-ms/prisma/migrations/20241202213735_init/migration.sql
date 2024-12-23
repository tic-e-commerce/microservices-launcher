-- CreateTable
CREATE TABLE "favorite_products" (
    "favorite_product_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_products_pkey" PRIMARY KEY ("favorite_product_id")
);
