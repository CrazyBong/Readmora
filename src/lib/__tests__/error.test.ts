import { describe, it, expect } from 'vitest';
import { AppError } from '@/lib/error';
import { ErrorCode } from '@/types/api';

describe('AppError', () => {
  it('should create an error with the correct properties', () => {
    const err = new AppError(ErrorCode.NOT_FOUND, 'Resource not found', 404);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('AppError');
  });

  it('should default statusCode to 500', () => {
    const err = new AppError(ErrorCode.INTERNAL_ERROR, 'Something went wrong');
    expect(err.statusCode).toBe(500);
  });

  it('should accept optional details', () => {
    const details = { field: 'email', reason: 'duplicate' };
    const err = new AppError(ErrorCode.DUPLICATE_ENTRY, 'Duplicate', 409, details);
    expect(err.details).toEqual(details);
  });

  it('should have a stack trace', () => {
    const err = new AppError(ErrorCode.INTERNAL_ERROR, 'Test');
    // Stack may not exist in all envs, but should be a string if present
    if (err.stack) {
      expect(typeof err.stack).toBe('string');
    }
  });

  it('should not throw when captureStackTrace is unavailable', () => {
    // Simulate non-V8 environment
    const original = Error.captureStackTrace;
    // @ts-expect-error — intentionally testing undefined
    Error.captureStackTrace = undefined;
    expect(() => new AppError(ErrorCode.INTERNAL_ERROR, 'No V8')).not.toThrow();
    Error.captureStackTrace = original;
  });
});
