output "url_discord_interactions_old" {
  value = "${aws_api_gateway_deployment.api_discord.invoke_url}${aws_api_gateway_stage.api_discord.stage_name}${aws_api_gateway_resource.api_discord.path}"
}

output "url_discord_interactions" {
  value = "${aws_api_gateway_deployment.webhook.invoke_url}${aws_api_gateway_stage.webhook.stage_name}${aws_api_gateway_resource.ix.path}"
}
