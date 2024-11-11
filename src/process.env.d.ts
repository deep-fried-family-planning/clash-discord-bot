declare namespace NodeJS {
    interface ProcessEnv {
        LAMBDA_ENV            : string;
        LAMBDA_ROLE_ARN       : string;
        DDB_TRACKING          : string;
        DDB_SNAPSHOTS         : string;
        DDB_OPERATIONS        : string;
        SQS_POLL              : string;
        SQS_APP_DISCORD       : string;
        SQS_SLASH             : string;
        SQS_URL_SCHEDULED_TASK: string;
        SQS_ARN_SCHEDULED_TASK: string;
        DDB_SERVER            : string;

        AWS_LAMBDA_FUNCTION_NAME  : string;
        AWS_REGION                : string;
        AWS_LAMBDA_LOG_GROUP_NAME : string;
        AWS_LAMBDA_LOG_STREAM_NAME: string;
    }
}
