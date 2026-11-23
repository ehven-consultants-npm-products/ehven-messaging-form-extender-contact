# Messaging Form Extender: Contact

Development candidate `0.1.0-dev.0`; not published. MIT licensed. Adds required-message validation and contact handler composition to `@ehven/messaging-form-core`. No Astro, WordPress, CRM or email transport is included.

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

## Installation and compatibility

The peer requirement is `@ehven/messaging-form-core@^0.1.0-dev.0`. Current verification installs reviewed local core/extender tarballs together into a fresh offline consumer. Neither package is available from npm yet. No runtime dependencies other than that explicit core peer are required; no install hooks run. Browser rendering belongs to the host adapter. Node 24 contract tests pass; deployed framework/provider acceptance remains pending.

Uninstall by removing this handler/validator from application composition and then uninstalling the package. Existing remote provider records are not deleted. This development candidate carries no public response-time SLA; release documentation will identify its support/security routes before publication.
