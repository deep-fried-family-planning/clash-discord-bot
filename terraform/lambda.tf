#
# app-discord-deploy
#
module "lambda_app_discord_deploy" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "app_discord_deploy"
  custom_policy_json = data.aws_iam_policy_document.lambda_app_discord_deploy.json
  memory             = 512
  timeout            = 300
  fn_env             = local.lambda_env
}

data "aws_iam_policy_document" "lambda_app_discord_deploy" {
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

resource "aws_lambda_invocation" "lambda_app_discord_deploy" {
  function_name = module.lambda_app_discord_deploy.fn_name
  input         = jsonencode({})
  triggers = {
    redeployment = jsonencode([
#       module.lambda_app_discord_deploy.fn_src_hash
    ])
  }
}


#
# scheduler
#
module "lambda_scheduler" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "scheduler"
  custom_policy_json = data.aws_iam_policy_document.lambda_scheduler.json
  memory             = 512
  timeout            = 120
  fn_env = merge(local.lambda_env, {
    SQS_URL_SCHEDULED_TASK = module.lambda_scheduled_task.fn_sqs_url
  })
}

resource "aws_lambda_function_event_invoke_config" "example" {
  function_name                = module.lambda_scheduler.fn_name
  maximum_event_age_in_seconds = 120
  maximum_retry_attempts       = 0
}

data "aws_iam_policy_document" "lambda_scheduler" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
  // todo IAM security
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = ["*"]
  }
}


#
# slash
#
module "lambda_slash" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "slash"
  custom_policy_json = data.aws_iam_policy_document.lambda_slash.json
  memory             = 1024
  timeout            = 300
  fn_env             = merge(local.lambda_env, {})
  sqs                = true
  sqs_source_arns    = [module.lambda_slash.fn_arn]
}

data "aws_iam_policy_document" "lambda_slash" {
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

#
# slash
#
module "lambda_scheduled_task" {
  source = "./modules/lambda"

  acc_id             = local.account_id
  custom_policy_json = data.aws_iam_policy_document.lambda_scheduler.json
  fn_env             = local.lambda_env
  fn_name            = "scheduled_task"
  memory             = 512
  prefix             = local.prefix
  timeout            = 300
  sqs                = true
  sqs_source_arns    = [module.lambda_scheduler.fn_arn]
}
