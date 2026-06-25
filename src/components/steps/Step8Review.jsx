import { useState } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import Checkbox from '../common/Checkbox.jsx';
import useFormStore from '../../store/useFormStore.js';
import { getRequiredDocuments } from '../../constants/documents.js';
import { calculateLoanSummary } from '../../utils/emiCalculator.js';
import { formatINR, formatIndianNumber } from '../../utils/indianFormat.js';
import { clearAllDrafts } from '../../utils/draftStorage.js';
import { LOAN_PRODUCTS } from '../../constants/loanProducts.js';

const maskTail = (value, visible = 4) => {
  const str = String(value || '');
  return str.length > visible ? `${'•'.repeat(str.length - visible)}${str.slice(-visible)}` : str;
};

function SummarySection({
  title, stepKey, rows, onEdit,
}) {
  const filled = rows.filter((r) => r.value !== '' && r.value !== undefined && r.value !== null);
  if (filled.length === 0) return null;
  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <button
          type="button"
          onClick={() => onEdit(stepKey)}
          className="tap-target rounded px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-50"
        >
          Edit
        </button>
      </div>
      <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {filled.map((row) => (
          <div key={row.label} className="flex justify-between gap-2 text-sm sm:block">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="font-medium text-slate-800">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Step 8 — Review, Consent & Pre-Approval Summary (Spec B2.1, A3.1, C3.3).
 */
function Step8Review() {
  const { control, register, trigger } = useFormContext();
  const { errors } = useFormState({ control });
  const values = useWatch({ control });
  const goToStep = useFormStore((s) => s.goToStep);
  const completeSubmission = useFormStore((s) => s.completeSubmission);

  const [docError, setDocError] = useState(false);

  const summary = calculateLoanSummary(values);
  const product = LOAN_PRODUCTS[values.loanType];
  const requiredDocs = getRequiredDocuments(values).filter((d) => !d.optional);
  const docsComplete = requiredDocs.every((d) => (values.documents?.[d.id]?.length ?? 0) > 0);

  const consentsChecked = values.confirmAccurate && values.consentCredit
    && values.consentTerms && values.consentComms;
  const needsAck = !summary.withinAffordability;
  const ackOk = !needsAck || values.affordabilityAck;
  const canSubmit = consentsChecked && ackOk && docsComplete;

  const handleSubmit = async () => {
    const valid = await trigger();
    if (!docsComplete) {
      setDocError(true);
      return;
    }
    if (!valid) return;
    const uuid = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}`;
    clearAllDrafts();
    completeSubmission(`LS-${uuid.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Pre-approval / Key Fact Statement */}
      <section className="rounded-xl border-2 border-brand/30 bg-brand-50 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Pre-approval summary</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Loan amount</dt>
            <dd className="font-semibold text-slate-900">{formatINR(summary.principal)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Tenure</dt>
            <dd className="font-semibold text-slate-900">{`${summary.months} months`}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Interest rate</dt>
            <dd className="font-semibold text-slate-900">{`${summary.annualRate}% p.a.`}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Estimated EMI</dt>
            <dd className="font-semibold text-slate-900">{`${formatINR(summary.emi)}/mo`}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Total cost of borrowing</dt>
            <dd className="font-semibold text-slate-900">{formatINR(summary.totalCostOfBorrowing)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Processing fee</dt>
            <dd className="font-semibold text-slate-900">{formatINR(summary.processingFee)}</dd>
          </div>
        </dl>
        {summary.emiToIncomeRatio !== null && (
          <p className="mt-3 text-xs text-slate-500">
            {`EMI is ${Math.round(summary.emiToIncomeRatio * 100)}% of your declared monthly income `}
            {`(₹${formatIndianNumber(summary.monthlyIncome)}).`}
          </p>
        )}
      </section>

      {needsAck && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-3" role="alert">
          <p className="text-sm font-medium text-slate-800">
            Your EMI exceeds 50% of your declared income. You can still apply, but please
            acknowledge that repayment may strain your finances.
          </p>
        </div>
      )}

      {/* Section summaries with edit links */}
      <SummarySection
        title="Loan details"
        stepKey="loan-type"
        onEdit={goToStep}
        rows={[
          { label: 'Type', value: product?.label },
          { label: 'Amount', value: summary.principal ? formatINR(summary.principal) : '' },
          { label: 'Tenure', value: summary.months ? `${summary.months} months` : '' },
          { label: 'Purpose', value: values.loanPurpose },
        ]}
      />
      <SummarySection
        title="Personal information"
        stepKey="personal"
        onEdit={goToStep}
        rows={[
          { label: 'Name', value: values.fullName },
          { label: 'Date of birth', value: values.dob },
          { label: 'Email', value: values.email },
          { label: 'Mobile', value: values.mobile },
        ]}
      />
      <SummarySection
        title="Identity (KYC)"
        stepKey="kyc"
        onEdit={goToStep}
        rows={[
          { label: 'PAN', value: maskTail(values.pan) },
          { label: 'Aadhaar', value: maskTail(values.aadhaar) },
        ]}
      />
      <SummarySection
        title="Address"
        stepKey="address"
        onEdit={goToStep}
        rows={[
          { label: 'Address', value: values.currentAddressLine1 },
          { label: 'City', value: values.city },
          { label: 'State', value: values.state },
          { label: 'PIN', value: values.pinCode },
        ]}
      />
      <SummarySection
        title="Employment & income"
        stepKey="employment"
        onEdit={goToStep}
        rows={[
          { label: 'Type', value: values.employmentType },
          { label: 'Employer / business', value: values.companyName || values.businessName },
        ]}
      />
      <SummarySection
        title="Co-applicant"
        stepKey="co-applicant"
        onEdit={goToStep}
        rows={[
          { label: 'Name', value: values.coApplicantName },
          { label: 'Relationship', value: values.coApplicantRelationship },
        ]}
      />

      {/* Signature */}
      {values.eSignature && (
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Signature</h2>
          <img src={values.eSignature} alt="Your captured signature" className="h-20 rounded border border-slate-200 bg-white" />
        </section>
      )}

      {/* Consents */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Declarations &amp; consent</h2>
        <Checkbox {...register('confirmAccurate')} error={errors.confirmAccurate?.message} label="I confirm all information provided is accurate." />
        <Checkbox {...register('consentCredit')} error={errors.consentCredit?.message} label="I authorise LendSwift to check my credit score via CIBIL/Equifax." />
        <Checkbox {...register('consentTerms')} error={errors.consentTerms?.message} label="I agree to the Terms & Conditions." />
        <Checkbox {...register('consentComms')} error={errors.consentComms?.message} label="I consent to receive communications regarding this application." />
        {needsAck && (
          <Checkbox {...register('affordabilityAck')} error={errors.affordabilityAck?.message} label="I acknowledge that the EMI exceeds 50% of my income." />
        )}
      </section>

      {!docsComplete && docError && (
        <p role="alert" className="text-sm font-medium text-danger">
          Some required documents are missing. Please go back to the Documents step and upload them.
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="tap-target w-full rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit application
      </button>
    </div>
  );
}

export default Step8Review;
