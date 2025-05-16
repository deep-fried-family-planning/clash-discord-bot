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
    read_capacity   = 1
    write_capacity  = 1
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
    read_capacity   = 1
    write_capacity  = 1
  }
  attribute {
    name = "pk2"
    type = "S"
  }
  attribute {
    name = "sk2"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI_ALL_SERVERS"
    hash_key        = "gsi_all_server_id"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  global_secondary_index {
    name            = "GSI_ALL_CLANS"
    hash_key        = "gsi_clan_tag"
    range_key       = "gsi_server_id"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  global_secondary_index {
    name            = "GSI_ALL_PLAYERS"
    hash_key        = "gsi_player_tag"
    range_key       = "gsi_user_id"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  global_secondary_index {
    name            = "GSI_USER_ROSTER_SIGNUPS"
    hash_key        = "gsi_user_id"
    range_key       = "gsi_roster_id"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  attribute {
    name = "gsi_all_server_id"
    type = "S"
  }
  attribute {
    name = "gsi_server_id"
    type = "S"
  }
  attribute {
    name = "gsi_clan_tag"
    type = "S"
  }
  attribute {
    name = "gsi_user_id"
    type = "S"
  }
  attribute {
    name = "gsi_player_tag"
    type = "S"
  }
  attribute {
    name = "gsi_roster_id"
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
