import { handleMessagingRequest } from '@ehven/messaging-form-core/server';
import { createContactValidator } from './index.mjs';

export function handleContactRequest(request, env, {
  identity, messageLimit, messageField = 'message', validationMessages,
  successLocations = {}, defaultSuccessLocation = '/', successLocation, fields = [], ...options
} = {}) {
  return handleMessagingRequest(request, env, {
    ...options,
    fields: [...new Set([messageField, ...fields])],
    validate: createContactValidator({ identity, messageLimit, messageField, messages: validationMessages }),
    successFallback: defaultSuccessLocation,
    successLocation: successLocation ?? (source => Object.hasOwn(successLocations, source) ? successLocations[source] : defaultSuccessLocation),
  });
}
