-- The original init migration created "totalPrice" as REAL (4-byte float). Prisma's
-- Float scalar maps to DOUBLE PRECISION (8-byte) for postgresql by default — this
-- migration aligns the column with that, confirmed via
-- `prisma migrate diff --from-empty --to-schema-datamodel` against the current schema,
-- which showed DOUBLE PRECISION as the canonical type. Not a correctness bug for the
-- values actually stored (prices comfortably fit REAL's precision), but leaving the
-- mismatch in place risks a false-positive drift warning if `prisma migrate dev` is
-- ever run against this history.
ALTER TABLE "Booking" ALTER COLUMN "totalPrice" TYPE DOUBLE PRECISION;
