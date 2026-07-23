-- AlterTable
ALTER TABLE "PortfolioItem" DROP COLUMN "imageKey",
DROP COLUMN "imageUrl",
ADD COLUMN     "imageContentType" TEXT NOT NULL,
ADD COLUMN     "imageData" BYTEA NOT NULL;
