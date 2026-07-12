-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "clientName" TEXT,
    "telegramUsername" TEXT,
    "telegramId" TEXT,
    "phone" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "design" TEXT,
    "coatingStatus" TEXT,
    "desiredLength" TEXT,
    "clientComment" TEXT,
    "status" TEXT NOT NULL,
    "statusHistory" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL
);
