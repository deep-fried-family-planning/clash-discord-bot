locals {
  fn_name = replace(var.fn_name, "_", "-")
}

resource "aws_sqs_queue" "sqs" {
  name                       = "${var.prefix}-${local.fn_name}-sqs"
  visibility_timeout_seconds = var.timeout
}

data "aws_iam_policy_document" "sqs" {
  statement {
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.sqs.arn]
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
  queue_url = aws_sqs_queue.sqs.id
  policy    = data.aws_iam_policy_document.sqs.json
}

resource "aws_sqs_queue_redrive_policy" "sqs_redrive" {
  queue_url = aws_sqs_queue.sqs.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = var.sqs_retries
  })
}
