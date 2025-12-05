/*
  Warnings:

  - Added the required column `price` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELED');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
