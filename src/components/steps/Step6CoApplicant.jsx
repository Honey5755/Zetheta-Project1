import { useEffect } from 'react';
import {
  Controller, useFormContext, useFormState, useWatch,
} from 'react-hook-form';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import MaskedInput from '../common/MaskedInput.jsx';
import CurrencyInput from '../common/CurrencyInput.jsx';
import Checkbox from '../common/Checkbox.jsx';
import { useVerification } from '../../hooks/useVerification.js';
import { isValidPanFormat, panEntityChar } from '../../utils/validators.js';

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'business-partner', label: 'Business Partner' },
];

/**
 * Step 6 — Co-Applicant & Guarantor (Spec B2.1, B3). Conditional step; the
 * relationship defaults to Spouse when the applicant is married.
 */
function Step6CoApplicant() {
  const { control, register, setValue } = useFormContext();
  const { errors } = useFormState({ control });
  const maritalStatus = useWatch({ control, name: 'maritalStatus' });
  const relationship = useWatch({ control, name: 'coApplicantRelationship' });

  const pan = useVerification();
  useEffect(() => {
    setValue('coApplicantPanVerified', pan.isVerified);
  }, [pan.isVerified, setValue]);

  // Cross-step (Spec B3): default the relationship to Spouse for married applicants.
  useEffect(() => {
    if (maritalStatus === 'married' && !relationship) {
      setValue('coApplicantRelationship', 'spouse');
    }
  }, [maritalStatus, relationship, setValue]);

  const validatePan = (value) => {
    if (!isValidPanFormat(value)) {
      return { valid: false, message: 'PAN must be 10 characters in the format AAAAA9999A.' };
    }
    if (panEntityChar(value) !== 'P') {
      return { valid: false, message: 'Co-applicant PAN must belong to an individual (4th character P).' };
    }
    return { valid: true };
  };

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
        This loan requires a co-applicant based on the loan type and amount.
      </p>

      <Input error={errors.coApplicantName?.message} required>
        <Input.Label>Co-applicant full name</Input.Label>
        <Input.Field {...register('coApplicantName')} autoComplete="off" />
        <Input.Error />
      </Input>

      <Select
        label="Relationship to applicant"
        required
        placeholder="Select relationship"
        options={RELATIONSHIP_OPTIONS}
        error={errors.coApplicantRelationship?.message}
        {...register('coApplicantRelationship')}
      />

      <Controller
        name="coApplicantPan"
        control={control}
        render={({ field }) => (
          <MaskedInput
            label="Co-applicant PAN"
            required
            name={field.name}
            value={field.value}
            maxLength={10}
            visibleSuffix={4}
            transform={(raw) => raw.toUpperCase()}
            placeholder="AAAAA9999A"
            error={errors.coApplicantPan?.message}
            endAdornment={pan.isVerified ? <span className="text-xs font-semibold text-accent-800">✓</span> : null}
            onChange={(v) => {
              field.onChange(v);
              pan.reset();
            }}
            onBlur={() => {
              field.onBlur();
              pan.verify(field.value, validatePan);
            }}
          />
        )}
      />

      <Controller
        name="coApplicantIncome"
        control={control}
        render={({ field }) => (
          <CurrencyInput
            label="Co-applicant monthly income"
            required
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            error={errors.coApplicantIncome?.message}
            helpText="Added to the applicant's income for the affordability check."
          />
        )}
      />

      <Checkbox
        {...register('coApplicantConsent')}
        error={errors.coApplicantConsent?.message}
        required
        label="The co-applicant consents to this application and a credit-bureau check."
      />
    </div>
  );
}

export default Step6CoApplicant;
