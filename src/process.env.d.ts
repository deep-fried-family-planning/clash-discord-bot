declare namespace NodeJS {
    interface ProcessEnv {
        LAMBDA_ENV            : string;
        LAMBDA_ROLE_ARN       : string;
        DDB_OPERATIONS        : string;
        SQS_URL_DISCORD_MENU  : string;
        SQS_URL_DISCORD_SLASH : string;
        SQS_URL_SCHEDULED_TASK: string;
        SQS_ARN_SCHEDULED_TASK: string;

        AWS_LAMBDA_FUNCTION_NAME  : string;
        AWS_REGION                : string;
        AWS_LAMBDA_LOG_GROUP_NAME : string;
        AWS_LAMBDA_LOG_STREAM_NAME: string;
    }
}
