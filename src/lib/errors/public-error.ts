import { logger } from "@/lib/logger";

import { AppError, type ErrorCategory, type FieldErrors } from "./app-error";
import { DEFAULT_ERROR_MESSAGES } from "./messages";

/** Bentuk error yang aman dikirim ke client: tanpa stack trace / detail teknis. */
export type PublicError = {
  category: ErrorCategory;
  message: string;
  errorId: string;
  retryable: boolean;
  fieldErrors?: FieldErrors;
};

export function toPublicError(error: unknown, context?: Record<string, unknown>): PublicError {
  const appError =
    error instanceof AppError ? error : new AppError("UNEXPECTED", { cause: error });

  const isExpected = appError.category === "VALIDATION" || appError.category === "AUTHENTICATION";
  logger[isExpected ? "warn" : "error"]("request_failed", {
    ...context,
    errorId: appError.errorId,
    category: appError.category,
    detail: appError.message,
    cause: appError.cause instanceof Error ? appError.cause.message : appError.cause,
  });

  const preset = DEFAULT_ERROR_MESSAGES[appError.category];
  return {
    category: appError.category,
    message: appError.userMessage ?? preset.message,
    errorId: appError.errorId,
    retryable: preset.retryable,
    ...(appError.fieldErrors && { fieldErrors: appError.fieldErrors }),
  };
}
