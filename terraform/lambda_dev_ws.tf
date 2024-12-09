module "dev_ws" {
  count              = local.env == "qual" ? 1 : 0
  source             = "./modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "dev_ws"
  custom_policy_json = data.aws_iam_policy_document.dev_ws.json
  memory             = 256
  timeout            = 3
  fn_env = merge(local.lambda_env, {
    EXECUTE_API_ENDPOINT = replace(aws_apigatewayv2_stage.dev_websocket[0].invoke_url, "wss://", "https://")
  })
}

resource "aws_lambda_function_event_invoke_config" "dev_ws" {
  count                        = local.env == "qual" ? 1 : 0
  function_name                = module.dev_ws[0].fn_arn
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}

resource "aws_lambda_permission" "dev_ws" {
  count         = local.env == "qual" ? 1 : 0
  action        = "lambda:InvokeFunction"
  function_name = module.dev_ws[0].fn_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.dev_ws[0].execution_arn}/*/*"
}

data "aws_iam_policy_document" "dev_ws" {
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
