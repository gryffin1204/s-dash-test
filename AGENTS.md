# Repository Guidelines

## Project Structure & Module Organization
This workspace has two active apps plus reference data. `backend/main.py` exposes FastAPI endpoints backed by in-memory DuckDB views over the root-level pipe-delimited datasets `sample_orig_2020.txt` and `sample_svcg_2020.txt`. `backend/requirements.txt` is the Python dependency list. `loan-dashboard/src/` contains the React frontend: `views/` for page screens, `components/` for shared UI, `layouts/` for shell chrome, `utils/` for helpers, and `public/` or `src/assets/` for static assets. Treat `loan-dashboard/node_modules/` and `backend/venv/` as generated/vendor content and do not edit them.

## Build, Test, and Development Commands
Frontend commands run from `loan-dashboard/`:

- `npm install` installs frontend dependencies.
- `npm run dev` starts the Vite dev server on `http://localhost:5173` (`npm.cmd run dev` is safer in locked-down PowerShell).
- `npm run build` performs a TypeScript build and produces the production bundle.
- `npm run lint` runs the configured ESLint rules.

Backend commands run from `backend/`:

- `pip install -r requirements.txt` installs FastAPI, DuckDB, and data tooling.
- `uvicorn main:app --reload --port 8000` starts the API locally.
- `venv\Scripts\python.exe -m py_compile main.py` is the lightest syntax check in the current setup.

## Coding Style & Naming Conventions
Use 2-space indentation in `ts`/`tsx` files and 4 spaces in Python. Keep React components, layouts, and views in PascalCase (`ExecutiveSummary.tsx`); use camelCase for helpers and local variables; use snake_case for Python functions and uppercase module constants like `BASE_DIR`. Follow the existing ESLint config and prefer explicit types over `any` when touching frontend code.

## Testing Guidelines
There is no committed automated test suite yet. Before opening a PR, run `npm run lint`, `npm run build`, and `venv\Scripts\python.exe -m py_compile main.py`, then smoke-test the UI against the local API. The frontend baseline already has lint/type errors, so document unrelated failures in your PR instead of folding them into your change. If you add tests, place frontend tests beside the feature as `*.test.tsx` and backend tests under `backend/tests/test_*.py`.

## Commit & Pull Request Guidelines
This export does not include `.git` history, so no repository-specific commit convention can be inferred. Use short imperative subjects with an optional scope, for example `frontend: tighten KPI card typing`. Keep commits focused. PRs should summarize behavior changes, list validation commands run, mention any data-path or CORS changes, and include screenshots for dashboard UI updates.

## Configuration Tips
`backend/main.py` hard-codes the repository path and allows CORS only for `http://localhost:5173`. If you move the datasets or change ports, update `BASE_DIR` and `allow_origins` together.
