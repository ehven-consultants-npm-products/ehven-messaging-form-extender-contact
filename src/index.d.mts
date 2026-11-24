import type { IdentityOptions, MessagingIdentity, MessagingValues, ValidationResult } from '@ehven/messaging-form-core';

export const DEFAULT_CONTACT_ENDPOINT: '/api/contact';
export const CONTACT_FIELD_LIMITS: Readonly<{ firstName: 80; lastName: 80; email: 254; source: 80; message: 5000 }>;
export interface ContactSubmission extends MessagingIdentity { message: string }
export type ContactValidationMessages = Partial<Record<'required' | 'too_long' | 'invalid', string>>;
export interface ContactValidationOptions {
  identity?: IdentityOptions;
  messageLimit?: number;
  messageField?: string;
  messages?: ContactValidationMessages;
}

export function createContactValidator(options?: ContactValidationOptions): (values: MessagingValues) => ValidationResult<ContactSubmission>;
export function validateContactSubmission(values: MessagingValues): ValidationResult<ContactSubmission>;
