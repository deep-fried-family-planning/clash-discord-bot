resource "aws_api_gateway_rest_api" "api_discord" {
  name = "${local.prefix}-api-discord"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "api_discord" {
  rest_api_id = aws_api_gateway_rest_api.api_discord.id
  parent_id   = aws_api_gateway_rest_api.api_discord.root_resource_id
  path_part   = "interactions"
}

resource "aws_api_gateway_deployment" "api_discord" {
  rest_api_id = aws_api_gateway_rest_api.api_discord.id
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_rest_api.api_discord.body,
      aws_api_gateway_resource.api_discord.id,

      aws_api_gateway_method.api_discord_option.id,
      aws_api_gateway_method_response.api_discord_option.id,
      aws_api_gateway_integration.api_discord_option.id,
      aws_api_gateway_integration_response.api_discord_options.id,

      aws_api_gateway_method.api_discord_post.id,
      aws_api_gateway_integration.api_discord_post.id,
    ]))
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "api_discord" {
  rest_api_id   = aws_api_gateway_rest_api.api_discord.id
  deployment_id = aws_api_gateway_deployment.api_discord.id
  stage_name    = "${local.prefix}-api-discord"
  # access_log_settings {
  #   destination_arn = aws_cloudwatch_log_group.logs.arn
  #   format          = "$context.extendedRequestId"
  # }
}

# resource "aws_api_gateway_method_settings" "api_discord" {
#   rest_api_id = aws_api_gateway_rest_api.api_discord.id
#   stage_name  = aws_api_gateway_stage.api_discord.stage_name
#   method_path = "*/*"
#   # settings {
#   #   logging_level      = "INFO"
#   #   metrics_enabled    = true
#   #   data_trace_enabled = true
#   # }
# }
