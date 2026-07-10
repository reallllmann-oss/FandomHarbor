import { execFileSync, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const status = JSON.parse(
  execFileSync("supabase", ["status", "-o", "json"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }),
);
const apiUrl = new URL(status.API_URL);

if (!["127.0.0.1", "localhost", "::1"].includes(apiUrl.hostname)) {
  throw new Error("Local QA Web refused: Supabase API is not local");
}

const child = spawn("pnpm", ["--filter", "@fandom-harbor/web", "dev"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exitCode = code ?? 1;
});
