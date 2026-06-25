import {
  Controller, useFormContext, useFormState,
} from 'react-hook-form';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import RadioGroup from '../common/RadioGroup.jsx';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

/**
 * Step 2 — Personal Information (Spec B2.1). Uses HTML autocomplete tokens
 * (WCAG 1.3.5) and inline, blur-triggered validation.
 */
function Step2PersonalInfo() {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control });

  return (
    <div className="space-y-6">
      <Input error={errors.fullName?.message} required>
        <Input.Label>Full name (as per PAN)</Input.Label>
        <Input.Field {...register('fullName')} autoComplete="name" placeholder="e.g. Anjali Sharma" />
        <Input.Error />
      </Input>

      <Input error={errors.dob?.message} required>
        <Input.Label>Date of birth</Input.Label>
        <Input.Field as="input" type="date" {...register('dob')} autoComplete="bday" />
        <Input.HelpText>You must be between 21 and 65 years old.</Input.HelpText>
        <Input.Error />
      </Input>

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <RadioGroup
            legend="Gender"
            required
            orientation="horizontal"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            error={errors.gender?.message}
            options={GENDER_OPTIONS}
          />
        )}
      />

      <Select
        label="Marital status"
        required
        placeholder="Select status"
        options={MARITAL_OPTIONS}
        error={errors.maritalStatus?.message}
        {...register('maritalStatus')}
      />

      <Input error={errors.fatherName?.message} required>
        <Input.Label>Father&rsquo;s name</Input.Label>
        <Input.Field {...register('fatherName')} autoComplete="off" />
        <Input.Error />
      </Input>

      <Input error={errors.motherName?.message} required>
        <Input.Label>Mother&rsquo;s name</Input.Label>
        <Input.Field {...register('motherName')} autoComplete="off" />
        <Input.Error />
      </Input>

      <Input error={errors.email?.message} required>
        <Input.Label>Email address</Input.Label>
        <Input.Field as="input" type="email" {...register('email')} autoComplete="email" placeholder="you@example.com" />
        <Input.Error />
      </Input>

      <Input error={errors.mobile?.message} required>
        <Input.Label>Mobile number</Input.Label>
        <Input.Field
          as="input"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          {...register('mobile')}
          autoComplete="tel-national"
          placeholder="10-digit mobile"
        />
        <Input.Error />
      </Input>

      <Input error={errors.altMobile?.message}>
        <Input.Label>Alternate mobile (optional)</Input.Label>
        <Input.Field
          as="input"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          {...register('altMobile')}
          autoComplete="off"
        />
        <Input.Error />
      </Input>
    </div>
  );
}

export default Step2PersonalInfo;
