/*
  Warnings:

  - You are about to alter the column `watermark` on the `Watermark` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Watermark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "watermark" BIGINT NOT NULL,
    "updated" TEXT NOT NULL
);
INSERT INTO "new_Watermark" ("id", "updated", "watermark") SELECT "id", "updated", "watermark" FROM "Watermark";
DROP TABLE "Watermark";
ALTER TABLE "new_Watermark" RENAME TO "Watermark";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
