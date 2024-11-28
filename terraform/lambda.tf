locals {
  lambda_env = merge(
    { for k, v in local.ssm_names : k => data.aws_ssm_parameter.ssm_param[k].value },
    {
      LAMBDA_ENV       = local.env
      LAMBDA_ENV_UPPER = upper(local.env)
      LAMBDA_ENV_LOWER = lower(local.env)
      LAMBDA_PREFIX    = local.prefix
      DDB_OPERATIONS   = aws_dynamodb_table.operations.name
    }
  )
}

# resource "aws_lambda_layer_version" "layer" {
#     layer_name = "${local.prefix}-layer"
#     filename = file("../${path.root}/dist/${var.fn_name}/index.mjs")
#
#     compatible_architectures = ["arm64"]
#     compatible_runtimes = ["nodejs22.x"]
# }

# resource "null_resource" "main" {
#     triggers = {
#         updated_at = timestamp()
#     }
#
#     provisioner "local-exec" {
#         working_dir = "../${path.root}"
#         command = <<EOF
#         pnpm i
#         rm -rf terraform/.terraform/node_modules
#         mkdir -p terraform/.terraform/node_modules
#         cp -r node_modules terraform/.terraform/node_modules
# 	    EOF
#     }
# }
