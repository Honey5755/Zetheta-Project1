/**
 * AES-256-GCM encryption for the auto-save draft (Spec B4.4, C3.4).
 *
 * Loan-application drafts contain PII (PAN, Aadhaar, income, address), so they
 * are encrypted before being written to LocalStorage. We derive a 256-bit key
 * with PBKDF2 from a passphrase + fixed salt. Per the spec a hardcoded
 * passphrase is acceptable for this simulation; a production build would derive
 * a per-user key. Everything runs through the Web Crypto API (window.crypto.subtle).
 */

const PASSPHRASE = 'lendswift-draft-key-v1';
const SALT = new Uint8Array([
  0x4c, 0x65, 0x6e, 0x64, 0x53, 0x77, 0x69, 0x66, 0x74, 0x53, 0x61, 0x6c, 0x74, 0x31, 0x32, 0x33,
]);
const ITERATIONS = 100000;
const IV_LENGTH = 12;

function getCrypto() {
  const c = globalThis.crypto;
  if (!c || !c.subtle) throw new Error('Web Crypto API is unavailable in this environment.');
  return c;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey() {
  const crypto = getCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2', salt: SALT, iterations: ITERATIONS, hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt a string, returning IV-prefixed ciphertext as base64.
 * @param {string} plaintext
 * @returns {Promise<string>}
 */
export async function encryptString(plaintext) {
  const crypto = getCrypto();
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bufferToBase64(combined.buffer);
}

/**
 * Decrypt an IV-prefixed base64 ciphertext back to a string. Throws if the data
 * is tampered with or the key is wrong (GCM authentication failure).
 * @param {string} base64
 * @returns {Promise<string>}
 */
export async function decryptString(base64) {
  const crypto = getCrypto();
  const key = await deriveKey();
  const data = base64ToBytes(base64);
  const iv = data.slice(0, IV_LENGTH);
  const ciphertext = data.slice(IV_LENGTH);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

/** Encrypt a JSON-serialisable value. */
export const encryptJSON = async (value) => encryptString(JSON.stringify(value));

/** Decrypt and JSON-parse a value. Throws on tamper/parse failure. */
export const decryptJSON = async (base64) => JSON.parse(await decryptString(base64));
