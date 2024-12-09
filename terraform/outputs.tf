output "url_discord_interactions" {
  value = "${aws_api_gateway_deployment.webhook.invoke_url}${aws_api_gateway_stage.webhook.stage_name}${aws_api_gateway_resource.ix.path}"
}

output "url_dev_ws" {
  value = try(aws_apigatewayv2_stage.dev_websocket[0].invoke_url, null)
}
