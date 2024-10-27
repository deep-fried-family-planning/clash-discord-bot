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
