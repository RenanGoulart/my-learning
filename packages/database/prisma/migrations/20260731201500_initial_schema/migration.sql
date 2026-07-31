-- CreateTable
CREATE TABLE "trails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trail_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "position" INTEGER NOT NULL,
    "url" TEXT,
    "prompt" TEXT,
    "flashcard_front" TEXT,
    "flashcard_back" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resources_trail_id_fkey" FOREIGN KEY ("trail_id") REFERENCES "trails" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "practice_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resource_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "practice_answers_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_requirements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resource_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_requirements_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "study_check_ins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "local_date" TEXT NOT NULL,
    "note" TEXT,
    "duration_minutes" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "trails_updated_at_idx" ON "trails"("updated_at");

-- CreateIndex
CREATE INDEX "resources_status_updated_at_idx" ON "resources"("status", "updated_at");

-- CreateIndex
CREATE INDEX "resources_trail_id_updated_at_idx" ON "resources"("trail_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "resources_trail_id_position_key" ON "resources"("trail_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "practice_answers_resource_id_key" ON "practice_answers"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_requirements_resource_id_position_key" ON "project_requirements"("resource_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "study_check_ins_local_date_key" ON "study_check_ins"("local_date");
