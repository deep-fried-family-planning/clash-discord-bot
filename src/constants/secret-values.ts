import {COC_KEY, DISCORD_ERROR_URL, DISCORD_APP_ID, DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_PUBLIC_KEY} from '#src/constants/secret-keys.ts';
import {getSecret} from '#src/api/aws-ssm.ts';

export const SECRET_DISCORD_PUBLIC_KEY = /* @__PURE__ */ await getSecret(DISCORD_PUBLIC_KEY);
export const SECRET_DISCORD_APP_ID = /* @__PURE__ */ await getSecret(DISCORD_APP_ID);
export const SECRET_DISCORD_CLIENT_ID = /* @__PURE__ */ await getSecret(DISCORD_CLIENT_ID);
export const SECRET_DISCORD_CLIENT_SECRET = /* @__PURE__ */ await getSecret(DISCORD_CLIENT_SECRET);
export const SECRET_DISCORD_BOT_TOKEN = /* @__PURE__ */ await getSecret(DISCORD_BOT_TOKEN);
export const SECRET_DISCORD_ERROR_URL = /* @__PURE__ */ await getSecret(DISCORD_ERROR_URL);

export const SECRET_COC_KEY = /* @__PURE__ */ await getSecret(COC_KEY);
