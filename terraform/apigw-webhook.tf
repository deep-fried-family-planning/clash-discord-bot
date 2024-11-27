resource "aws_api_gateway_rest_api" "webhook" {
    name = "${local.prefix}-webhook"
    endpoint_configuration {
        types = ["REGIONAL"]
    }
}


resource "aws_api_gateway_deployment" "webhook" {
    rest_api_id = aws_api_gateway_rest_api.api_discord.id
    triggers = {
        redeployment = sha1(jsonencode([
            aws_api_gateway_rest_api.webhook.body,
            aws_api_gateway_resource.ix.id,

            aws_api_gateway_method.ix_options.id,
            aws_api_gateway_method_response.ix_options.id,
            aws_api_gateway_integration.ix_options.id,
            aws_api_gateway_integration_response.ix_options.id,

            aws_api_gateway_method.ix_post.id,
            aws_api_gateway_integration.ix_post.id,
        ]))
    }
    lifecycle {
        create_before_destroy = true
    }
}


resource "aws_api_gateway_stage" "webhook" {
    rest_api_id   = aws_api_gateway_rest_api.webhook.id
    deployment_id = aws_api_gateway_deployment.webhook.id
    stage_name    = "${local.prefix}-webhook"
    # access_log_settings {
    #   destination_arn = aws_cloudwatch_log_group.logs.arn
    #   format          = "$context.extendedRequestId"
    # }
}


resource "aws_api_gateway_resource" "ix" {
    rest_api_id = aws_api_gateway_rest_api.webhook.id
    parent_id   = aws_api_gateway_rest_api.webhook.root_resource_id
    path_part   = "interactions"
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
resource "aws_api_gateway_method" "ix_options" {
    rest_api_id   = aws_api_gateway_rest_api.webhook.id
    resource_id   = aws_api_gateway_resource.ix.id
    http_method   = "OPTIONS"
    authorization = "NONE"
}


resource "aws_api_gateway_method_response" "ix_options" {
    rest_api_id = aws_api_gateway_rest_api.webhook.id
    resource_id = aws_api_gateway_resource.ix.id
    http_method = aws_api_gateway_method.api_discord_option.http_method
    status_code = "200"
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = true,
        "method.response.header.Access-Control-Allow-Methods" = true,
        "method.response.header.Access-Control-Allow-Origin"  = true
    }
}


resource "aws_api_gateway_integration_response" "ix_options" {
    rest_api_id = aws_api_gateway_rest_api.webhook.id
    resource_id = aws_api_gateway_resource.ix.id
    http_method = aws_api_gateway_method.ix_options.http_method
    status_code = aws_api_gateway_method_response.ix_options.status_code
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
        "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    }
}


resource "aws_api_gateway_integration" "ix_options" {
    rest_api_id = aws_api_gateway_rest_api.webhook.id
    resource_id = aws_api_gateway_resource.ix.id
    http_method = aws_api_gateway_method.ix_options.http_method
    type        = "MOCK"
}


#
# POST /interactions
#
resource "aws_api_gateway_method" "ix_post" {
    rest_api_id   = aws_api_gateway_rest_api.webhook.id
    resource_id   = aws_api_gateway_resource.ix.id
    http_method   = "POST"
    authorization = "NONE"
    request_parameters = {
        "method.request.header.X-Signature-Ed25519"   = true
        "method.request.header.X-Signature-Timestamp" = true
    }
}


resource "aws_api_gateway_integration" "ix_post" {
    rest_api_id             = aws_api_gateway_rest_api.webhook.id
    resource_id             = aws_api_gateway_resource.ix.id
    http_method             = aws_api_gateway_method.ix_post.http_method
    integration_http_method = "POST"
    type                    = "AWS_PROXY"
    uri                     = module.ix_api.fn_invoke_arn
}
