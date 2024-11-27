module "ix_api" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "ix_api"
  custom_policy_json = data.aws_iam_policy_document.ix_api.json
  memory             = 256
  timeout            = 3
  fn_env = merge(local.lambda_env, {
    LAMBDA_ARN_IX_MENU  = module.ix_menu.fn_arn
    LAMBDA_ARN_IX_SLASH = module.ix_slash.fn_arn

    LAMBDA_ARN_DISCORD_MENU_DELETE = module.ix_menu_close.fn_arn

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
  source_arn    = "arn:aws:execute-api:${local.aws_region}:${local.account_id}:${aws_api_gateway_rest_api.api_discord.id}/*/${aws_api_gateway_method.api_discord_post.http_method}${aws_api_gateway_resource.api_discord.path}"
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
