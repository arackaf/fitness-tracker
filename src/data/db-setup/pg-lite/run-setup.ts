import once from "lodash/once";
import dotenv from "dotenv";

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { runDDL } from "./execute-setup-ddl";

const thisFileDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(thisFileDir, "../../.env") });

export const setup = once(() => runDDL());
