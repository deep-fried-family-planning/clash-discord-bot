#
# Queue
#
resource "aws_sqs_queue" "sqs" {
  count                      = var.sqs == true ? 1 : 0
  name                       = "${var.prefix}-${local.fn_name}-sqs"
  visibility_timeout_seconds = aws_lambda_function.main.timeout
}

data "aws_iam_policy_document" "sqs" {
  count = var.sqs == true ? 1 : 0
  statement {
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.sqs[0].arn]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = var.sqs_source_arns
    }
  }
}

resource "aws_sqs_queue_policy" "sqs_policy" {
  count     = var.sqs == true ? 1 : 0
  queue_url = aws_sqs_queue.sqs[0].id
  policy    = data.aws_iam_policy_document.sqs[0].json
}

resource "aws_sqs_queue_redrive_policy" "sqs_redrive" {
  count     = var.sqs == true ? 1 : 0
  queue_url = aws_sqs_queue.sqs[0].id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[0].arn
    maxReceiveCount     = 2
  })
}

#
# Dead Letter Queue
#
resource "aws_sqs_queue" "dlq" {
  count = var.sqs == true ? 1 : 0
  name  = "${var.prefix}-${local.fn_name}-dlq"
}

resource "aws_sqs_queue_redrive_allow_policy" "dlq_redrive_allow" {
  count     = var.sqs == true ? 1 : 0
  queue_url = aws_sqs_queue.dlq[0].id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.sqs[0].arn]
  })
}
