# ==
# Table - Server
# ==
resource "aws_dynamodb_table" "server" {
    name = "${local.prefix}-server"

    read_capacity  = 1
    write_capacity = 1

    hash_key = "id"

    attribute {
        name = "id"
        type = "S"
    }
}

data "aws_iam_policy_document" "server" {
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

resource "aws_dynamodb_resource_policy" "server" {
    resource_arn = aws_dynamodb_table.tracking.arn
    policy       = data.aws_iam_policy_document.tracking.json
}
