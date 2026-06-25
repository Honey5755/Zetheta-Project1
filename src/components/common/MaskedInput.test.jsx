import {
  describe, it, expect, vi,
} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MaskedInput from './MaskedInput.jsx';

describe('MaskedInput', () => {
  it('masks all but the last four characters when unfocused', () => {
    render(<MaskedInput label="PAN" value="ABCDE1234F" onChange={() => {}} />);
    const field = screen.getByRole('textbox', { name: /pan/i });
    expect(field).toHaveValue('••••••234F');
  });

  it('reveals the real value while focused for editing', () => {
    render(<MaskedInput label="PAN" value="ABCDE1234F" onChange={() => {}} />);
    const field = screen.getByRole('textbox', { name: /pan/i });
    fireEvent.focus(field);
    expect(field).toHaveValue('ABCDE1234F');
  });

  it('applies the transform before calling onChange', () => {
    const onChange = vi.fn();
    render(
      <MaskedInput
        label="PAN"
        value=""
        onChange={onChange}
        transform={(raw) => raw.toUpperCase()}
      />,
    );
    const field = screen.getByRole('textbox', { name: /pan/i });
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: 'abcde1234f' } });
    expect(onChange).toHaveBeenCalledWith('ABCDE1234F');
  });
});
