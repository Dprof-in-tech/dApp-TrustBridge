"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, watch } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;
  const value = watch(fieldContext.name);

  // Determine validation state
  const getValidationState = () => {
    if (fieldState.error) return "error";
    if (fieldState.isDirty && !fieldState.error && value) return "success";
    return "default";
  };

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    validationState: getValidationState(),
    value,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  children,
  required,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn(
        "flex items-center gap-1 text-sm font-medium",
        "data-[error=true]:text-destructive",
        className,
      )}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  );
}

function FormControl({
  className,
  showValidationIcon = false,
  isValidating = false,
  ...props
}: React.ComponentProps<typeof Slot> & {
  showValidationIcon?: boolean;
  isValidating?: boolean;
}) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    validationState,
    value,
  } = useFormField();

  const validationIcon = React.useMemo(() => {
    if (isValidating)
      return <Loader className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (validationState === "error")
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (validationState === "success")
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  }, [isValidating, validationState]);

  return (
    <div className="relative">
      <Slot
        data-slot="form-control"
        id={formItemId}
        className={cn(
          showValidationIcon && validationIcon && "pr-10",
          validationState === "error" &&
            "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          validationState === "success" &&
            "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20",
          className,
        )}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />

      {/* Validation Icon */}
      {showValidationIcon && validationIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validationIcon}
        </div>
      )}
    </div>
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  variant = "error",
  ...props
}: React.ComponentProps<"p"> & {
  variant?: "error" | "warning" | "success" | "info";
}) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  const variantStyles = {
    error: "text-destructive",
    warning: "text-yellow-500",
    success: "text-green-500",
    info: "text-muted-foreground",
  };

  const variantIcon = {
    error: <AlertCircle className="h-3 w-3" />,
    warning: <AlertCircle className="h-3 w-3" />,
    success: <CheckCircle className="h-3 w-3" />,
    info: null,
  };

  const currentVariant = error ? "error" : variant;

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        "flex items-center gap-1 text-sm",
        variantStyles[currentVariant],
        className,
      )}
      role={currentVariant === "error" ? "alert" : undefined}
      aria-live={currentVariant === "error" ? "polite" : undefined}
      {...props}
    >
      {variantIcon[currentVariant]}
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
