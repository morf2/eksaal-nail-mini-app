-- CreateTable
CREATE TABLE "BotSubscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "username" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BotSubscriber_chatId_key" ON "BotSubscriber"("chatId");
