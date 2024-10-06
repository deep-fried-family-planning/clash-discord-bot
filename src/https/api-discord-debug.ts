import {bindApiCall} from '#src/https/api-call.ts';
import {SECRET} from '#src/internals/secrets.ts';

export const discord_debug = /* @__PURE__ */ bindApiCall(SECRET.DISCORD_DEBUG_URL);
