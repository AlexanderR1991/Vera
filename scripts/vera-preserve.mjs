import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const usage = "Usage: node scripts/vera-preserve.mjs <inspect|drill>";
const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
Object.assign(env, {
  GIT_ALLOW_PROTOCOL: "file",
  GIT_NO_LAZY_FETCH: "1",
  GIT_TERMINAL_PROMPT: "0"
});

function git(cwd, args, gitEnv = env) {
  return execFileSync("git", ["--no-optional-locks", "--no-replace-objects", "-c", "core.fsmonitor=false", ...args], {
    cwd,
    env: gitEnv,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function inspect(cwd) {
  if (git(cwd, ["rev-parse", "--is-inside-work-tree"]).trim() !== "true") {
    throw new Error("Run this command from inside a Git working tree.");
  }

  return {
    revision: git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]).trim(),
    shallow: git(cwd, ["rev-parse", "--is-shallow-repository"]).trim() === "true",
    dirty: git(cwd, ["status", "--porcelain=v1", "--untracked-files=normal", "--ignore-submodules=none"]).length > 0
  };
}

function drill(cwd, snapshot) {
  if (snapshot.shallow) throw new Error("Recovery drill requires a non-shallow checkout.");

  const temporary = mkdtempSync(join(tmpdir(), "vera-recovery-"));
  try {
    const bundle = join(temporary, "head.bundle");
    const restored = join(temporary, "restored");
    git(cwd, ["bundle", "create", bundle, "HEAD"]);

    // Check the restored objects without source refs or user-defined fsck exceptions.
    // Use a real empty file: Git for Windows cannot read Node's device path as config.
    const emptyConfig = join(temporary, "empty.gitconfig");
    writeFileSync(emptyConfig, "", {flag: "wx"});
    const restoreEnv = { ...env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: emptyConfig };
    git(temporary, ["clone", "--no-checkout", "--template=", bundle, restored], restoreEnv);
    const restoredRevision = git(restored, ["rev-parse", "--verify", "HEAD^{commit}"], restoreEnv).trim();
    if (restoredRevision !== snapshot.revision) {
      throw new Error("The bundled HEAD differs from the inspected revision. Retry from a stable checkout.");
    }
    git(restored, ["fsck", "--full", "--no-reflogs"], restoreEnv);
    return { ...snapshot, restoredRevision, scope: "HEAD" };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

const [command, ...rest] = process.argv.slice(2);
if (command === "--help" && rest.length === 0) {
  console.log(usage);
} else if (!["inspect", "drill"].includes(command) || rest.length > 0) {
  console.error(usage);
  process.exitCode = 2;
} else {
  try {
    const cwd = process.cwd();
    const snapshot = inspect(cwd);
    console.log(JSON.stringify(command === "drill" ? drill(cwd, snapshot) : snapshot, null, 2));
  } catch (error) {
    console.error(`Vera: ${error.stderr?.trim() || error.message}`);
    process.exitCode = 1;
  }
}
