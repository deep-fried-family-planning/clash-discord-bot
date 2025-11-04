import {DiscordEnv} from 'config/external.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {PlatformAlgorithm, verify} from 'discord-verify';
import * as E from 'effect/Effect';
import {subtle} from 'node:crypto';

export class InteractionVerify extends E.Service<InteractionVerify>()('deepfryer/InteractionVerify', {
  effect: E.gen(function* () {
    const env = yield* DiscordEnv;

    if (process.env.LAMBDA_LOCAL === 'true') {
      return {
        isVerified: (req: APIGatewayProxyEventBase<any>) => E.succeed(true),
      };
    }

    return {
      isVerified: (req: APIGatewayProxyEventBase<any>) =>
        E.promise(() =>
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
