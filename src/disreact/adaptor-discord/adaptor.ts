import type {DokenCacheError} from '#disreact/adaptor-discord/service/DokenCache.ts';
import * as Doken from '#disreact/adaptor-discord/internal/Doken.ts';
import type {Discord} from 'dfx';
import * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as SynchronizedRef from 'effect/SynchronizedRef';

export const bootstrap = () => {};

type Req = Discord.APIMessageComponentInteraction | Discord.APIModalSubmitInteraction;

const resolveActive = (req: Req, serial: Doken.Serial): Effect.Effect<Option.Option<Doken.Active>, DokenCacheError> => {
  if (serial._tag === 'Single') {
    return Effect.succeedNone;
  }
  if (serial._tag === 'Active') {
    return serial.until.pipe(
      DateTime.isPast,
      Effect.map((isPast) => isPast ? Option.none() : Option.some(serial)),
    );
  }
  return DateTime.now.pipe(
    Effect.map(),
  );

  if (serial._tag === 'Active') {
    return DateTime.now.pipe(
      Effect.map((now) =>
        Doken.ttlOption(serial, now).pipe(

        ),
      ),
    );
  }
  if (serial._tag === 'Cached') {
    return Doken.ttlOption();
  }
  return Effect.succeedNone;
};

export const simulate = Effect.fnUntraced(function* (req: Req) {
  const dokens = yield* SynchronizedRef.make(0);
});
