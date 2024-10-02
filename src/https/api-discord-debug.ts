import {bindApiCall} from '#src/https/api-call.ts';
import {SECRET_DISCORD_DEBUG_URL} from '#src/constants/secrets/secret-discord-debug-url.ts';

export const discord_debug = /* @__PURE__ */ bindApiCall(SECRET_DISCORD_DEBUG_URL);
