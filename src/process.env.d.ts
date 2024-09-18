declare namespace NodeJS {
    interface ProcessEnv {
        LAMBDA_ENV     : string;
        DDB_TRACKING   : string;
        DDB_SNAPSHOTS  : string;
        SQS_POLL       : string;
        SQS_APP_DISCORD: string;

        AWS_LAMBDA_FUNCTION_NAME  : string;
        AWS_REGION                : string;
        AWS_LAMBDA_LOG_GROUP_NAME : string;
        AWS_LAMBDA_LOG_STREAM_NAME: string;
    }
}
