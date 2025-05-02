import {DiscordEnv} from 'config/external.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {PlatformAlgorithm, verify} from 'discord-verify';
import {Effect} from 'effect';
import {subtle} from 'node:crypto';

export class InteractionVerify extends Effect.Service<InteractionVerify>()('deepfryer/InteractionVerify', {
  effect: Effect.gen(function* () {
    const env = yield* DiscordEnv;

    if (process.env.LAMBDA_LOCAL === 'true') {
      return {
        isVerified: (req: APIGatewayProxyEventBase<any>) => Effect.succeed(true),
      };
    }

    return {
      isVerified: (req: APIGatewayProxyEventBase<any>) =>
        Effect.promise(() =>
          verify(
            req.body,
            req.headers['x-signature-ed25519'],
            req.headers['x-signature-timestamp'],
            env.DFFP_DISCORD_PUBLIC_KEY,
            subtle,
            PlatformAlgorithm.NewNode,
          ),
        ),
    };
  }),
  accessors: true,
}) {}
