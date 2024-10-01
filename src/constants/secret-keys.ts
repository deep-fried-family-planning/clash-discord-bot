const ENV = process.env.LAMBDA_ENV.toUpperCase();

export const DISCORD_APP_ID = /* @__PURE__ */ `/DFFP/${ENV}/DISCORD_APP_ID`;
export const DISCORD_PUBLIC_KEY = /* @__PURE__ */ `/DFFP/${ENV}/DISCORD_PUBLIC_KEY`;
export const DISCORD_CLIENT_ID = /* @__PURE__ */ `/DFFP/${ENV}/DISCORD_CLIENT_ID`;
export const DISCORD_CLIENT_SECRET = /* @__PURE__ */ `/DFFP/${ENV}/DISCORD_CLIENT_SECRET`;
export const DISCORD_BOT_TOKEN = /* @__PURE__ */ `/DFFP/${ENV}/DISCORD_BOT_TOKEN`;
export const DISCORD_ERROR_URL = /* @__PURE__ */ `/DFFP/${ENV}/DISCORD_ERROR_URL`;
export const DISCORD_DEBUG_URL = /* @__PURE__ */ `/DFFP/${ENV}/DISCORD_DEBUG_URL`;

export const COC_USER = /* @__PURE__ */ `/DFFP/${ENV}/COC_USER`;
export const COC_PASSWORD = /* @__PURE__ */ `/DFFP/${ENV}/COC_PASSWORD`;
export const COC_KEY = /* @__PURE__ */ `/DFFP/${ENV}/COC_KEY`;
