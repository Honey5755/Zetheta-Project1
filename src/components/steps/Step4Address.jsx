import { useEffect } from 'react';
import {
  Controller, useFormContext, useFormState, useWatch,
} from 'react-hook-form';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import CurrencyInput from '../common/CurrencyInput.jsx';
import Checkbox from '../common/Checkbox.jsx';
import { usePinCodeLookup } from '../../hooks/usePinCodeLookup.js';

const RESIDENCE_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'company', label: 'Company-provided' },
  { value: 'family', label: 'Family-owned' },
];

/**
 * Step 4 — Address Information (Spec B2.1, A3.3).
 * PIN-code lookup auto-fills city/state; conditional sections appear for rent,
 * a previous address (< 1 year), and a separate permanent address.
 */
function Step4Address() {
  const { control, register, setValue } = useFormContext();
  const { errors } = useFormState({ control });

  const pinCode = useWatch({ control, name: 'pinCode' });
  const stateValue = useWatch({ control, name: 'state' });
  const residenceType = useWatch({ control, name: 'residenceType' });
  const yearsAtCurrentAddress = useWatch({ control, name: 'yearsAtCurrentAddress' });
  const sameAsPermanent = useWatch({ control, name: 'sameAsPermanent' });

  const lookup = usePinCodeLookup(pinCode);

  // Auto-fill city/state when a new PIN resolves (Spec A3.3). The fields stay
  // editable; we only overwrite when the lookup yields a result.
  useEffect(() => {
    if (lookup.city) setValue('city', lookup.city, { shouldValidate: true });
    if (lookup.state) setValue('state', lookup.state, { shouldValidate: true });
  }, [lookup.city, lookup.state, setValue]);

  const showPrevious = yearsAtCurrentAddress !== '' && Number(yearsAtCurrentAddress) < 1;
  const stateMismatch = Boolean(lookup.state && stateValue && lookup.state !== stateValue);

  return (
    <div className="space-y-6">
      <Input error={errors.currentAddressLine1?.message} required>
        <Input.Label>Current address — line 1</Input.Label>
        <Input.Field {...register('currentAddressLine1')} autoComplete="address-line1" placeholder="House / flat, street" />
        <Input.Error />
      </Input>

      <Input error={errors.currentAddressLine2?.message}>
        <Input.Label>Current address — line 2 (optional)</Input.Label>
        <Input.Field {...register('currentAddressLine2')} autoComplete="address-line2" placeholder="Area, landmark" />
        <Input.Error />
      </Input>

      <Input error={errors.pinCode?.message} required>
        <Input.Label>PIN code</Input.Label>
        <Input.Field
          as="input"
          type="text"
          inputMode="numeric"
          maxLength={6}
          {...register('pinCode')}
          autoComplete="postal-code"
          placeholder="6-digit PIN"
        />
        {lookup.isLoading && <Input.HelpText>Looking up PIN code…</Input.HelpText>}
        {!lookup.isLoading && lookup.postOffice && (
          <Input.HelpText>{`Post office: ${lookup.postOffice}`}</Input.HelpText>
        )}
        {!lookup.isLoading && lookup.error && (
          <p role="alert" aria-live="polite" className="text-sm font-medium text-warning">
            {lookup.error}
          </p>
        )}
        <Input.Error />
      </Input>

      <div className="grid gap-6 sm:grid-cols-2">
        <Input error={errors.city?.message} required>
          <Input.Label>City</Input.Label>
          <Input.Field {...register('city')} autoComplete="address-level2" />
          <Input.Error />
        </Input>

        <Input error={errors.state?.message} required>
          <Input.Label>State</Input.Label>
          <Input.Field {...register('state')} autoComplete="address-level1" />
          {stateMismatch && (
            <p role="alert" aria-live="polite" className="text-sm font-medium text-warning">
              {`This PIN code maps to ${lookup.state}. Please confirm the state is correct.`}
            </p>
          )}
          <Input.Error />
        </Input>
      </div>

      <Select
        label="Residence type"
        required
        placeholder="Select residence type"
        options={RESIDENCE_OPTIONS}
        error={errors.residenceType?.message}
        {...register('residenceType')}
      />

      {residenceType === 'rented' && (
        <Controller
          name="rentAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Monthly rent"
              required
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={errors.rentAmount?.message}
            />
          )}
        />
      )}

      <Input error={errors.yearsAtCurrentAddress?.message} required>
        <Input.Label>Years at current address</Input.Label>
        <Input.Field
          as="input"
          type="number"
          min={0}
          max={50}
          step={1}
          {...register('yearsAtCurrentAddress')}
        />
        <Input.HelpText>If under 1 year, we&rsquo;ll ask for your previous address.</Input.HelpText>
        <Input.Error />
      </Input>

      {showPrevious && (
        <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">Previous address</legend>
          <Input error={errors.previousAddressLine1?.message} required>
            <Input.Label>Previous address — line 1</Input.Label>
            <Input.Field {...register('previousAddressLine1')} autoComplete="off" />
            <Input.Error />
          </Input>
          <Input error={errors.previousPinCode?.message} required>
            <Input.Label>Previous address — PIN code</Input.Label>
            <Input.Field
              as="input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              {...register('previousPinCode')}
              autoComplete="off"
            />
            <Input.Error />
          </Input>
        </fieldset>
      )}

      <Checkbox
        {...register('sameAsPermanent')}
        label="My permanent address is the same as my current address."
      />

      {!sameAsPermanent && (
        <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">Permanent address</legend>
          <Input error={errors.permanentAddressLine1?.message} required>
            <Input.Label>Permanent address — line 1</Input.Label>
            <Input.Field {...register('permanentAddressLine1')} autoComplete="off" />
            <Input.Error />
          </Input>
          <Input error={errors.permanentAddressLine2?.message}>
            <Input.Label>Permanent address — line 2 (optional)</Input.Label>
            <Input.Field {...register('permanentAddressLine2')} autoComplete="off" />
            <Input.Error />
          </Input>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input error={errors.permanentPinCode?.message} required>
              <Input.Label>PIN code</Input.Label>
              <Input.Field
                as="input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                {...register('permanentPinCode')}
                autoComplete="off"
              />
              <Input.Error />
            </Input>
            <Input error={errors.permanentCity?.message} required>
              <Input.Label>City</Input.Label>
              <Input.Field {...register('permanentCity')} autoComplete="off" />
              <Input.Error />
            </Input>
            <Input error={errors.permanentState?.message} required>
              <Input.Label>State</Input.Label>
              <Input.Field {...register('permanentState')} autoComplete="off" />
              <Input.Error />
            </Input>
          </div>
        </fieldset>
      )}
    </div>
  );
}

export default Step4Address;
