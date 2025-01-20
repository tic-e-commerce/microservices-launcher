/*
  Warnings:

  - You are about to drop the `PaymentEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "billing_details_id" INTEGER;

-- DropTable
DROP TABLE "PaymentEvent";

-- CreateTable
CREATE TABLE "BillingDetails" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billing_details_id_fkey" FOREIGN KEY ("billing_details_id") REFERENCES "BillingDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
