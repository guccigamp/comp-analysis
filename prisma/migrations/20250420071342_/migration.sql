/*
  Warnings:

  - Added the required column `companyId` to the `Facilty` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "legend_color" TEXT NOT NULL
);
INSERT INTO "new_Company" ("facility_id", "id", "legend_color", "name") SELECT "facility_id", "id", "legend_color", "name" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE UNIQUE INDEX "Company_facility_id_key" ON "Company"("facility_id");
CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE TABLE "new_Facilty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Facilty_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Facilty" ("address", "city", "id", "latitude", "longitude", "state", "zip") SELECT "address", "city", "id", "latitude", "longitude", "state", "zip" FROM "Facilty";
DROP TABLE "Facilty";
ALTER TABLE "new_Facilty" RENAME TO "Facilty";
CREATE INDEX "Facilty_state_idx" ON "Facilty"("state");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
