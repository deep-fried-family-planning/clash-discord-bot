#
# Tracking
#
resource "aws_dynamodb_table" "tracking" {
  name = "${local.prefix}-tracking"

  read_capacity  = 1
  write_capacity = 1

  hash_key = "type"

  attribute {
    name = "type"
    type = "S"
  }
}

data "aws_iam_policy_document" "tracking" {
  statement {
    effect    = "Allow"
    actions   = ["dynamodb:*"]
    resources = [aws_dynamodb_table.tracking.arn]
    principals {
      type        = "AWS"
      identifiers = [local.account_id]
    }
  }
}

resource "aws_dynamodb_resource_policy" "tracking" {
  resource_arn = aws_dynamodb_table.tracking.arn
  policy       = data.aws_iam_policy_document.tracking.json
}

#
# Snapshots
#
resource "aws_dynamodb_table" "snapshots" {
  name = "${local.prefix}-snapshots"

  read_capacity  = 4
  write_capacity = 4

  hash_key  = "id"
  range_key = "time" # ISO timestamp

  attribute {
    name = "id" # hash_key
    type = "S"  # CLAN_TAG, PLAYER_TAG, CLAN_WAR
  }
  attribute {
    name = "time" # range_key
    type = "S"    # ISO timestamp
  }
}

data "aws_iam_policy_document" "snapshots" {
  statement {
    effect    = "Allow"
    actions   = ["dynamodb:*"]
    resources = [aws_dynamodb_table.snapshots.arn]
    principals {
      type        = "AWS"
      identifiers = [local.account_id]
    }
  }
}

resource "aws_dynamodb_resource_policy" "snapshots" {
  resource_arn = aws_dynamodb_table.snapshots.arn
  policy       = data.aws_iam_policy_document.tracking.json
}
