import {E, O, pipe} from '#src/internal/pure/effect.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {BadWebhookSignature, WebhookParseError} from 'dfx/Interactions/webhook';
import {type Interaction, InteractionCallbackType} from 'dfx/types';
import {PlatformAlgorithm, verify} from 'discord-verify';
import type {NoSuchElementException} from 'effect/Cause';
import {subtle} from 'node:crypto';

export const PONG = {type: InteractionCallbackType.PONG};
export const DEFER_SOURCE = {type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE};

export const succeedResponse = (code: number, body?: any) => {
  if (!body) {
    return E.succeed({
      statusCode: code,
    });
  }
  return E.succeed({
    statusCode: code,
    body      : JSON.stringify(body),
  });
};

export const makeResponse = (code: number, body?: any) => {
  if (!body) {
    return {
      statusCode: code,
    };
  }
  return {
    statusCode: code,
    body      : JSON.stringify(body),
  };
};

export const validateInteraction = (req: APIGatewayProxyEventBase<unknown>) =>
  pipe(
    O.all([
      O.fromNullable(req.body),
      O.fromNullable(req.headers['x-signature-ed25519']),
      O.fromNullable(req.headers['x-signature-timestamp']),
    ]),
    E.flatMap(([body, signature, timestamp]) =>
      E.tryPromise({
        try: () => verify(
          body,
          signature,
          timestamp,
          process.env.DFFP_DISCORD_PUBLIC_KEY,
          subtle,
          PlatformAlgorithm.NewNode,
        ),
        catch: () => new BadWebhookSignature(),
      }),
    ),
    E.flatMap(() =>
      E.try({
        try  : () => JSON.parse(req.body!) as Interaction,
        catch: (cause) => new WebhookParseError({cause}),
      }),
    ),
  );

export const makeNotOkResponse = (
  error: | NoSuchElementException
         | BadWebhookSignature
         | WebhookParseError
         | Error,

) => {
  if (!('_tag' in error)) return O.none();
  if (
    error._tag === 'NoSuchElementException' ||
    error._tag === 'WebhookParseError'
  ) {
    return O.some(makeResponse(400));
  }
  if (error._tag === 'BadWebhookSignature') {
    return O.some(makeResponse(401));
  }
  return makeResponse(500);
};
