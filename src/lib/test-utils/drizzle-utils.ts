import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function pushSchema(databaseUrl: string) {
  console.log(process.cwd());
  try {
    await execFileAsync("./node_modules/.bin/drizzle-kit", ["push", "--config=drizzle.config.ts", "--force"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        POSTGRES: databaseUrl,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
