/*
  Warnings:

  - You are about to drop the column `stripe_payment_intent_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_session_id` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_payment_id]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripe_payment_id` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payment_stripe_payment_intent_id_key";

-- DropIndex
DROP INDEX "Payment_stripe_session_id_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripe_payment_intent_id",
DROP COLUMN "stripe_session_id",
ADD COLUMN     "stripe_payment_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripe_payment_id_key" ON "Payment"("stripe_payment_id");
