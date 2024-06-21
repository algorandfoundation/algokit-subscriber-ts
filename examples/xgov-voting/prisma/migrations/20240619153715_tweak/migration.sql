/*
  Warnings:

  - You are about to drop the column `votingRoundQuestionId` on the `VoteCast` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VoteCast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voteId" TEXT NOT NULL,
    "questionOptionId" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "voteWeight" TEXT NOT NULL,
    CONSTRAINT "VoteCast_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VoteCast_questionOptionId_fkey" FOREIGN KEY ("questionOptionId") REFERENCES "VotingRoundQuestionOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VoteCast" ("id", "optionIndex", "questionOptionId", "voteId", "voteWeight") SELECT "id", "optionIndex", "questionOptionId", "voteId", "voteWeight" FROM "VoteCast";
DROP TABLE "VoteCast";
ALTER TABLE "new_VoteCast" RENAME TO "VoteCast";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
