const ENV = process.env.LAMBDA_ENV.toUpperCase();

export const DISCORD_APP_ID = `/DFFP/${ENV}/DISCORD_APP_ID`;
export const DISCORD_PUBLIC_KEY = `/DFFP/${ENV}/DISCORD_PUBLIC_KEY`;
export const DISCORD_CLIENT_ID = `/DFFP/${ENV}/DISCORD_CLIENT_ID`;
export const DISCORD_CLIENT_SECRET = `/DFFP/${ENV}/DISCORD_CLIENT_SECRET`;
export const DISCORD_BOT_TOKEN = `/DFFP/${ENV}/DISCORD_BOT_TOKEN`;
export const DISCORD_ERROR_URL = `/DFFP/${ENV}/DISCORD_ERROR_URL`;
export const DISCORD_DEBUG_URL = `/DFFP/${ENV}/DISCORD_DEBUG_URL`;

export const COC_USER = `/DFFP/${ENV}/COC_USER`;
export const COC_PASSWORD = `/DFFP/${ENV}/COC_PASSWORD`;
