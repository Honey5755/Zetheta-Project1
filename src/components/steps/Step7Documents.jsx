import {
  Controller, useFormContext, useFormState, useWatch,
} from 'react-hook-form';
import FileUpload from '../common/FileUpload.jsx';
import SignatureCanvas from '../common/SignatureCanvas.jsx';
import { getRequiredDocuments } from '../../constants/documents.js';

/**
 * Step 7 — Document Upload & E-Signature (Spec B2.1, A1.6, A1.7, C4).
 * Renders a conditional document checklist plus the signature pad.
 */
function Step7Documents() {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });

  const loanType = useWatch({ control, name: 'loanType' });
  const employmentType = useWatch({ control, name: 'employmentType' });
  const panVerified = useWatch({ control, name: 'panVerified' });

  const documents = getRequiredDocuments({ loanType, employmentType, panVerified });
  const imageHint = 'Images are compressed automatically to speed up upload.';

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Upload the documents below. Accepted formats and size limits are shown on each box.
      </p>

      {documents.map((doc) => (
        <Controller
          key={doc.id}
          name={`documents.${doc.id}`}
          control={control}
          render={({ field }) => (
            <FileUpload
              label={doc.label}
              accept={doc.accept}
              maxSizeMB={doc.maxSizeMB}
              multiple={doc.multiple}
              required={!doc.optional}
              value={field.value || []}
              onChange={field.onChange}
              error={errors.documents?.[doc.id]?.message}
              helpText={doc.accept.includes('image/jpeg') ? imageHint : undefined}
            />
          )}
        />
      ))}

      <Controller
        name="eSignature"
        control={control}
        render={({ field }) => (
          <SignatureCanvas
            label="Your signature"
            required
            value={field.value}
            onChange={field.onChange}
            error={errors.eSignature?.message}
          />
        )}
      />
    </div>
  );
}

export default Step7Documents;
