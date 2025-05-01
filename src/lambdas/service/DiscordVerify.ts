import {DiscordPublicKeyConfig} from '#src/lambdas/service/environment.ts';
import {PlatformAlgorithm, verify} from 'discord-verify';
import {Effect} from 'effect';
import type { APIGatewayProxyEventBase } from 'aws-lambda';
import {subtle} from 'node:crypto';

export class DiscordVerify extends Effect.Service<DiscordVerify>()('deepfryer/DiscordVerify', {
  effect: Effect.gen(function* () {
    const publicKey = yield* DiscordPublicKeyConfig;

    return {
      isVerified: (req: APIGatewayProxyEventBase<any>) =>
        Effect.promise(() =>
          verify(
            req.body,
            req.headers['x-signature-ed25519'],
            req.headers['x-signature-timestamp'],
            publicKey,
            subtle,
            PlatformAlgorithm.NewNode,
          ),
        ),
    };
  }),
  accessors: true,
}) {}

class LocalDiscordVerify extends Effect.Service<DiscordVerify>()('deepfryer/DiscordVerify', {
  succeed: {
    isVerified: () => Effect.succeed(true),
  } as Omit<DiscordVerify, '_tag'>,
  accessors: true,
}) {}

export const DiscordVerifyLive
  = process.env.LAMBDA_LOCAL === 'true' ? LocalDiscordVerify.Default
  : DiscordVerify.Default;
