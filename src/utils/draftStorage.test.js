import {
  beforeEach, describe, it, expect,
} from 'vitest';
import {
  saveDraft, findLatestValidDraft, clearAllDrafts, DRAFT_PREFIX,
} from './draftStorage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('draftStorage (Spec C3.4, E3.1)', () => {
  it('encrypts, saves, and restores a draft (heavy fields excluded)', async () => {
    await saveDraft(
      {
        loanType: 'home', pan: 'ABCPE1234F', documents: { pan: [1] }, eSignature: 'data:image/png',
      },
      'kyc',
    );
    const found = await findLatestValidDraft();
    expect(found).not.toBeNull();
    expect(found.step).toBe('kyc');
    expect(found.values.pan).toBe('ABCPE1234F');
    expect(found.values.documents).toBeUndefined();
    expect(found.values.eSignature).toBeUndefined();
  });

  it('purges a corrupt/tampered draft and returns null', async () => {
    localStorage.setItem(`${DRAFT_PREFIX}home`, 'not-valid-ciphertext');
    const found = await findLatestValidDraft();
    expect(found).toBeNull();
    expect(localStorage.getItem(`${DRAFT_PREFIX}home`)).toBeNull();
  });

  it('clearAllDrafts removes every draft', async () => {
    await saveDraft({ loanType: 'personal' }, 'loan-type');
    clearAllDrafts();
    expect(await findLatestValidDraft()).toBeNull();
  });
});
