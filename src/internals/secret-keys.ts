export const enum SECRETS {
    DISCORD_APP_ID_______ = `/DFFP/{ENV}/DISCORD_APP_ID`,
    DISCORD_PUBLIC_KEY___ = `/DFFP/{ENV}/DISCORD_PUBLIC_KEY`,
    DISCORD_CLIENT_ID____ = `/DFFP/{ENV}/DISCORD_CLIENT_ID`,
    DISCORD_CLIENT_SECRET = `/DFFP/{ENV}/DISCORD_CLIENT_SECRET`,
    DISCORD_BOT_TOKEN____ = `/DFFP/{ENV}/DISCORD_BOT_TOKEN`,

    DISCORD_ERROR_URL____ = `/DFFP/{ENV}/DISCORD_ERROR_URL`,
    DISCORD_DEBUG_URL____ = `/DFFP/{ENV}/DISCORD_DEBUG_URL`,

    COC_USER_____________ = `/DFFP/{ENV}/COC_USER`,
    COC_PASSWORD_________ = `/DFFP/{ENV}/COC_PASSWORD`,
    COC_KEY______________ = `/DFFP/{ENV}/COC_KEY`,
}

export const secretKey = (s: SECRETS) => s.replace(
    '{ENV}',
    process.env.LAMBDA_ENV.toUpperCase());
