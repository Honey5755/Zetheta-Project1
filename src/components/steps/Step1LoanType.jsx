import {
  Controller, useFormContext, useFormState, useWatch,
} from 'react-hook-form';
import RadioGroup from '../common/RadioGroup.jsx';
import CurrencyInput from '../common/CurrencyInput.jsx';
import Select from '../common/Select.jsx';
import Input from '../common/Input.jsx';
import { LOAN_PRODUCTS, loanProductList } from '../../constants/loanProducts.js';
import { formatINR } from '../../utils/indianFormat.js';
import { calculateAge } from '../../utils/validators.js';

/**
 * Build tenure dropdown options for a product, capped so the loan ends by age
 * 65 when the applicant's DOB is known (cross-step rule, Spec B3).
 */
function buildTenureOptions(product, maxByAge) {
  const options = [];
  const { min, max, step } = product.tenureMonths;
  for (let months = min; months <= max; months += step) {
    if (maxByAge !== null && months > maxByAge) break;
    const years = months / 12;
    const yearLabel = Number.isInteger(years) ? `${years} yr` : `${years.toFixed(1)} yr`;
    options.push({ value: String(months), label: `${months} months · ${yearLabel}` });
  }
  return options;
}

/**
 * Step 1 — Loan Type Selection & Basic Information (Spec B2.1).
 */
function Step1LoanType() {
  const { control, register } = useFormContext();
  const { errors } = useFormState({ control });
  const loanType = useWatch({ control, name: 'loanType' });
  const dob = useWatch({ control, name: 'dob' });
  const product = loanType ? LOAN_PRODUCTS[loanType] : null;

  const age = calculateAge(dob);
  const maxByAge = age !== null ? (65 - age) * 12 : null;
  const tenureOptions = product ? buildTenureOptions(product, maxByAge) : [];
  const purposeOptions = product ? product.purposes.map((p) => ({ value: p, label: p })) : [];

  return (
    <div className="space-y-6">
      <Controller
        name="loanType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            legend="What type of loan do you need?"
            required
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            error={errors.loanType?.message}
            options={loanProductList().map((p) => ({
              value: p.id,
              label: p.label,
              description: p.blurb,
              icon: { personal: '💳', home: '🏠', business: '🏢' }[p.id],
            }))}
          />
        )}
      />

      {product && (
        <>
          <Controller
            name="loanAmount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Loan amount"
                required
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={errors.loanAmount?.message}
                helpText={`Between ${formatINR(product.minAmount)} and ${formatINR(product.maxAmount)}.`}
              />
            )}
          />

          <Select
            label="Repayment tenure"
            required
            placeholder="Select tenure"
            options={tenureOptions}
            error={errors.loanTenure?.message}
            helpText={maxByAge !== null ? 'Options are capped so the loan ends by age 65.' : undefined}
            {...register('loanTenure')}
          />

          <Select
            label="Purpose of loan"
            required
            placeholder="Select a purpose"
            options={purposeOptions}
            error={errors.loanPurpose?.message}
            {...register('loanPurpose')}
          />
        </>
      )}

      <Input error={errors.referralCode?.message}>
        <Input.Label>Referral code (optional)</Input.Label>
        <Input.Field {...register('referralCode')} placeholder="e.g. LEND2026" autoComplete="off" />
        <Input.HelpText>6–10 letters or numbers, if you have one.</Input.HelpText>
        <Input.Error />
      </Input>
    </div>
  );
}

export default Step1LoanType;
