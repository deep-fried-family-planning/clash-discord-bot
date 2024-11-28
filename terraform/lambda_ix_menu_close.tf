module "ix_menu_close" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "ix_menu_close"
  custom_policy_json = data.aws_iam_policy_document.ix_menu_close.json
  memory             = 256
  timeout            = 3
  fn_env = merge(local.lambda_env, {

  })
}

resource "aws_lambda_function_event_invoke_config" "ix_menu_close" {
  function_name                = module.ix_menu_close.fn_arn
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}

data "aws_iam_policy_document" "ix_menu_close" {
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
