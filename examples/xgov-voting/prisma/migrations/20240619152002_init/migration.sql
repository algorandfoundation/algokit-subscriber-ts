-- CreateTable
CREATE TABLE "VotingRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VotingRoundQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "votingRoundId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    CONSTRAINT "VotingRoundQuestion_votingRoundId_fkey" FOREIGN KEY ("votingRoundId") REFERENCES "VotingRound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VotingRoundQuestionOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    CONSTRAINT "VotingRoundQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "VotingRoundQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "castedAt" TEXT NOT NULL,
    "voterAddress" TEXT NOT NULL,
    "votingRoundId" TEXT NOT NULL,
    CONSTRAINT "Vote_votingRoundId_fkey" FOREIGN KEY ("votingRoundId") REFERENCES "VotingRound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoteCast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voteId" TEXT NOT NULL,
    "questionOptionId" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "voteWeight" TEXT NOT NULL,
    "votingRoundQuestionId" TEXT,
    CONSTRAINT "VoteCast_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VoteCast_questionOptionId_fkey" FOREIGN KEY ("questionOptionId") REFERENCES "VotingRoundQuestionOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VoteCast_votingRoundQuestionId_fkey" FOREIGN KEY ("votingRoundQuestionId") REFERENCES "VotingRoundQuestion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Watermark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "watermark" INTEGER NOT NULL,
    "updated" TEXT NOT NULL
);
