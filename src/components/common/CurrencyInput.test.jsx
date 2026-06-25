import {
  describe, it, expect, vi,
} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CurrencyInput from './CurrencyInput.jsx';

describe('CurrencyInput', () => {
  it('displays the value with Indian grouping', () => {
    render(<CurrencyInput label="Loan amount" value={1050000} onChange={() => {}} />);
    const field = screen.getByRole('textbox', { name: /loan amount/i });
    expect(field).toHaveValue('10,50,000');
  });

  it('emits a numeric value, stripping non-digit characters', () => {
    const onChange = vi.fn();
    render(<CurrencyInput label="Loan amount" value="" onChange={onChange} />);
    const field = screen.getByRole('textbox', { name: /loan amount/i });
    fireEvent.change(field, { target: { value: '2,00,000' } });
    expect(onChange).toHaveBeenCalledWith(200000);
  });

  it('emits an empty string when cleared', () => {
    const onChange = vi.fn();
    render(<CurrencyInput label="Loan amount" value={50000} onChange={onChange} />);
    const field = screen.getByRole('textbox', { name: /loan amount/i });
    fireEvent.change(field, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });
});
