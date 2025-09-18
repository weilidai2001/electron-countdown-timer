# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the TypeScript entrypoints for the Electron main process. Key files: `main.ts` (bootstrap), `application-controller.ts`, and feature folders like `commands/`, `managers/`, and `services/` that group IPC handlers, state managers, and OS-facing utilities.
- `renderer.js`, `index.html`, and `timer.html` drive the renderer UI; shared styles live in `styles.css` and image assets in `assets/`.
- Build artifacts land in `dist/`; packaged apps appear in `dist-app/`. Keep manual edits out of these directories.

## Build, Test, and Development Commands
- `npm run build`: transpiles TypeScript using `tsc` into `dist/`.
- `npm run start`: rebuilds and launches the Electron app.
- `npm run dev`: like `start`, but opens the main process inspector on port 5858.
- `npm run watch`: incremental TypeScript rebuilds during local development.
- `npm run lint` / `npm run lint:fix`: ESLint across `src/**/*.ts`; use the fix flag before submitting.
- `npm run format`: Prettier pass for TypeScript sources.

## Coding Style & Naming Conventions
- Follow Prettier defaults (2-space indent, single quotes, trailing commas where valid). Do not commit formatted output that fails `npm run lint`.
- Favor descriptive class and file names in PascalCase (`CountdownManager`) and camelCase for variables and functions (`registerCountdownChannel`).
- Keep IPC channel names and command identifiers in constant enums within `src/types.ts` to avoid duplication.

## Testing Guidelines
- Automated tests are not yet configured; `npm test` intentionally exits. Provide manual QA notes (start/pause/reset, Chrome termination, screen lock behavior) in your PR description.
- When adding tests, colocate them near the feature directory and update this guide with the chosen framework.

## Commit & Pull Request Guidelines
- Recent history mostly follows Conventional Commits (`type: short imperative`). Continue with lowercase types such as `fix:`, `refactor:`, or `chore:`.
- Squash noisy work-in-progress commits locally; keep messages scoped to a single change.
- Pull requests should include: concise summary, screenshots or GIFs for UI tweaks, reproduction steps for bug fixes, and any manual test evidence.

## Release & Packaging Tips
- For signed builds, run `npm run dist` (all targets) or platform-specific scripts like `npm run dist:mac`. Confirm assets (icons, html, css) are referenced in `package.json` before distributing.
- Do not modify files under `dist-app/` directly; adjust configuration in `package.json`'s `build` block instead.
