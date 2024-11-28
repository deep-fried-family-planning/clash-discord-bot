declare namespace NodeJS {
    interface ProcessEnv {
        LAMBDA_ENV      : string;
        LAMBDA_ENV_LOWER: string;
        LAMBDA_ENV_UPPER: string;
        LAMBDA_ROLE_ARN : string;

        DFFP_DISCORD_BOT_TOKEN : string;
        DFFP_DISCORD_PUBLIC_KEY: string;
        DFFP_DISCORD_ERROR_URL : string;
        DFFP_COC_KEY           : string;

        DDB_OPERATIONS         : string;
        SQS_URL_DISCORD_MENU   : string;
        SQS_URL_DISCORD_SLASH  : string;
        SQS_URL_SCHEDULED_TASK : string;
        SQS_ARN_SCHEDULED_TASK : string;
        LAMBDA_ARN_DISCORD_MENU: string;

        LAMBDA_ARN_DISCORD_MENU_DELETE: string;

        AWS_LAMBDA_FUNCTION_NAME  : string;
        AWS_REGION                : string;
        AWS_LAMBDA_LOG_GROUP_NAME : string;
        AWS_LAMBDA_LOG_STREAM_NAME: string;
    }
}
