import {bindApiCall} from '#src/https/api-call.ts';
import {SECRET} from '#src/internals/secrets.ts';

export const discord_error = /* @__PURE__ */ bindApiCall(SECRET.DISCORD_ERROR_URL);
