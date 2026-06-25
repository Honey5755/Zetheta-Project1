import {
  describe, it, expect, beforeEach,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App.jsx';
import useFormStore from '../../store/useFormStore.js';

// The wizard store is a module singleton — reset navigation between tests.
beforeEach(() => {
  useFormStore.getState().resetWizard();
});

describe('Wizard integration', () => {
  it('blocks advancing past step 1 until a loan type is chosen', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /Loan Type & Basic Information/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/select a loan type to continue/i)).toBeInTheDocument();
  });

  it('reveals amount/tenure/purpose after a type is picked, then advances to step 2', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: /Loan Type & Basic Information/i });

    await user.click(screen.getByRole('radio', { name: /Personal Loan/i }));

    const amount = await screen.findByLabelText(/loan amount/i);
    await user.type(amount, '200000');
    await user.selectOptions(screen.getByLabelText(/repayment tenure/i), '24');
    await user.selectOptions(screen.getByLabelText(/purpose of loan/i), 'Travel');

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByRole('heading', { name: /^Personal Information$/i })).toBeInTheDocument();
  });
});
