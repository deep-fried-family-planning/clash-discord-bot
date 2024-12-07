module "task" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "task"
  custom_policy_json = data.aws_iam_policy_document.task.json
  memory             = 256
  timeout            = 300
  fn_env = merge(local.lambda_env, {

  })
}

module "task_queue" {
  source = "./modules/sqs"

  prefix      = local.prefix
  fn_name     = module.task.fn_name
  timeout     = module.task.fn_timeout
  sqs_retries = 5
  sqs_source_arns = [
    module.poll.fn_arn,
    module.poll.fn_role_arn,
    module.ix_slash.fn_role_arn,
    module.ix_slash.fn_arn,
  ]
}

resource "aws_lambda_permission" "task_queue" {
  function_name = module.task.fn_arn
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
  source_arn    = module.task_queue.fn_sqs_arn
}

resource "aws_lambda_event_source_mapping" "task_queue" {
  function_name    = module.task.fn_arn
  event_source_arn = module.task_queue.fn_sqs_arn
}

data "aws_iam_policy_document" "task" {
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
