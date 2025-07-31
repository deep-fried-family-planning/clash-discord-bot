import {DiscordDOM} from '#disreact/adaptor/DiscordDOM.ts';
import {DokenCache} from '#disreact/adaptor/DokenCache.ts';
import * as Effect from 'effect/Effect';
import * as FiberMap from 'effect/FiberMap';
import type * as Doken from '#disreact/adaptor/internal/Doken.ts';

export class DokenManager extends Effect.Service<DokenManager>()('disreact/DokenManager', {
  scoped: Effect.fnUntraced(function* () {
    const cache = yield* DokenCache;
    const dom = yield* DiscordDOM;

    return {
      resolveActive: (serial: Doken.Serial) => serial,
    };
  }),
  accessors: true,
}) {}
