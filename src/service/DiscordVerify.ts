import {DiscordEnv} from '#config/external.ts';
import {PlatformAlgorithm, verify} from 'discord-verify';
import {Effect, Layer} from 'effect';
import type { APIGatewayProxyEventBase } from 'aws-lambda';
import {subtle} from 'node:crypto';

export class DiscordVerify extends Effect.Service<DiscordVerify>()('deepfryer/DiscordVerify', {
  effect: Effect.gen(function* () {
    const env = yield* DiscordEnv;

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

export const DiscordVerifyLive
  = process.env.LAMBDA_LOCAL === 'true' ? Layer.succeed(DiscordVerify, DiscordVerify.make({
    isVerified: () => Effect.succeed(true),
  }))
  : DiscordVerify.Default;
