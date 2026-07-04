import { execSync } from 'node:child_process'

/**
 * Real short git commit hash for the current build.
 * Prefers CI-provided env (Vercel), falls back to reading git, then 'dev'.
 * Evaluated on the server at build / render time.
 */
export function getBuildSha(): string {
  const envSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_BUILD_SHA
  if (envSha) return envSha.slice(0, 7)

  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'dev'
  }
}
