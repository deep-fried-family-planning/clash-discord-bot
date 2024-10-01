import {bindApiCall} from '#src/api/api-call.ts';
import {SECRET_DISCORD_ERROR_URL} from '#src/constants/secrets/secret-discord-error-url.ts';

export const discord_error = /* @__PURE__ */ bindApiCall(SECRET_DISCORD_ERROR_URL);
