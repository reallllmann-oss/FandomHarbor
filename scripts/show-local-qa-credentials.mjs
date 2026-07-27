import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import invitationCodeContract from "../packages/services/src/invitation-code-contract.json" with { type: "json" };

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const credentialPath = resolve(projectRoot, ".local/qa-fixture.json");
const checkOnly = process.argv.includes("--check");

function isStandardInvitationCode(value) {
  return new RegExp(invitationCodeContract.pattern).test(value);
}

function isCredentialRecord(value) {
  return (
    value?.environment === "local-only" &&
    typeof value.author?.registrationName === "string" &&
    typeof value.author?.password === "string" &&
    typeof value.author?.slug === "string" &&
    typeof value.reader?.registrationName === "string" &&
    typeof value.reader?.password === "string" &&
    typeof value.invitationCode === "string" &&
    isStandardInvitationCode(value.invitationCode)
  );
}

async function main() {
  let fileStatus;
  let credentials;

  try {
    fileStatus = await stat(credentialPath);
    credentials = JSON.parse(await readFile(credentialPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "Local QA credentials do not exist. Run `pnpm qa:fixture` first.",
      );
    }
    throw new Error("Local QA credentials could not be read");
  }

  if ((fileStatus.mode & 0o077) !== 0) {
    throw new Error(
      "Local QA credential permissions are too broad. Run `chmod 600 .local/qa-fixture.json`.",
    );
  }
  if (!isCredentialRecord(credentials)) {
    throw new Error("Local QA credential file is invalid or not local-only");
  }

  if (checkOnly) {
    console.log(
      "Local QA credentials are present, local-only and permission-safe.",
    );
    return;
  }

  console.log(
    "LOCAL QA CREDENTIALS — do not share or paste into public documents",
  );
  console.log("");
  console.log("Author account");
  console.log(`  Registration name: ${credentials.author.registrationName}`);
  console.log(`  Password: ${credentials.author.password}`);
  console.log(`  Public profile: /author/${credentials.author.slug}`);
  console.log("");
  console.log("Reader account");
  console.log(`  Registration name: ${credentials.reader.registrationName}`);
  console.log(`  Password: ${credentials.reader.password}`);
  console.log("");
  console.log(`Invitation code: ${credentials.invitationCode}`);
  console.log("");
  console.log("Sign in: http://localhost:3000/auth/sign-in");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
