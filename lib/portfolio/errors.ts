export type PortfolioErrorCode =
  | "UNSUPPORTED_FILE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "INVALID_CSV"
  | "INVALID_EXCEL"
  | "MISSING_COLUMNS"
  | "NO_HOLDINGS"
  | "INVALID_ROWS"
  | "UNKNOWN_STOCK"
  | "MARKET_DATA_UNAVAILABLE"
  | "DATABASE_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "INVALID_REQUEST";

/**
 * An error whose message is safe and meaningful to show to the end user.
 * Anything that is not a PortfolioError is logged and replaced with a generic message.
 */
export class PortfolioError extends Error {
  constructor(
    public readonly code: PortfolioErrorCode,
    message: string,
    public readonly details: string[] = []
  ) {
    super(message);
    this.name = "PortfolioError";
  }
}

export function toUserFacingError(err: unknown): { code: string; message: string; details?: string[] } {
  if (err instanceof PortfolioError) {
    return { code: err.code, message: err.message, details: err.details.length ? err.details : undefined };
  }
  console.error("[portfolio] Unexpected error:", err);
  return {
    code: "INTERNAL_ERROR",
    message: "Something went wrong while processing your portfolio. Please try again.",
  };
}
