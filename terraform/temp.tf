# resource "aws_lambda_permission" "sqs" {
#     function_name = aws_lambda_function.main.arn
#     action        = "lambda:InvokeFunction"
#     principal     = "sqs.amazonaws.com"
#     source_arn    = aws_sqs_queue.sqs.arn
# }
#
# resource "aws_lambda_event_source_mapping" "sqs" {
#     function_name    = aws_lambda_function.main.arn
#     event_source_arn = aws_sqs_queue.sqs.arn
# }
