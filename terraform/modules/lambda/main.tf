locals {
  #   fn_name = replace(var.fn_name, "_", "-")
  fn_name = replace(var.fn_name, "_", "-")
}

resource "aws_lambda_function" "main" {
  function_name = "${var.prefix}-${local.fn_name}"
  role          = aws_iam_role.execution_role.arn

  filename         = data.archive_file.source_code.output_path
  source_code_hash = data.archive_file.source_code.output_sha256
  handler          = "index.handler"

  architectures = ["arm64"]
  runtime       = "nodejs20.x"
  memory_size   = var.memory
  timeout       = var.timeout

  environment {
    variables = merge(
      {
        NODE_OPTIONS = "--enable-source-maps"
      },
      var.fn_env
    )
  }
  logging_config {
    log_format = "Text"
    #     application_log_level = "ERROR"
    #     system_log_level      = "INFO"
  }
}

resource "aws_lambda_permission" "sqs" {
  count         = var.sqs == true ? 1 : 0
  function_name = aws_lambda_function.main.arn
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.sqs[0].arn
}

resource "aws_lambda_event_source_mapping" "sqs" {
  count            = var.sqs == true ? 1 : 0
  function_name    = aws_lambda_function.main.arn
  event_source_arn = aws_sqs_queue.sqs[0].arn
}
