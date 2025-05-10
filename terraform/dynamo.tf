resource "aws_dynamodb_table" "operations" {
  name = "${local.prefix}-operations"

  read_capacity  = local.capacity[0]
  write_capacity = local.capacity[1]

  hash_key  = "pk"
  range_key = "sk"

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
    enabled = false
  }

  global_secondary_index {
    name            = "GSI_LINK"
    hash_key        = "gsi_link_pk"
    range_key       = "gsi_link_sk"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  attribute {
    name = "gsi_link_pk"
    type = "S"
  }
  attribute {
    name = "gsi_link_sk"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI_POLL"
    hash_key        = "gsi_poll_pk"
    range_key       = "gsi_poll_sk"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  attribute {
    name = "gsi_poll_pk"
    type = "S"
  }
  attribute {
    name = "gsi_poll_sk"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI_ALL_SERVERS"
    hash_key        = "gsi_all_server_id"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  attribute {
    name = "gsi_all_server_id"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI_ALL_CLANS"
    hash_key        = "gsi_clan_tag"
    range_key       = "gsi_server_id"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  attribute {
    name = "gsi_clan_tag"
    type = "S"
  }
  attribute {
    name = "gsi_server_id"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI_ALL_PLAYERS"
    hash_key        = "gsi_player_tag"
    range_key       = "gsi_user_id"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }
  attribute {
    name = "gsi_player_tag"
    type = "S"
  }
  attribute {
    name = "gsi_user_id"
    type = "S"
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

resource "aws_appautoscaling_target" "operations_read" {
  resource_id        = "table/${aws_dynamodb_table.operations.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
  max_capacity       = local.capacity[0]
  min_capacity       = 5
}

resource "aws_appautoscaling_policy" "operations_read" {
  name               = "DynamoDBReadCapacityUtilization:${aws_appautoscaling_target.operations_read.resource_id}"
  resource_id        = aws_appautoscaling_target.operations_read.resource_id
  policy_type        = "TargetTrackingScaling"
  scalable_dimension = aws_appautoscaling_target.operations_read.scalable_dimension
  service_namespace  = aws_appautoscaling_target.operations_read.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    target_value = 70
  }
}

resource "aws_appautoscaling_target" "operations_write" {
  resource_id        = "table/${aws_dynamodb_table.operations.name}"
  service_namespace  = "dynamodb"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  max_capacity       = local.capacity[1]
  min_capacity       = 1
}

resource "aws_appautoscaling_policy" "operations_write" {
  name               = "DynamoDBWriteCapacityUtilization:${aws_appautoscaling_target.operations_write.resource_id}"
  resource_id        = aws_appautoscaling_target.operations_write.resource_id
  policy_type        = "TargetTrackingScaling"
  scalable_dimension = aws_appautoscaling_target.operations_write.scalable_dimension
  service_namespace  = aws_appautoscaling_target.operations_write.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
    target_value = 70
  }
}

resource "aws_appautoscaling_target" "operations_poll_write" {
  resource_id        = "table/${aws_dynamodb_table.operations.name}"
  service_namespace  = "dynamodb"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  max_capacity       = local.capacity[1]
  min_capacity       = 1
}

resource "aws_appautoscaling_policy" "operations_poll_write" {
  name               = "DynamoDBWriteCapacityUtilization:${aws_appautoscaling_target.operations_poll_write.resource_id}"
  resource_id        = aws_appautoscaling_target.operations_poll_write.resource_id
  policy_type        = "TargetTrackingScaling"
  scalable_dimension = aws_appautoscaling_target.operations_poll_write.scalable_dimension
  service_namespace  = aws_appautoscaling_target.operations_poll_write.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
    target_value       = 70
  }
}

locals {
  thing = aws_dynamodb_table.operations.global_secondary_index["poll"].name
}
