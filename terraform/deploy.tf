#
# app-discord-deploy
#
module "lambda_discord_deploy" {
    source             = "./modules/lambda"
    acc_id             = local.account_id
    prefix             = local.prefix
    fn_name            = "discord_deploy"
    custom_policy_json = data.aws_iam_policy_document.lambda_discord_deploy.json
    memory             = 512
    timeout            = 300
    fn_env             = local.lambda_env
}

data "aws_iam_policy_document" "lambda_discord_deploy" {
    statement {
        effect = "Allow"
        actions = [
            "logs:CreateLogStream",
            "logs:PutLogEvents",
        ]
        resources = ["arn:aws:logs:*:*:*"]
    }
    statement {
        effect    = "Allow"
        actions   = ["*"]
        resources = ["*"]
    }
}

resource "aws_lambda_invocation" "lambda_discord_deploy" {
    function_name = module.lambda_discord_deploy.fn_name
    input         = jsonencode({})
    triggers = {
        redeployment = jsonencode([
            module.lambda_discord_deploy.fn_src_hash
        ])
    }
}
