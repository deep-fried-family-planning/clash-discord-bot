resource "aws_sqs_queue" "dlq" {
  name = "${var.prefix}-${local.fn_name}-dlq"
}

resource "aws_sqs_queue_redrive_allow_policy" "dlq_redrive_allow" {
  queue_url = aws_sqs_queue.dlq.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.sqs.arn]
  })
}
