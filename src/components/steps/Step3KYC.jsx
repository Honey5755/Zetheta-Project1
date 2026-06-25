import { useEffect } from 'react';
import {
  Controller, useFormContext, useFormState, useWatch,
} from 'react-hook-form';
import MaskedInput from '../common/MaskedInput.jsx';
import Input from '../common/Input.jsx';
import Checkbox from '../common/Checkbox.jsx';
import { useVerification } from '../../hooks/useVerification.js';
import { isValidAadhaar, panErrorMessage } from '../../utils/validators.js';

/** Inline verification badge shown inside the PAN/Aadhaar inputs. */
function VerifyBadge({ status }) {
  if (status === 'verifying') {
    return (
      <span className="flex items-center gap-1 text-xs text-slate-500">
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-brand"
          aria-hidden="true"
        />
        <span className="sr-only">Verifying</span>
      </span>
    );
  }
  if (status === 'verified') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-accent-700">
        <span aria-hidden="true">✓</span>
        <span className="sr-only">Verified</span>
      </span>
    );
  }
  return null;
}

/**
 * Step 3 — Identity Verification / KYC (Spec B2.1, A3.2).
 */
function Step3KYC() {
  const { control, register, setValue } = useFormContext();
  const { errors } = useFormState({ control });
  const loanType = useWatch({ control, name: 'loanType' });
  const loanAmount = useWatch({ control, name: 'loanAmount' });

  const pan = useVerification();
  const aadhaar = useVerification();

  // Mirror the simulated verification result into the form so the schema can
  // gate progression and Step 7 can read PAN-verified status (Spec B3).
  useEffect(() => {
    setValue('panVerified', pan.isVerified);
  }, [pan.isVerified, setValue]);
  useEffect(() => {
    setValue('aadhaarVerified', aadhaar.isVerified);
  }, [aadhaar.isVerified, setValue]);

  const showPassport = loanType === 'home' && Number(loanAmount) > 5000000;

  return (
    <div className="space-y-6">
      <Controller
        name="pan"
        control={control}
        render={({ field }) => (
          <div>
            <MaskedInput
              label="PAN (Permanent Account Number)"
              required
              name={field.name}
              value={field.value}
              maxLength={10}
              visibleSuffix={4}
              transform={(raw) => raw.toUpperCase()}
              placeholder="AAAAA9999A"
              error={errors.pan?.message}
              endAdornment={<VerifyBadge status={pan.status} />}
              onChange={(v) => {
                field.onChange(v);
                pan.reset();
              }}
              onBlur={() => {
                field.onBlur();
                pan.verify(field.value, (v) => {
                  const message = panErrorMessage(v, loanType);
                  return { valid: message === null, message: message || '' };
                });
              }}
            />
            <p aria-live="polite" className="sr-only">
              {pan.isVerifying ? 'Verifying PAN' : ''}
              {pan.isVerified ? 'PAN verified' : ''}
            </p>
          </div>
        )}
      />

      <Controller
        name="aadhaar"
        control={control}
        render={({ field }) => (
          <div>
            <MaskedInput
              label="Aadhaar number"
              required
              name={field.name}
              value={field.value}
              maxLength={12}
              visibleSuffix={4}
              transform={(raw) => raw.replace(/\D/g, '')}
              placeholder="12-digit Aadhaar"
              error={errors.aadhaar?.message}
              endAdornment={<VerifyBadge status={aadhaar.status} />}
              onChange={(v) => {
                field.onChange(v);
                aadhaar.reset();
              }}
              onBlur={() => {
                field.onBlur();
                aadhaar.verify(field.value, (v) => ({
                  valid: isValidAadhaar(v),
                  message: 'Enter a valid 12-digit Aadhaar number (checksum failed).',
                }));
              }}
            />
            <p aria-live="polite" className="sr-only">
              {aadhaar.isVerifying ? 'Verifying Aadhaar' : ''}
              {aadhaar.isVerified ? 'Aadhaar verified' : ''}
            </p>
          </div>
        )}
      />

      <Checkbox
        {...register('aadhaarConsent')}
        error={errors.aadhaarConsent?.message}
        required
        label="I consent to LendSwift verifying my Aadhaar with UIDAI for KYC purposes."
        helpText="Consent is collected separately and is required by RBI digital-lending rules."
      />

      <Input error={errors.voterId?.message}>
        <Input.Label>Voter ID (optional)</Input.Label>
        <Input.Field {...register('voterId')} placeholder="ABC1234567" autoComplete="off" />
        <Input.HelpText>3 letters followed by 7 digits.</Input.HelpText>
        <Input.Error />
      </Input>

      {showPassport && (
        <Input error={errors.passport?.message}>
          <Input.Label>Passport number</Input.Label>
          <Input.Field {...register('passport')} placeholder="A1234567" autoComplete="off" />
          <Input.HelpText>
            Required reference for high-value home loans above ₹50 lakh.
          </Input.HelpText>
          <Input.Error />
        </Input>
      )}
    </div>
  );
}

export default Step3KYC;
