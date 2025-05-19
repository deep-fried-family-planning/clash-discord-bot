resource "aws_dynamodb_table" "operations" {
  name           = "${local.prefix}-operations"
  read_capacity  = local.capacity[0]
  write_capacity = local.capacity[1]
  hash_key       = "pk"
  range_key      = "sk"
  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  global_secondary_index {
    name            = "gsi1"
    hash_key        = "pk1"
    range_key       = "sk1"
    projection_type = "ALL"
    read_capacity   = 2
    write_capacity  = 2
  }
  attribute {
    name = "pk1"
    type = "S"
  }
  attribute {
    name = "sk1"
    type = "S"
  }

  global_secondary_index {
    name            = "gsi2"
    hash_key        = "pk2"
    range_key       = "sk2"
    projection_type = "ALL"
    read_capacity   = 2
    write_capacity  = 2
  }
  attribute {
    name = "pk2"
    type = "S"
  }
  attribute {
    name = "sk2"
    type = "S"
  }
}

data "aws_iam_policy_document" "operations" {
  statement {
    effect    = "Allow"
    actions   = ["dynamodb:*"]
    resources = [aws_dynamodb_table.operations.arn]
    principals {
      type        = "AWS"
      identifiers = [local.account_id]
    }
  }
}

resource "aws_dynamodb_resource_policy" "operations" {
  resource_arn = aws_dynamodb_table.operations.arn
  policy       = data.aws_iam_policy_document.operations.json
}
