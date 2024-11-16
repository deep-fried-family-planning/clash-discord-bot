#
# Discord [POST /interactions]
#
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


#
# OPTIONS /interactions
#
resource "aws_api_gateway_method" "api_discord_option" {
  rest_api_id   = aws_api_gateway_rest_api.api_discord.id
  resource_id   = aws_api_gateway_resource.api_discord.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}


resource "aws_api_gateway_method_response" "api_discord_option" {
  rest_api_id = aws_api_gateway_rest_api.api_discord.id
  resource_id = aws_api_gateway_resource.api_discord.id
  http_method = aws_api_gateway_method.api_discord_option.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}


resource "aws_api_gateway_integration_response" "api_discord_options" {
  rest_api_id = aws_api_gateway_rest_api.api_discord.id
  resource_id = aws_api_gateway_resource.api_discord.id
  http_method = aws_api_gateway_method.api_discord_option.http_method
  status_code = aws_api_gateway_method_response.api_discord_option.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}


resource "aws_api_gateway_integration" "api_discord_option" {
  rest_api_id = aws_api_gateway_rest_api.api_discord.id
  resource_id = aws_api_gateway_resource.api_discord.id
  http_method = aws_api_gateway_method.api_discord_option.http_method
  type        = "MOCK"
}


#
# POST /interactions
#
resource "aws_api_gateway_method" "api_discord_post" {
  rest_api_id   = aws_api_gateway_rest_api.api_discord.id
  resource_id   = aws_api_gateway_resource.api_discord.id
  http_method   = "POST"
  authorization = "NONE"
  request_parameters = {
    "method.request.header.X-Signature-Ed25519"   = true
    "method.request.header.X-Signature-Timestamp" = true
  }
}


resource "aws_api_gateway_integration" "api_discord_post" {
  rest_api_id             = aws_api_gateway_rest_api.api_discord.id
  resource_id             = aws_api_gateway_resource.api_discord.id
  http_method             = aws_api_gateway_method.api_discord_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda_api_discord.fn_invoke_arn
}
