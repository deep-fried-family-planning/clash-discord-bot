resource "aws_scheduler_schedule_group" "schedule_group" {
  name = "${local.prefix}-schedule-group"
}

resource "aws_scheduler_schedule" "clash_general" {
  name                = "${local.prefix}-clash-general"
  group_name          = aws_scheduler_schedule_group.schedule_group.name
  schedule_expression = "rate(5 minutes)"
  flexible_time_window {
    mode = "OFF"
  }
  target {
    arn      = module.poll.fn_arn
    role_arn = aws_iam_role.schedule_role.arn
  }
}

data "aws_iam_policy_document" "schedule_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
    principals {
      type        = "AWS"
      identifiers = [local.account_id]
    }
  }
}

resource "aws_iam_role" "schedule_role" {
  name               = "schedule-role"
  path               = "/${local.prefix}/"
  assume_role_policy = data.aws_iam_policy_document.schedule_role.json
}

data "aws_iam_policy_document" "schedule_policy" {
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = [module.poll.fn_arn]
  }
}

resource "aws_iam_policy" "schedule_policy" {
  name   = "schedule-policy"
  path   = "/${local.prefix}/"
  policy = data.aws_iam_policy_document.schedule_policy.json
}

resource "aws_iam_role_policy_attachment" "schedule_policy" {
  role       = aws_iam_role.schedule_role.name
  policy_arn = aws_iam_policy.schedule_policy.arn
}
