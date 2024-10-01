import {getSecret} from '#src/api/aws-ssm.ts';
import {secretKey, SECRETS} from '#src/constants/secret-keys.ts';

export const SECRET_DISCORD_BOT_TOKEN = /* @__PURE__ */ await getSecret(/* @__PURE__ */ secretKey(SECRETS.DISCORD_BOT_TOKEN____));
