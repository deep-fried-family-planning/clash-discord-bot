module "poll" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "poll"
  custom_policy_json = data.aws_iam_policy_document.poll.json
  memory             = 256
  timeout            = 300
  fn_env = merge(local.lambda_env, {
    SQS_URL_SCHEDULED_TASK = module.task_queue.fn_sqs_url
    SQS_ARN_SCHEDULED_TASK = module.task_queue.fn_sqs_arn
  })
}

resource "aws_lambda_function_event_invoke_config" "poll" {
  function_name                = module.poll.fn_name
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}

data "aws_iam_policy_document" "poll" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = ["*"]
  }
}
