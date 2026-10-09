import { API_BASE_URL } from '../config';
import type { ApiErrorResponse } from './flight.types';

/** Every failed request surfaces as this one shape, so screens never inspect raw responses. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * A cancelled request is not a failure: the caller aborted it on purpose (e.g. the filter changed).
 * Checked by name because React Native's fetch rejects with a DOMException, which is not always an Error instance.
 */
export function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  return typeof body === 'object' && body !== null && 'error' in body;
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const startedAt = Date.now();
  if (__DEV__) console.log(`[api] → GET ${path}`);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      if (__DEV__) console.log(`[api] ✕ aborted ${path}`);
      throw error;
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Sunucuya ulaşılamadı.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (__DEV__) console.log(`[api] ← ${response.status} ${path} (${Date.now() - startedAt} ms)`);

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message);
    }
    throw new ApiError(response.status, 'UNKNOWN', 'Beklenmeyen bir hata oluştu.');
  }

  // The mock service is the contract owner (case-kit/flight.types.ts); we trust its shape rather than validating at runtime.
  return body as T;
}
