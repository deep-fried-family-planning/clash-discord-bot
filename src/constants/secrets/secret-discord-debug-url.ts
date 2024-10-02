import {getSecret} from '#src/https/aws-ssm.ts';
import {secretKey, SECRETS} from '#src/internals/secret-keys.ts';

export const SECRET_DISCORD_DEBUG_URL = /* @__PURE__ */ await getSecret(/* @__PURE__ */ secretKey(SECRETS.DISCORD_DEBUG_URL____));
