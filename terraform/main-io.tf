output "url_discord_interactions" {
  value = "${aws_api_gateway_deployment.api_discord.invoke_url}${aws_api_gateway_stage.api_discord.stage_name}${aws_api_gateway_resource.api_discord.path}"
}
