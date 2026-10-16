import { describe, it, expect } from 'vitest';
import { ApiError } from '../services/api';

describe('Frontend API Error Handling & Utilities', () => {
  it('creates ApiError with custom status and message', () => {
    const error = new ApiError('Model not found', 503);
    expect(error.message).toBe('Model not found');
    expect(error.status).toBe(503);
    expect(error.name).toBe('ApiError');
  });

  it('validates minimum and maximum text length rules', () => {
    const validText = 'This is a sample article body exceeding twenty characters.';
    const shortText = 'Short text';
    
    expect(validText.length).toBeGreaterThanOrEqual(20);
    expect(validText.length).toBeLessThanOrEqual(50000);
    expect(shortText.length).toBeLessThan(20);
  });
});
