module "ix_slash" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "ix_slash"
  custom_policy_json = data.aws_iam_policy_document.ix_slash.json
  memory             = 1024
  timeout            = 300
  fn_env = merge(local.lambda_env, {

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


