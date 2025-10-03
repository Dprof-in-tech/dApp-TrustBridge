"use client";

import * as React from "react";
import { FormProvider, useForm, type UseFormProps } from "react-hook-form";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface EnhancedFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  onSubmit: (data: any) => Promise<void>;
  children: React.ReactNode;
  submitText?: string;
  loadingText?: string;
  resetOnSuccess?: boolean;
  showProgress?: boolean;
  formOptions?: UseFormProps;
  disabled?: boolean;
}

export function EnhancedForm({
  onSubmit,
  children,
  submitText = "Submit",
  loadingText = "Submitting...",
  resetOnSuccess = false,
  showProgress = false,
  formOptions,
  disabled = false,
  className,
  ...props
}: EnhancedFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const methods = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    ...formOptions,
  });

  const {
    handleSubmit,
    reset,
    formState: { isValid },
  } = methods;

  const onSubmitHandler = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(data);
      setSubmitSuccess(true);
      if (resetOnSuccess) {
        reset();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      e.ctrlKey &&
      !disabled &&
      isValid &&
      !isSubmitting
    ) {
      handleSubmit(onSubmitHandler)();
    }
  };

  // Clear success message after 5 seconds
  React.useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmitHandler)}
        onKeyDown={handleKeyDown}
        className={className}
        {...props}
      >
        <div className="space-y-6">
          {children}

          {/* Submit Error */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Submission Failed</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <Alert className="border-green-500 bg-green-500/10 text-green-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-400">Success!</AlertTitle>
              <AlertDescription className="text-green-300">
                Your form was submitted successfully.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || disabled}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {loadingText}
                </>
              ) : (
                submitText
              )}
            </Button>

            {showProgress && isSubmitting && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader className="mr-2 h-3 w-3 animate-spin" />
                Processing transaction...
              </div>
            )}
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter to submit quickly
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
