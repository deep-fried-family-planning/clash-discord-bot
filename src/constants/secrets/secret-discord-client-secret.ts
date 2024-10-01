import {getSecret} from '#src/api/aws-ssm.ts';
import {secretKey, SECRETS} from '#src/constants/secret-keys.ts';

export const SECRET_DISCORD_CLIENT_SECRET = /* @__PURE__ */ await getSecret(/* @__PURE__ */ secretKey(SECRETS.DISCORD_CLIENT_SECRET));
