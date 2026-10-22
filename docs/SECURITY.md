# Security notes

Last dependency audit: **2026-10-22** (Expo SDK 58.0.17, React Native 0.88.0, npm 11.6.2).

## Runtime

| Item | Status | Action |
| --- | --- | --- |
| Node.js | v24.12.0 installed. Satisfies Expo's engine range (`^24.3.0`) but is behind the Node 24 LTS security line (24.17.0 shipped 2026-06-18 with high-severity WebCrypto/TLS fixes; a later 24.18.x was reported in July). | Update to the newest Node 24 LTS from nodejs.org before the defence. No project change needed. |
| npm | 11.6.2 | OK |

## `npm audit` (mobile)

18 "high" entries, all stemming from **two** advisories in Expo/Metro **development tooling**.
Neither package ships in the app bundle that runs on the phone.

| Advisory | Package | Where it is used | Patched version | Risk for CocoScan |
| --- | --- | --- | --- | --- |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (CVE-2026-93687) — stack-exhaustion DoS via deeply nested glob patterns | `braces@3.0.3` via `micromatch` → `metro-file-map` | Metro's file watcher on the developer PC | **None published** (3.0.3 is the latest on npm) | Low. Only exploitable if an attacker controls glob patterns passed to Metro locally. |
| [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) (CVE-2026-85393) — RSA PKCS#1 v1.5 signature forgery with low-exponent keys | `node-forge@1.4.0` via `@expo/code-signing-certificates` → `@expo/cli` | Expo CLI's update code-signing helpers (dev time / EAS Update) | **None published** (fix PR unmerged as of 2026-10) | Low. We do not use EAS Update code signing; nothing in the app verifies RSA signatures with node-forge. |

The remaining 16 rows are transitive "depends on a vulnerable version" chains
(`expo`, `react-native`, `metro*`, `react-native-reanimated`, `react-native-worklets`, …) with
no advisory of their own.

**Do not run `npm audit fix --force`.** Its proposed "fix" is to downgrade to `expo@44` and
`react-native@0.72`, which would break the project and reintroduce many older, genuinely
fixed vulnerabilities. The non-forced `npm audit fix` makes no changes (verified with `--dry-run`).

Re-check with `npm audit` after each `npx expo install --fix`; once `braces` ≥ 3.0.4 or a
patched `node-forge` is released, Expo will pick them up and the count drops to zero. If you
want them earlier, add an `overrides` entry in `mobile/package.json` pinning the patched
version — only once it exists on npm.

## Dependency provenance

Every direct dependency is either published by the Expo team (`expo-*`, `@expo/*`) or is a
long-maintained community package used by the Expo default template
(`react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`,
`react-native-safe-area-context`, `react-native-screens`,
`@react-native-async-storage/async-storage`, `@expo-google-fonts/poppins`). All versions were
chosen by `npx expo install`, which pins the SDK-58-compatible range. No install scripts were
run beyond npm's own.

## Secrets

- `.env` files are git-ignored in `mobile/` and `backend/` (verified with `git check-ignore`).
  Only `.env.example` files with placeholder values are committed.
- No tokens, keys or credentials appear anywhere in the repository (scanned for GitHub,
  AWS, OpenAI, Slack and private-key patterns).
- GitHub credentials stay in Windows Credential Manager (`credential.helper=manager`);
  nothing is stored in the repo or project config.
- Backend: `SECRET_KEY` defaults to an obvious dev value. The API logs a warning in
  `development` and **refuses to start** in any other `ENVIRONMENT` until a real key is set.
  Generate one with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
- Mobile: only `EXPO_PUBLIC_*` variables are used and they contain no secrets (data mode and
  API URL). Anything prefixed `EXPO_PUBLIC_` is embedded in the JS bundle, so never put a key there.
- Auth tokens on the device live in `expo-secure-store` (Keystore / Keychain), not AsyncStorage.
