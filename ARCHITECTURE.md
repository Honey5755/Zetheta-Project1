# Architecture

This document explains the key design decisions behind the LendSwift multi-step
loan application form.

## 1. Wizard + Step Registry pattern

Of the three multi-step patterns in the brief (single monolithic form;
step-per-form with shared context; wizard with a step registry), this project uses
the **wizard + step registry** (the recommended one).

- `src/constants/steps.js` defines an ordered registry of step metadata
  (`key`, `number`, `title`, `conditional`).
- `src/components/wizard/Wizard.jsx` maps each step `key` to a **lazy-loaded**
  component, renders the active step, and orchestrates validation-gated navigation,
  progress, and accessible focus.
- Each step component owns only its own fields and UI; the wizard owns orchestration.

### Why navigation is keyed by step *id*, not index

The co-applicant step (6) is conditional. If navigation tracked an array index,
inserting/removing that step would silently shift the user to the wrong step — the
exact class of bug behind the PhonePe incident in the brief. Tracking the current
step by its stable `key` and recomputing the visible-step list from form values
makes insertion/removal safe. `Wizard` also snaps back to a valid step if the active
step becomes invisible.

## 2. Form state: one RHF instance + a small navigation store

A **single React Hook Form** instance (created in `Wizard`, shared via
`FormProvider`) is the **source of truth for all field values**. A separate
**Zustand** store (`useFormStore`) holds only navigation state: `currentStepKey`,
`visitedSteps`, and `submissionRef`. Keeping values in one place (RHF) and
navigation in another avoids dual-source drift, while still letting auto-save
serialise `getValues()` + the current step.

### RHF subscriptions in step components

Child steps must subscribe to form changes themselves — reading
`useFormContext().formState.errors` in a child does **not** re-render it (only the
component that called `useForm` is subscribed). Steps therefore use
`useFormState({ control })` for errors and `useWatch({ control, name })` for watched
values. (This was a real bug caught by the Wizard integration test.)

## 3. Validation: a schema factory of Zod schemas

`src/schemas/schemaFactory.js` exposes `getStepSchema(stepKey, values)`, returning
the Zod schema for the active step **built from the full form values** so cross-step
rules can be expressed. The wizard installs a resolver that reads the *current* step
key via a ref at validation time:

```js
const resolver = (values, ctx, opts) =>
  zodResolver(getStepSchema(stepKeyRef.current, values))(values, ctx, opts);
```

`trigger()` then validates only the active step's fields; on "Continue" the wizard
advances only if valid, otherwise it focuses the first error. Validation mode is
`onTouched` (inline, after first blur).

### Cross-step dependency map (Spec B3)

| Source | Target | Rule | Where |
| --- | --- | --- | --- |
| Loan type | Step 5 | Business loan ⇒ self-employed/business-owner | `step5Schema` |
| Loan type | Step 6 | Home ⇒ always show | `steps.getVisibleSteps` |
| Loan type | Step 7 | Different docs per type | `documents.getRequiredDocuments` |
| Loan amount | Step 6 | Personal > ₹5L / Business > ₹20L ⇒ show | `loanProducts.requiresCoApplicant` |
| Loan amount/tenure | Step 8 | EMI inputs | `emiCalculator` |
| DOB (Step 2) | Step 1 | Age + tenure ≤ 65 | `step1Schema` |
| Marital status | Step 6 | Married ⇒ default relationship Spouse | `Step6CoApplicant` |
| PAN verified | Step 7 | PAN copy becomes optional | `documents.getRequiredDocuments` |
| Residence type | Step 4 | Rented ⇒ rent amount required | `step4Schema` |
| Employment type | Step 5 | Salaried/Self-emp/Business sub-forms | `step5Schema` |
| Employment type | Step 7 | Salary slips vs ITR | `documents.getRequiredDocuments` |
| Income | Step 8 | EMI ≤ 50% of income | `emiCalculator` |
| Co-applicant income | Step 8 | Combined affordability | `emiCalculator.deriveMonthlyIncome` |
| Years at address < 1 | Step 4 | Previous address required | `step4Schema` |

These are exercised by `src/schemas/crossStep.test.js`.

## 4. Auto-save and resume

- `useAutoSave` subscribes to RHF changes and **debounces** a save (default 30s of
  quiet). The manual "Save Draft" button calls the same `saveNow`.
- `utils/draftStorage.js` serialises the values (excluding heavy file/signature
  fields), **encrypts with AES-256-GCM** (`utils/encryption.js`, PBKDF2-derived key,
  random IV per write) and writes to `localStorage` under
  `lendswift_draft_<loanType>` with `{ version, timestamp, step }`.
- On load, `useFormPersistence` finds the most recent valid draft, **purging** any
  that are corrupt/tampered (GCM auth failure), version-mismatched, or past the
  **72h TTL**, and offers a Resume / Start-Fresh modal. This defends against the
  data-integrity attack in the QA stress test (manually editing LocalStorage ⇒ the
  draft fails to decrypt ⇒ start fresh).

## 5. Documents, compression and e-signature

- `FileUpload` (React Dropzone) validates type/size, compresses images via the
  Canvas API (`utils/imageCompression.js`: scale to ≤1200px, JPEG q0.7, step down to
  fit ≤2MB), generates previews, and supports a render-prop for custom previews.
- `SignatureCanvas` wraps `react-signature-canvas`: responsive width, Clear,
  base64-PNG export, and a blur overlay so a captured signature is not trivially
  screen-captured.

## 6. Security

- All PII inputs (PAN, Aadhaar) are masked in the UI (last 4 shown) via `MaskedInput`.
- Drafts are encrypted at rest in LocalStorage.
- `no-console` (except warn/error) is enforced by ESLint so PII can't leak to logs.

## 7. Accessibility

Labelled controls, `role="alert"` + `aria-live="polite"` error regions, focus moved
to the step heading on every transition (WCAG 2.4.3), fieldset/legend for radio
groups, `autocomplete` tokens, 44×44px touch targets, and AA colour contrast. The
`cypress-axe` spec audits every step for critical/serious violations.

## 8. Performance

Step components are `React.lazy` + `Suspense`, keeping the main chunk ≈ 83 KB
gzipped. Validation runs per-step (not over all 50+ fields at once).
