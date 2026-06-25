import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from './Input.jsx';

function renderField(props = {}) {
  return render(
    <Input {...props}>
      <Input.Label>Full name</Input.Label>
      <Input.Field placeholder="As per PAN" />
      <Input.HelpText>Exactly as on your PAN card.</Input.HelpText>
      <Input.Error />
    </Input>,
  );
}

describe('Input (compound field)', () => {
  it('associates the label with the field', () => {
    renderField();
    const field = screen.getByRole('textbox', { name: /full name/i });
    expect(field).toBeInTheDocument();
  });

  it('marks required fields for assistive tech', () => {
    renderField({ required: true });
    const field = screen.getByRole('textbox', { name: /full name/i });
    expect(field.getAttribute('aria-describedby')).toContain('-help');
  });

  it('exposes errors via role=alert, aria-invalid and aria-describedby', () => {
    renderField({ error: 'Full name is required' });
    const field = screen.getByRole('textbox', { name: /full name/i });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Full name is required');
    expect(field.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('does not set aria-invalid when there is no error', () => {
    renderField();
    const field = screen.getByRole('textbox', { name: /full name/i });
    expect(field).not.toHaveAttribute('aria-invalid');
  });
});
