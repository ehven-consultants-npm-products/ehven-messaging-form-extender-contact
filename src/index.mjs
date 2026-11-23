import { MESSAGING_FIELD_LIMITS, createIdentityValidator } from '@ehven/messaging-form-core';

export const DEFAULT_CONTACT_ENDPOINT = '/api/contact';
export const CONTACT_FIELD_LIMITS = Object.freeze({ ...MESSAGING_FIELD_LIMITS, message: 5000 });

export function createContactValidator({ identity, messageLimit = 5000, messageField = 'message', messages = {} } = {}) {
  if (!Number.isSafeInteger(messageLimit) || messageLimit < 1 || messageLimit > 32768 || typeof messageField !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(messageField)) throw new TypeError('Invalid contact field policy.');
  if (new Set(['first_name','last_name','email','email_confirmation','source','website',...Object.values(identity?.fieldNames??{})]).has(messageField)) throw new TypeError('The message field must be distinct from identity fields.');
  if (!messages || typeof messages !== 'object' || Array.isArray(messages) || Object.keys(messages).some(key => !['required','too_long','invalid'].includes(key)) || Object.values(messages).some(value => typeof value !== 'string' || value.length > 2000)) throw new TypeError('Invalid contact messages.');
  const validateIdentity = createIdentityValidator(identity);
  const copy = { required: 'Enter a message.', too_long: 'Your message is too long.', invalid: 'Enter a valid message.', ...messages };
  return values => {
    const result = validateIdentity(values), raw = values[messageField], errors = [...result.errors];
    const message = typeof raw === 'string' ? raw.replace(/\r\n?/g, '\n').trim() : '';
    const code = raw != null && typeof raw !== 'string' || typeof raw === 'string' && /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(raw) ? 'invalid' : !message ? 'required' : message.length > messageLimit ? 'too_long' : undefined;
    if (code) errors.push({ field: messageField, code, message: copy[code] });
    return { ...result, ok: errors.length === 0, errors, data: { ...result.data, message } };
  };
}

const defaultValidator = createContactValidator();
export function validateContactSubmission(values) { return defaultValidator(values); }
