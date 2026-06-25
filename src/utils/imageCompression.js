/**
 * Client-side image compression via the Canvas API (Spec C4).
 *
 * Images are scaled to a max width (preserving aspect ratio) and re-encoded as
 * JPEG at quality 0.7; if still over the size budget, quality steps down by 0.1
 * until it fits or reaches the floor. PDFs must NOT be compressed — callers
 * should skip non-image files. All work is async to avoid blocking the UI.
 */

const DEFAULTS = {
  maxWidth: 1200,
  quality: 0.7,
  maxBytes: 2 * 1024 * 1024,
  minQuality: 0.3,
};

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image for compression.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

/**
 * Compress an image file.
 * @param {File} file
 * @param {Partial<typeof DEFAULTS>} [options]
 * @returns {Promise<{ blob: Blob, dataUrl: string, quality: number,
 *   width: number, height: number }>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth, quality, maxBytes, minQuality,
  } = { ...DEFAULTS, ...options };

  const img = await loadImage(file);
  const scale = Math.min(1, maxWidth / img.width);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  let currentQuality = quality;
  let blob = await canvasToBlob(canvas, currentQuality);
  while (blob && blob.size > maxBytes && currentQuality > minQuality) {
    currentQuality = Math.max(minQuality, Math.round((currentQuality - 0.1) * 10) / 10);
    blob = await canvasToBlob(canvas, currentQuality); // eslint-disable-line no-await-in-loop
  }

  const dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
  return {
    blob, dataUrl, quality: currentQuality, width, height,
  };
}

/** True if the MIME type is a compressible image (Spec C4 — not PDFs). */
export const isCompressibleImage = (type) => type === 'image/jpeg' || type === 'image/png';

/** Read any file as a base64 data URL (used for PDFs and previews). */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}
