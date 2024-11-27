module "lambda_api_discord" {
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "api_discord"
  custom_policy_json = data.aws_iam_policy_document.lambda_api_discord.json
  memory             = 256
  timeout            = 3
  fn_env = merge(local.lambda_env, {
    LAMBDA_ARN_IX_MENU  = module.ix_menu.fn_arn
    LAMBDA_ARN_IX_SLASH = module.ix_slash.fn_arn

    LAMBDA_ARN_DISCORD_MENU_DELETE = module.ix_menu_close.fn_arn

    LAMBDA_ARN_DISCORD_MENU = module.ix_menu.fn_arn
  })
}

data "aws_iam_policy_document" "lambda_api_discord" {
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

resource "aws_lambda_permission" "api_discord_post" {
  function_name = module.lambda_api_discord.fn_name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${local.aws_region}:${local.account_id}:${aws_api_gateway_rest_api.api_discord.id}/*/${aws_api_gateway_method.api_discord_post.http_method}${aws_api_gateway_resource.api_discord.path}"
}
