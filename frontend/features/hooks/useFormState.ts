import { useCallback, useMemo } from "react";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

interface UseFormStateProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  isLoading?: boolean;
}

export function useFormState<T extends FieldValues>({
  form,
  isLoading = false,
}: UseFormStateProps<T>) {
  const { formState } = form;
  const { isValid, isDirty, errors, isSubmitting } = formState;

  // Compute form readiness
  const isReady = useMemo(() => {
    return isValid && isDirty && !isLoading && !isSubmitting;
  }, [isValid, isDirty, isLoading, isSubmitting]);

  // Get form status message
  const getStatusMessage = useCallback(() => {
    if (isLoading || isSubmitting) {
      return { type: "loading", message: "กำลังดำเนินการ..." };
    }

    if (!isDirty) {
      return { type: "info", message: "กรุณากรอกข้อมูล" };
    }

    if (Object.keys(errors).length > 0) {
      return { type: "error", message: "กรุณาแก้ไขข้อผิดพลาด" };
    }

    if (isValid) {
      return { type: "success", message: "ข้อมูลถูกต้อง" };
    }

    return { type: "warning", message: "กรุณาตรวจสอบข้อมูล" };
  }, [isDirty, isValid, errors, isLoading, isSubmitting]);

  // Get form completion percentage
  const getCompletionPercentage = useCallback(() => {
    const fields = Object.keys(form.getValues());
    const filledFields = fields.filter((field) => {
      const value = form.getValues(field as Path<T>);
      return value && String(value).trim() !== "";
    });

    return Math.round((filledFields.length / fields.length) * 100);
  }, [form]);

  return {
    isReady,
    isValid,
    isDirty,
    isLoading: isLoading || isSubmitting,
    errors,
    errorCount: Object.keys(errors).length,
    getStatusMessage,
    getCompletionPercentage,
  };
}
