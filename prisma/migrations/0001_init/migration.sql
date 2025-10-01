-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE "TimeEntryType" AS ENUM ('IN', 'OUT');
CREATE TYPE "TimeEntrySource" AS ENUM ('WEB', 'AUTO', 'ADMIN');
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED', 'CORRECTED');
CREATE TYPE "VacationSource" AS ENUM ('A3', 'LOCAL');
CREATE TYPE "ProjectSource" AS ENUM ('BC', 'LOCAL');
CREATE TYPE "IdempotencyStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "oidcSub" TEXT UNIQUE,
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Project" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" TEXT UNIQUE,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "source" "ProjectSource" NOT NULL DEFAULT 'LOCAL',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "EmployeeProjectPermission" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "projectId" UUID NOT NULL REFERENCES "Project"("id") ON DELETE RESTRICT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "EmployeeProjectPermission_userId_projectId_key" UNIQUE ("userId", "projectId")
);

CREATE TABLE "TimeEntry" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "type" "TimeEntryType" NOT NULL,
    "occurredAtUtc" TIMESTAMPTZ NOT NULL,
    "occurredAtLocal" TIMESTAMPTZ NOT NULL,
    "localDate" TEXT NOT NULL,
    "source" "TimeEntrySource" NOT NULL DEFAULT 'WEB',
    "idempotencyKey" TEXT UNIQUE,
    "notes" TEXT,
    "createdBy" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Shift" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "startEntryId" UUID NOT NULL REFERENCES "TimeEntry"("id") ON DELETE RESTRICT,
    "endEntryId" UUID REFERENCES "TimeEntry"("id"),
    "durationMinutes" INTEGER DEFAULT 0,
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "LeaveType" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL
);

CREATE TABLE "VacationDay" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "date" TEXT NOT NULL,
    "leaveTypeId" UUID REFERENCES "LeaveType"("id"),
    "source" "VacationSource" NOT NULL DEFAULT 'A3',
    "externalRef" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "VacationDay_userId_date_key" UNIQUE ("userId", "date")
);

CREATE TABLE "MonthlyAllocation" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "month" TEXT NOT NULL,
    "baseHours" DECIMAL(10,2) NOT NULL,
    "extraHours" DECIMAL(10,2) NOT NULL,
    "finalized" BOOLEAN NOT NULL DEFAULT FALSE,
    "finalizedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "MonthlyAllocation_userId_month_key" UNIQUE ("userId", "month")
);

CREATE TABLE "MonthlyProjectAllocation" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "monthlyAllocationId" UUID NOT NULL REFERENCES "MonthlyAllocation"("id") ON DELETE RESTRICT,
    "projectId" UUID NOT NULL REFERENCES "Project"("id") ON DELETE RESTRICT,
    "hours" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "MonthlyProjectAllocation_monthlyAllocationId_projectId_key" UNIQUE ("monthlyAllocationId", "projectId")
);

CREATE TABLE "AuditLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "actorUserId" UUID REFERENCES "User"("id"),
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'settings',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "retroEditDaysLimit" INTEGER NOT NULL DEFAULT 30,
    "auditRetentionDays" INTEGER NOT NULL DEFAULT 365,
    "pwaEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "weekendWork" JSONB,
    "holidaysRegion" TEXT NOT NULL DEFAULT 'ES-AN'
);

CREATE TABLE "Holiday" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "region" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isWorkingDay" BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT "Holiday_region_date_key" UNIQUE ("region", "date")
);

CREATE TABLE "IdempotencyKey" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL UNIQUE,
    "requestHash" TEXT,
    "responseHash" TEXT,
    "status" "IdempotencyStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX "TimeEntry_userId_localDate_idx" ON "TimeEntry"("userId", "localDate");
CREATE INDEX "Shift_userId_status_idx" ON "Shift"("userId", "status");
CREATE INDEX "VacationDay_date_idx" ON "VacationDay"("date");
CREATE INDEX "AuditLog_entity_entityId_createdAt_idx" ON "AuditLog"("entity", "entityId", "createdAt");
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");
