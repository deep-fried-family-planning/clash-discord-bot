output "fn_sqs_url" {
  value = try(aws_sqs_queue.sqs.url, null)
}

output "fn_sqs_arn" {
  value = try(aws_sqs_queue.sqs.arn, null)
}
