locals {
  fn_name = replace(var.fn_name, "_", "-")
}


data "archive_file" "source_code" {
  type        = "zip"
  source_dir  = "../${path.root}/dist/${var.fn_name}"
  output_path = "${path.root}/.terraform/${var.fn_name}.zip"
}


resource "aws_lambda_function" "main" {
  function_name = "${var.prefix}-${local.fn_name}"
  role          = aws_iam_role.execution_role.arn

  filename         = data.archive_file.source_code.output_path
  source_code_hash = data.archive_file.source_code.output_sha256
  handler          = "index.handler"

  architectures = ["arm64"]
  runtime       = "nodejs22.x"
  memory_size   = var.memory
  timeout       = var.timeout

  environment {
    variables = merge(
      {
        NODE_OPTIONS    = "--enable-source-maps"
        LAMBDA_ROLE_ARN = aws_iam_role.execution_role.arn
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


