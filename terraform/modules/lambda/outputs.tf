output "fn_name" {
  value = aws_lambda_function.main.function_name
}

output "fn_arn" {
  value = aws_lambda_function.main.arn
}

output "fn_role_arn" {
  value = aws_iam_role.execution_role.arn
}

output "fn_invoke_arn" {
  value = aws_lambda_function.main.invoke_arn
}

output "fn_timeout" {
  value = aws_lambda_function.main.timeout
}

output "fn_src_hash" {
  value = data.archive_file.source_code.output_sha256
}
