import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";

process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.JWT_SECRET = "test-only-jwt-secret-not-for-production";
process.env.USERS_DATA_PATH = join(
  tmpdir(),
  `turnos-red-users-${process.pid}-${randomUUID()}.json`,
);
