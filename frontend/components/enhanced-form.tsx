"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  UseFormReturn,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 🎯 Generic type for form field props
interface PasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
> extends Omit<
    React.ComponentProps<typeof Input>,
    "name" | "value" | "onChange" | "onBlur"
  > {
  field: ControllerRenderProps<TFieldValues, TName>;
  showPasswordToggle?: boolean;
}

export function PasswordInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>({
  field,
  className,
  showPasswordToggle = true,
  ...props
}: PasswordInputProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...field}
        {...props}
        type={showPassword ? "text" : "password"}
        className={cn(
          "ku-border focus:ring-primary/20 dark:focus:ring-primary/40 pr-10",
          className
        )}
      />
      {showPasswordToggle && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">
            {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          </span>
        </Button>
      )}
    </div>
  );
}

// 🎯 Strongly typed FormFieldWrapper
interface FormFieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
> {
  name: TName;
  label: string;
  description?: string;
  required?: boolean;
  form: UseFormReturn<TFieldValues>;
  children: (
    field: ControllerRenderProps<TFieldValues, TName>
  ) => React.ReactNode;
}

export function FormFieldWrapper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>({
  name,
  label,
  description,
  required = false,
  form,
  children,
}: FormFieldWrapperProps<TFieldValues, TName>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-2">
          <FormLabel
            className={cn(
              "text-sm font-medium transition-colors",
              "text-foreground",
              fieldState.error && "text-destructive",
              required &&
                "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
          </FormLabel>
          <FormControl>{children(field)}</FormControl>
          {description && !fieldState.error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

// 🎯 Strongly typed LoadingButton
interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText = "กำลังดำเนินการ...",
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn(
        "transition-all duration-200",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
}

// 🎯 Enhanced Input Component with validation states
interface EnhancedInputProps extends React.ComponentProps<typeof Input> {
  error?: boolean;
  success?: boolean;
  loading?: boolean;
}

export function EnhancedInput({
  className,
  error,
  success,
  loading,
  ...props
}: EnhancedInputProps) {
  return (
    <div className="relative">
      <Input
        className={cn(
          "ku-border transition-all duration-200",
          "focus:ring-primary/20 dark:focus:ring-primary/40",
          error && "border-destructive focus:ring-destructive/20",
          success && "border-emerald-500 focus:ring-emerald-500/20",
          loading && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// 🎯 Form Section Component for better organization
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold ku-text-primary">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// 🎯 Form Actions (Submit/Cancel buttons)
interface FormActionsProps {
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isValid?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function FormActions({
  submitText = "บันทึก",
  cancelText = "ยกเลิก",
  isLoading = false,
  isValid = true,
  onCancel,
  className,
}: FormActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 pt-6", className)}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="ku-border"
        >
          {cancelText}
        </Button>
      )}
      <LoadingButton
        type="submit"
        loading={isLoading}
        disabled={!isValid || isLoading}
        loadingText="กำลังบันทึก..."
      >
        {submitText}
      </LoadingButton>
    </div>
  );
}
