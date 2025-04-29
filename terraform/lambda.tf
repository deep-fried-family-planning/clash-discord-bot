locals {
  lambda_env = merge(
    { for k, v in local.ssm_names : k => data.aws_ssm_parameter.ssm_param[k].value },
    {
      LAMBDA_ENV       = local.env
      LAMBDA_ENV_UPPER = upper(local.env)
      LAMBDA_ENV_LOWER = lower(local.env)
      LAMBDA_PREFIX    = local.prefix
      DDB_OPERATIONS   = aws_dynamodb_table.operations.name
    }
  )
}

//
// POST /interactions
//
module "ix_api" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "ix_api"
  custom_policy_json = data.aws_iam_policy_document.ix_api.json
  memory             = 512
  timeout            = 3
  fn_env = merge(local.lambda_env, {
    LAMBDA_ARN_IX_MENU  = module.ix_menu.fn_arn
    LAMBDA_ARN_IX_SLASH = module.ix_slash.fn_arn
    LAMBDA_ARN_DISCORD_MENU = module.ix_menu.fn_arn
  })
}

resource "aws_lambda_function_event_invoke_config" "ix_api" {
  function_name                = module.ix_api.fn_arn
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}

resource "aws_lambda_permission" "ix_api_post" {
  function_name = module.ix_api.fn_name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${local.aws_region}:${local.account_id}:${aws_api_gateway_rest_api.webhook.id}/*/${aws_api_gateway_method.ix_post.http_method}${aws_api_gateway_resource.ix.path}"
}

data "aws_iam_policy_document" "ix_api" {
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

//
// Commands
//
module "ix_slash" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "ix_slash"
  custom_policy_json = data.aws_iam_policy_document.ix_slash.json
  memory             = 1024
  timeout            = 300
  fn_env = merge(local.lambda_env, {
    SQS_ARN_SCHEDULED_TASK = module.task_queue.fn_sqs_arn
  })
}

resource "aws_lambda_function_event_invoke_config" "ix_slash" {
  function_name                = module.ix_slash.fn_name
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}

data "aws_iam_policy_document" "ix_slash" {
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

//
// Components
//
module "ix_menu" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "ix_menu"
  custom_policy_json = data.aws_iam_policy_document.ix_menu.json
  memory             = 512
  timeout            = 15
  fn_env = merge(local.lambda_env, {

  })
}

resource "aws_lambda_function_event_invoke_config" "ix_menu" {
  function_name                = module.ix_menu.fn_name
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}

data "aws_iam_policy_document" "ix_menu" {
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

//
// Poll
//
module "poll" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "poll"
  custom_policy_json = data.aws_iam_policy_document.poll.json
  memory             = 512
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

//
// Task
//
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
