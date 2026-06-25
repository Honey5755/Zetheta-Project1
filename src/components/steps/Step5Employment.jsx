import { useEffect, useRef } from 'react';
import {
  Controller, useFormContext, useFormState, useWatch,
} from 'react-hook-form';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import RadioGroup from '../common/RadioGroup.jsx';
import CurrencyInput from '../common/CurrencyInput.jsx';

const EMPLOYMENT_OPTIONS = [
  { value: 'salaried', label: 'Salaried', description: 'You earn a regular salary from an employer.' },
  { value: 'self-employed', label: 'Self-Employed', description: 'You work for yourself (professional / freelancer).' },
  { value: 'business-owner', label: 'Business Owner', description: 'You own a registered business.' },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership Firm' },
  { value: 'pvt-ltd', label: 'Private Limited Company' },
  { value: 'llp', label: 'Limited Liability Partnership' },
  { value: 'public-ltd', label: 'Public Limited Company' },
  { value: 'other', label: 'Other' },
];

// Branch-specific fields cleared when the employment type changes (Spec E3.1 —
// no stale data leaking from a previously selected sub-form).
const BRANCH_FIELDS = [
  'companyName', 'designation', 'monthlyNetSalary', 'businessName', 'businessType',
  'annualTurnover', 'yearsInBusiness', 'monthlyIncome', 'gstNumber', 'officeAddress',
];

/**
 * Step 5 — Employment & Income (Spec B2.1). The sub-form mounts/unmounts based
 * on the employment type; switching type clears the other branch's data.
 */
function Step5Employment() {
  const { control, register, setValue } = useFormContext();
  const { errors } = useFormState({ control });
  const employmentType = useWatch({ control, name: 'employmentType' });

  const prevType = useRef(employmentType);
  useEffect(() => {
    if (prevType.current !== employmentType) {
      BRANCH_FIELDS.forEach((field) => setValue(field, '', { shouldValidate: false }));
      prevType.current = employmentType;
    }
  }, [employmentType, setValue]);

  const isSalaried = employmentType === 'salaried';
  const isSelfEmployed = employmentType === 'self-employed';
  const isBusinessOwner = employmentType === 'business-owner';
  const isBusiness = isSelfEmployed || isBusinessOwner;

  return (
    <div className="space-y-6">
      <Controller
        name="employmentType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            legend="Employment type"
            required
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            error={errors.employmentType?.message}
            options={EMPLOYMENT_OPTIONS}
          />
        )}
      />

      {isSalaried && (
        <>
          <Input error={errors.companyName?.message} required>
            <Input.Label>Company name</Input.Label>
            <Input.Field {...register('companyName')} autoComplete="organization" />
            <Input.Error />
          </Input>
          <Input error={errors.designation?.message} required>
            <Input.Label>Designation</Input.Label>
            <Input.Field {...register('designation')} autoComplete="organization-title" />
            <Input.Error />
          </Input>
          <Controller
            name="monthlyNetSalary"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Monthly net salary"
                required
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={errors.monthlyNetSalary?.message}
                helpText="Used to check loan affordability (EMI ≤ 50% of income)."
              />
            )}
          />
        </>
      )}

      {isBusiness && (
        <>
          <Input error={errors.businessName?.message} required>
            <Input.Label>Business name</Input.Label>
            <Input.Field {...register('businessName')} autoComplete="organization" />
            <Input.Error />
          </Input>
          <Select
            label="Business type"
            required
            placeholder="Select business type"
            options={BUSINESS_TYPE_OPTIONS}
            error={errors.businessType?.message}
            {...register('businessType')}
          />
          <Controller
            name="annualTurnover"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Annual turnover"
                required
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={errors.annualTurnover?.message}
                helpText="Minimum ₹3,00,000."
              />
            )}
          />
          <Input error={errors.yearsInBusiness?.message} required>
            <Input.Label>Years in business</Input.Label>
            <Input.Field as="input" type="number" min={0} step={1} {...register('yearsInBusiness')} />
            <Input.Error />
          </Input>
          {isSelfEmployed && (
            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Monthly income"
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={errors.monthlyIncome?.message}
                  helpText="Used to check loan affordability (EMI ≤ 50% of income)."
                />
              )}
            />
          )}
          {isBusinessOwner && (
            <Controller
              name="gstNumber"
              control={control}
              render={({ field }) => (
                <Input error={errors.gstNumber?.message} required>
                  <Input.Label>GST number (GSTIN)</Input.Label>
                  <Input.Field
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    autoComplete="off"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  <Input.HelpText>
                    15 characters: state code + PAN + entity + Z + checksum.
                  </Input.HelpText>
                  <Input.Error />
                </Input>
              )}
            />
          )}
          <Input error={errors.officeAddress?.message} required>
            <Input.Label>Office / business address</Input.Label>
            <Input.Field as="textarea" rows={3} {...register('officeAddress')} autoComplete="off" />
            <Input.Error />
          </Input>
        </>
      )}

      {employmentType && (
        <Input error={errors.yearsOfExperience?.message} required>
          <Input.Label>Total years of experience</Input.Label>
          <Input.Field as="input" type="number" min={0} max={50} step={1} {...register('yearsOfExperience')} />
          <Input.Error />
        </Input>
      )}
    </div>
  );
}

export default Step5Employment;
