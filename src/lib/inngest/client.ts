import { Inngest } from 'inngest';

/**
 * Singleton Inngest client for background job orchestration.
 */
export const inngest = new Inngest({
  id: 'readmora-app',
  // Optional: Add logging/middleware if needed later
});
