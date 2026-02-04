import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
export interface CheckboxProps extends
  React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  indeterminate?: boolean;
  icon?: React.ReactNode;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
  {
    label,
    size = 'md',
    error = false,
    indeterminate = false,
    disabled = false,
    className = '',
    icon,
    onChange,
    ...props
  },
  ref) =>
  {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    return (
      <label
        className={`inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>

        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className={`
              peer
              appearance-none
              border
              border-gray-400
              ${sizeClasses[size]}
              rounded
              transition-all
              duration-150
              ${error ? 'border-gray-900' : ''}
              ${disabled ? 'bg-gray-100' : 'hover:border-gray-600 focus:border-gray-800'}
              focus:outline-none
              focus:ring-2
              focus:ring-gray-200
              ${className}
            `}
            onChange={onChange}
            {...props} />

          <div
            className={`
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              transform
              opacity-0
              transition-opacity
              duration-150
              peer-checked:opacity-100
              ${sizeClasses[size]}
            `}>

            {icon || (
            indeterminate ?
            <Minus className="h-full w-full stroke-gray-800" /> :

            <Check className="h-full w-full stroke-gray-800" />)
            }
          </div>
        </div>
        {label &&
        <span
          className={`${labelSizeClasses[size]} ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>

            {label}
          </span>
        }
      </label>);

  }
);
Checkbox.displayName = 'Checkbox';