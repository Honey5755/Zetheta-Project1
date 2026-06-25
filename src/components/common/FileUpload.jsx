import { useCallback, useId, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../utils/cn.js';
import ErrorMessage from './ErrorMessage.jsx';
import { compressImage, fileToDataUrl, isCompressibleImage } from '../../utils/imageCompression.js';

const MIME_EXTENSIONS = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const buildAccept = (mimes) => mimes.reduce((acc, mime) => {
  acc[mime] = MIME_EXTENSIONS[mime] || [];
  return acc;
}, {});

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DefaultPreview({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  const compressed = file.originalSize && file.originalSize !== file.size;
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-2">
      <div className="flex min-w-0 items-center gap-3">
        {isImage ? (
          <img src={file.dataUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-danger/10 text-xs font-bold text-danger">
            PDF
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
          <p className="text-xs text-slate-500">
            {compressed
              ? `${formatBytes(file.originalSize)} → ${formatBytes(file.size)} (compressed)`
              : formatBytes(file.size)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="tap-target rounded px-2 py-1 text-sm font-semibold text-danger hover:bg-danger/10"
      >
        Remove
      </button>
    </li>
  );
}

/**
 * Drag-and-drop file upload with client-side validation, image compression and
 * preview (Spec A1.6, C2.2 — render-props pattern). Files are stored as
 * `{ name, type, size, originalSize, dataUrl }` and surfaced via `onChange`.
 * Pass `renderPreview(file, onRemove)` to customise preview rendering.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string[]} props.accept     Accepted MIME types.
 * @param {number} props.maxSizeMB
 * @param {boolean} [props.multiple]
 * @param {Array} props.value
 * @param {(files: Array) => void} props.onChange
 * @param {boolean} [props.required]
 * @param {string} [props.error]
 * @param {string} [props.helpText]
 * @param {(file: object, onRemove: () => void) => React.ReactNode} [props.renderPreview]
 */
function FileUpload({
  label, accept, maxSizeMB, multiple = false, value = [], onChange,
  required = false, error, helpText, renderPreview,
}) {
  const statusId = useId();
  const [status, setStatus] = useState('');
  const [localError, setLocalError] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles, fileRejections) => {
      setLocalError(null);
      if (fileRejections.length > 0) {
        const code = fileRejections[0].errors[0]?.code;
        if (code === 'file-too-large') setLocalError(`File exceeds the ${maxSizeMB} MB limit.`);
        else if (code === 'file-invalid-type') setLocalError('Unsupported file type.');
        else setLocalError('File could not be added.');
      }
      if (acceptedFiles.length === 0) return;

      setStatus('Processing file(s)…');
      const newId = () => (globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.round(performance.now())}`);
      const processed = await Promise.all(
        acceptedFiles.map(async (file) => {
          if (isCompressibleImage(file.type)) {
            const { dataUrl, blob } = await compressImage(file);
            return {
              id: newId(),
              name: file.name,
              type: 'image/jpeg',
              size: blob.size,
              originalSize: file.size,
              dataUrl,
            };
          }
          const dataUrl = await fileToDataUrl(file);
          return {
            id: newId(),
            name: file.name,
            type: file.type,
            size: file.size,
            originalSize: file.size,
            dataUrl,
          };
        }),
      );
      const next = multiple ? [...value, ...processed] : processed.slice(0, 1);
      onChange(next);
      setStatus(`${next.length} file${next.length === 1 ? '' : 's'} attached.`);
    },
    [value, onChange, maxSizeMB, multiple],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: buildAccept(accept),
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
  });

  const remove = (index) => onChange(value.filter((_, i) => i !== index));
  const acceptLabel = accept.map((m) => MIME_EXTENSIONS[m]?.[0]).filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        {!required && <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span>}
      </p>

      <div
        {...getRootProps({
          className: cn(
            'tap-target flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition',
            isDragActive ? 'border-brand bg-brand-50' : 'border-slate-300 hover:border-brand',
            (error || localError) && 'border-danger',
          ),
        })}
      >
        <input {...getInputProps({ 'aria-label': `Upload ${label}` })} />
        <p className="text-sm text-slate-600">
          {isDragActive ? 'Drop the file here…' : 'Drag & drop or click to browse'}
        </p>
        <p className="mt-1 text-xs text-slate-500">{`${acceptLabel} · up to ${maxSizeMB} MB`}</p>
      </div>

      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}

      <p id={statusId} role="status" aria-live="polite" className="sr-only">{status}</p>

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((file, index) => (
            <div key={file.id || file.dataUrl}>
              {renderPreview
                ? renderPreview(file, () => remove(index))
                : <DefaultPreview file={file} onRemove={() => remove(index)} />}
            </div>
          ))}
        </ul>
      )}

      <ErrorMessage id={`${statusId}-error`} message={error || localError} />
    </div>
  );
}

export default FileUpload;
