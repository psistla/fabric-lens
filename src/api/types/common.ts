export interface PaginatedResponse<T> {
  value: T[];
  continuationToken?: string;
  continuationUri?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errorCode?: string;
}

export class FabricApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: string | undefined;

  constructor(statusCode: number, message: string, errorCode?: string) {
    super(message);
    this.name = 'FabricApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
