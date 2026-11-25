# Messaging Form Extender: Contact

MIT licensed. Adds required-message validation and contact handler composition to `@ehven/messaging-form-core`. No Astro, WordPress, CRM or email transport is included.

## Install

```sh
npm install @ehven/messaging-form-core @ehven/messaging-form-extender-contact
```

## Shared validation

```js
import {createContactValidator} from '@ehven/messaging-form-extender-contact';

const validate = createContactValidator({
  identity: {allowedSources:['contact']},
  messageLimit: 5000,
  messageField: 'message',
  messages: {required:'Enter a message.'},
});
```

Identity policy uses core's declarative options. Messages normalize CRLF/CR to LF and trim surrounding whitespace; internal line breaks remain. Empty, over-limit, non-string and disallowed-control values fail with field errors. Limits count UTF-16 code units. Message names must be distinct from identity names. Optional validation copy keys are `required`, `too_long` and `invalid`.

`validateContactSubmission(values)` uses defaults. `CONTACT_FIELD_LIMITS.message` is 5000; `DEFAULT_CONTACT_ENDPOINT` is `/api/contact`, a convenience constant rather than an installed route. The validator returns core's `{ok,spam,errors,data}` contract and adds `data.message`.

## Server composition

```js
import {handleContactRequest} from '@ehven/messaging-form-extender-contact/server';

export function processContact(request, env, {verifyHuman,deliver}) {
  // Authorize and rate-limit in your host before processing.
  return handleContactRequest(request, env, {
    verifyHuman, deliver,
    identity: {allowedSources:['contact']},
    successLocations: {contact:'/thank-you/'},
  });
}
```

The helper supplies validation and the message field to core. Other transport options are passed through, including verification, delivery pipeline, response copy, limits and simulation routing. Use `validationMessages` for message-field errors; `messages` belongs to the HTTP processor. The native redirect fallback is `/`; applications migrating the website's `/contact/?contact=sent` behavior must explicitly supply their existing route. Unsafe redirects remain rejected by core.

The package does not record or send anything on its own. Configure provider callbacks; keep credentials, site identities, authorization, logging and retention in the host. A receipt failure after accepted recording can be handled by core's optional delivery pipeline. No queue, persistent idempotency, telemetry or access grants are included.

## Compatibility and removal

Requires Node.js 24 or later and Messaging Form Core ^0.1.0. TypeScript declarations are included. Renderer, authorization and live provider behavior depend on the host application.

Remove imports and application composition before uninstalling. Previously accepted provider submissions remain subject to the host’s retention policy.

## Support

Patch releases within 0.1 are intended to be compatible. Future 0.x minor releases may change APIs. Open an issue for bugs and usage questions. For a security concern, use the contact form to request a private reporting channel and keep credentials, tokens and submissions out of the public tracker. [Issues](https://github.com/ehven-consultants-npm-products/ehven-messaging-form-extender-contact/issues) · [Contact](https://ehven.com/contact/)
