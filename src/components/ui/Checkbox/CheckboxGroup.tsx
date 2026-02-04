import React from 'react';
export interface CheckboxGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  className?: string;
}
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  label,
  error,
  className = ''
}) => {
  return (
    <fieldset className={`space-y-2 ${className}`}>
      {label &&
      <legend className="mb-2 text-sm font-medium text-gray-700">
          {label}
        </legend>
      }
      <div className="space-y-2">{children}</div>
      {error && <p className="mt-1 text-sm text-gray-900">{error}</p>}
    </fieldset>);

};