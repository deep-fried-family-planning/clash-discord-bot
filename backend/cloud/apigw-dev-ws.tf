resource "aws_apigatewayv2_api" "dev_ws" {
  count                      = local.env == "qual" ? 1 : 0
  name                       = "${local.prefix}-dev-websocket"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_integration" "dev_ws" {
  count              = local.env == "qual" ? 1 : 0
  api_id             = aws_apigatewayv2_api.dev_ws[0].id
  integration_uri    = module.dev_ws[0].fn_invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "dev_ws_connect" {
  count     = local.env == "qual" ? 1 : 0
  api_id    = aws_apigatewayv2_api.dev_ws[0].id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.dev_ws[0].id}"
}

resource "aws_apigatewayv2_route" "dev_ws_disconnect" {
  count     = local.env == "qual" ? 1 : 0
  api_id    = aws_apigatewayv2_api.dev_ws[0].id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.dev_ws[0].id}"
}

resource "aws_apigatewayv2_route" "dev_ws_default" {
  count     = local.env == "qual" ? 1 : 0
  api_id    = aws_apigatewayv2_api.dev_ws[0].id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.dev_ws[0].id}"
}

resource "aws_apigatewayv2_stage" "dev_websocket" {
  count       = local.env == "qual" ? 1 : 0
  api_id      = aws_apigatewayv2_api.dev_ws[0].id
  name        = "dev"
  auto_deploy = true

  #   access_log_settings {
  #     destination_arn = aws_cloudwatch_log_group.api_discord_logs.arn
  #     format = jsonencode({
  #       requestId               = "$context.requestId"
  #       sourceIp                = "$context.identity.sourceIp"
  #       requestTime             = "$context.requestTime"
  #       protocol                = "$context.protocol"
  #       httpMethod              = "$context.httpMethod"
  #       resourcePath            = "$context.resourcePath"
  #       routeKey                = "$context.routeKey"
  #       status                  = "$context.status"
  #       responseLength          = "$context.responseLength"
  #       integrationErrorMessage = "$context.integrationErrorMessage"
  #     })
  #   }
}

module "dev_ws" {
  count              = local.env == "qual" ? 1 : 0
  source             = "modules/lambda"
  acc_id             = local.account_id
  prefix             = local.prefix
  fn_name            = "dev_ws"
  custom_policy_json = data.aws_iam_policy_document.dev_ws.json
  memory             = 512
  timeout            = 3
  fn_env             = merge(local.lambda_env, {})
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
