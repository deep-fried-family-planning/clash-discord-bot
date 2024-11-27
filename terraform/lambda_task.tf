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


module "task_queue" {
  source = "./modules/sqs"

  prefix      = local.prefix
  fn_name     = module.task.fn_name
  timeout     = module.task.fn_timeout
  sqs_retries = 10
  sqs_source_arns = [
    module.poll.fn_arn,
    module.poll.fn_role_arn
  ]
}
