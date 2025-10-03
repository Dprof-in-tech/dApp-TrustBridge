"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import {
  debounce,
  formatValidationError,
  getValidationState,
} from "@/lib/validation";

export interface UseFormValidationOptions {
  debounceDelay?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface ValidationState {
  isValidating: boolean;
  validationState: "default" | "validating" | "error" | "success";
  error: string | null;
  touched: boolean;
  value: any;
}

/**
 * Custom hook for enhanced form validation with real-time feedback
 */
export function useFormValidation(
  fieldName: string,
  options: UseFormValidationOptions = {},
) {
  const {
    debounceDelay = 300,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const {
    formState: { errors, touchedFields },
    watch,
    trigger,
    clearErrors,
    setError,
  } = useFormContext();

  const [isValidating, setIsValidating] = useState(false);
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});

  const value = watch(fieldName);
  const error =
    errors[fieldName] ||
    (customErrors[fieldName] ? { message: customErrors[fieldName] } : null);
  const touched = touchedFields[fieldName] || false;

  const validationState = useMemo(
    () => getValidationState(error, touched, value, isValidating),
    [error, touched, value, isValidating],
  );

  /**
   * Debounced validation function
   */
  const debouncedValidate = useMemo(
    () =>
      debounce(async (fieldName: string, value: any) => {
        setIsValidating(true);
        try {
          const result = await trigger(fieldName);
          if (!result) {
            // If trigger failed but no error in formState, it might be a custom validation
            // This will be handled by the validation rules themselves
          }
        } catch (error) {
          console.error("Validation error:", error);
        } finally {
          setIsValidating(false);
        }
      }, debounceDelay),
    [trigger, debounceDelay],
  );

  /**
   * Manual validation trigger
   */
  const validateField = useCallback(
    async (
      value: any,
      customValidator?: (value: any) => Promise<string | undefined>,
    ) => {
      setIsValidating(true);

      try {
        // Clear previous custom errors
        setCustomErrors((prev) => {
          const { [fieldName]: removed, ...rest } = prev;
          return rest;
        });

        // Run custom validation if provided
        if (customValidator) {
          const customError = await customValidator(value);
          if (customError) {
            setCustomErrors((prev) => ({ ...prev, [fieldName]: customError }));
            setIsValidating(false);
            return false;
          }
        }

        // Run form validation
        const result = await trigger(fieldName);
        setIsValidating(false);
        return result;
      } catch (error) {
        console.error("Validation error:", error);
        setIsValidating(false);
        return false;
      }
    },
    [fieldName, trigger],
  );

  /**
   * Clear field errors
   */
  const clearFieldErrors = useCallback(() => {
    clearErrors(fieldName);
    setCustomErrors((prev) => {
      const { [fieldName]: removed, ...rest } = prev;
      return rest;
    });
  }, [fieldName, clearErrors]);

  /**
   * Set custom field error
   */
  const setFieldError = useCallback(
    (errorMessage: string) => {
      setCustomErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
    },
    [fieldName],
  );

  // Effect for real-time validation
  useEffect(() => {
    if (validateOnChange && value !== undefined && value !== "") {
      debouncedValidate(fieldName, value);
    }
  }, [value, fieldName, debouncedValidate, validateOnChange]);

  return {
    // Validation state
    isValidating,
    validationState,
    error: error?.message || null,
    touched,
    value,

    // Methods
    validateField,
    clearFieldErrors,
    setFieldError,

    // Validation helpers
    formatError: (error: any) => formatValidationError(error),
  };
}

/**
 * Hook for managing multiple field validations
 */
export function useMultiFieldValidation(
  fieldNames: string[],
  options: UseFormValidationOptions = {},
) {
  const validations = fieldNames.reduce(
    (acc, fieldName) => {
      acc[fieldName] = useFormValidation(fieldName, options);
      return acc;
    },
    {} as Record<string, ReturnType<typeof useFormValidation>>,
  );

  const hasErrors = useMemo(
    () => Object.values(validations).some((v) => v.error),
    [validations],
  );

  const isValidating = useMemo(
    () => Object.values(validations).some((v) => v.isValidating),
    [validations],
  );

  const allTouched = useMemo(
    () => Object.values(validations).every((v) => v.touched),
    [validations],
  );

  return {
    validations,
    hasErrors,
    isValidating,
    allTouched,
    validateAll: async () => {
      const results = await Promise.all(
        Object.values(validations).map((v) => v.validateField(v.value)),
      );
      return results.every(Boolean);
    },
    clearAllErrors: () => {
      Object.values(validations).forEach((v) => v.clearFieldErrors());
    },
  };
}

/**
 * Hook for form submission state management
 */
export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    formState: { isValid },
  } = useFormContext();

  const submit = useCallback(
    async (submitHandler: () => Promise<void>) => {
      if (isSubmitting || !isValid) return;

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        await submitHandler();
        setSubmitSuccess(true);
      } catch (error) {
        setSubmitError(formatValidationError(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, isValid],
  );

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const clearSubmitSuccess = useCallback(() => {
    setSubmitSuccess(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    canSubmit: isValid && !isSubmitting,
    submit,
    clearSubmitError,
    clearSubmitSuccess,
  };
}
