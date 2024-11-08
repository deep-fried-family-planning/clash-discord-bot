export const buildCloudWatchLink = () =>
    `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?`
    + `region=${process.env.AWS_REGION}`
    + `#logsV2:log-groups/log-group/`
    + encodeURIComponent(process.env.AWS_LAMBDA_LOG_GROUP_NAME)
    + '/log-events/'
    + encodeURIComponent(process.env.AWS_LAMBDA_LOG_STREAM_NAME);
