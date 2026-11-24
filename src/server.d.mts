import type { MessagingRequestOptions } from '@ehven/messaging-form-core/server';
import type { ContactSubmission, ContactValidationOptions, ContactValidationMessages } from './index.mjs';

export interface ContactRequestOptions<Env> extends Omit<MessagingRequestOptions<Env, ContactSubmission>, 'validate' | 'successFallback'>, Omit<ContactValidationOptions, 'messages'> {
  validationMessages?: ContactValidationMessages;
  successLocations?: Readonly<Record<string, string>>;
  defaultSuccessLocation?: string;
}
export function handleContactRequest<Env>(request: Request, env: Env, options?: ContactRequestOptions<Env>): Promise<Response>;
