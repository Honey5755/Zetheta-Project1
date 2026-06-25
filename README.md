# LendSwift — Multi-Step Loan Application Form

A production-grade, 8-step loan application form for **Personal**, **Home**, and
**Business** loans, built for the LendSwift digital-lending simulation. It
features real-time validation, conditional field rendering, document upload with
client-side compression, e-signature capture, encrypted auto-save/resume, and a
pre-approval (Key Fact Statement) summary.

> Status: **in development** — see the progress checklist below.

## Tech stack

| Concern | Choice |
| --- | --- |
| UI | React 18 + Vite (JavaScript + JSDoc) |
| Form state | React Hook Form |
| Validation | Zod (schema-based, cross-step dependencies) |
| Wizard / global state | Zustand |
| Styling | Tailwind CSS |
| File upload | React Dropzone + Canvas-API compression |
| E-signature | react-signature-canvas |
| E2E tests | Cypress (+ cypress-axe for accessibility) |
| Unit tests | Vitest + Testing Library |
| Linting | ESLint (Airbnb + jsx-a11y) |

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # ESLint (Airbnb) — must be error-free
npm run test:unit  # Vitest unit tests
npm run test:e2e   # Cypress end-to-end suite (requires the app running)
```

## Architecture (summary)

The form uses the **Wizard + Step Registry** pattern: a central Zustand store
holds all accumulated form data, and the `Wizard` orchestrates an ordered
registry of steps. Navigation is keyed by stable step identifiers (not array
indices), so the conditional Co-Applicant step can appear or disappear without
corrupting the user's position. Step components are lazy-loaded to keep the main
bundle small. A full write-up lives in [ARCHITECTURE.md](ARCHITECTURE.md) (added
in the documentation sprint).

## Progress

- [x] Day 1 — Project scaffold + wizard skeleton (registry, store, progress, navigation)
- [ ] Day 2 — Reusable form component library
- [ ] Days 3–5 — Steps 1–4 (loan type, personal, KYC, address)
- [ ] Days 6–9 — Steps 5–8 (employment, co-applicant, documents, review)
- [ ] Day 10 — Cross-step validation dependencies
- [ ] Days 11–13 — Cypress E2E suite (15+ journeys)
- [ ] Day 14 — Accessibility + responsive audit
- [ ] Day 15 — Documentation, deployment, submission
