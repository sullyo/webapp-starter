import fs from "node:fs";
import dotenv from "dotenv";

const envPath = __dirname + `/../config/.env`;

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
