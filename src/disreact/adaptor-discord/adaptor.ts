import type {DokenCacheError} from '#disreact/adaptor-discord/service/DokenCache.ts';
import * as Doken from '#disreact/adaptor-discord/core/Doken.ts';
import type {Discord} from 'dfx';
import * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as SynchronizedRef from 'effect/SynchronizedRef';

export const bootstrap = () => {};

type Req = Discord.APIMessageComponentInteraction | Discord.APIModalSubmitInteraction;

export const simulate = Effect.fnUntraced(function* (req: Req) {
  const dokens = yield* SynchronizedRef.make(0);
});
