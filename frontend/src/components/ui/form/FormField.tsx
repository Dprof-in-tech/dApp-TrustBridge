"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ValidationRules {
  required?: boolean | string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined | Promise<string | undefined>;
}

export interface FormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "password" | "tel";
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRules;
  showValidation?: "always" | "on-blur" | "on-submit";
  children?: React.ReactNode;
  className?: string;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  description,
  required,
  disabled,
  validation,
  showValidation = "on-blur",
  children,
  className,
}: FormFieldProps) {
  const {
    register,
    formState: { errors, touchedFields },
    watch,
  } = useFormContext();

  const value = watch(name);
  const error = errors[name];
  const touched = touchedFields[name];
  const [isValidating, setIsValidating] = React.useState(false);

  // Debounced validation for custom rules
  const debouncedValidation = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return async (value: any) => {
      if (validation?.custom) {
        setIsValidating(true);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            const customError = await validation.custom!(value);
            setIsValidating(false);
            return customError;
          } catch (err) {
            setIsValidating(false);
            return "Validation error";
          }
        }, 300);
      }
    };
  }, [validation]);

  React.useEffect(() => {
    if (value && showValidation === "always") {
      debouncedValidation(value);
    }
  }, [value, debouncedValidation, showValidation]);

  const validationState = React.useMemo(() => {
    if (isValidating) return "validating";
    if (error) return "error";
    if (touched && value && !error) return "success";
    return "default";
  }, [isValidating, error, touched, value]);

  const validationIcon = {
    validating: (
      <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
    ),
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    default: null,
  };

  const inputClassName = cn(
    "pr-10",
    validationState === "error" &&
      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
    validationState === "success" &&
      "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20",
    className,
  );

  return (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="flex items-center gap-1 text-sm font-medium text-neutral-300"
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="relative">
        {children || (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClassName}
            aria-invalid={!!error}
            aria-describedby={`${name}-description ${name}-error`}
            {...register(name, {
              required:
                required &&
                (typeof validation?.required === "string"
                  ? validation.required
                  : `${label} is required`),
              min: validation?.min && {
                value: validation.min,
                message: `Minimum value is ${validation.min}`,
              },
              max: validation?.max && {
                value: validation.max,
                message: `Maximum value is ${validation.max}`,
              },
              minLength: validation?.minLength && {
                value: validation.minLength,
                message: `Minimum length is ${validation.minLength} characters`,
              },
              maxLength: validation?.maxLength && {
                value: validation.maxLength,
                message: `Maximum length is ${validation.maxLength} characters`,
              },
              pattern: validation?.pattern && {
                value: validation.pattern,
                message: "Invalid format",
              },
            })}
          />
        )}

        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validationIcon[validationState]}
        </div>
      </div>

      {/* Description */}
      {description && !error && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={`${name}-error`}
          className="flex items-center gap-1 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </div>
      )}

      {/* Screen reader support */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {error && `Error in ${label}: ${error.message}`}
      </div>
    </div>
  );
}
