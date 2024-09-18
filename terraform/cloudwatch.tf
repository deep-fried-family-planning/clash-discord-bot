resource "aws_cloudwatch_log_group" "logs" {
  name              = "${local.prefix}-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "api_discord_logs" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.api_discord.id}/${aws_api_gateway_stage.api_discord.stage_name}"
  retention_in_days = 7
}
