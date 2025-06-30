import type * as Document from '#disreact/core/primitives/exp/documentold.ts';
import type * as Node from '#disreact/core/primitives/exp/nodev1.ts';
import * as Jsx from '#disreact/model/runtime/jsx.tsx';
import * as Cache from 'effect/Cache';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Exit from 'effect/Exit';
import {pipe} from 'effect/Function';

export type RehydratorConfig = {
  sources  : Jsx.SourceInput[];
  capacity?: number;
  ttl?     : Duration.Duration;
};

export class Rehydrator extends E.Service<Rehydrator>()('disreact/Rehydrator', {
  effect: E.fnUntraced(function* (config: RehydratorConfig) {
    const sources = new Map<string, Jsx.Source>();

    for (const s of config.sources) {
      const source = Jsx.makeSource(s);
      if (sources.has(source.id)) {
        throw new Error();
      }
      sources.set(source.id, source);
    }

    const ttl = config.ttl ?? Duration.minutes(5);

    const memory = yield* Cache.makeWith({
      capacity: config.capacity ?? 100,

      lookup: (key: string) =>
        E.succeed(undefined as undefined | Document.Documentold<Node.Nodev1>),

      timeToLive: (exit) =>
        Exit.isFailure(exit) ? Duration.zero :
        !exit.value ? Duration.zero :
        ttl,
    });

    const loadMemory = (key: string, hash: string) =>
      pipe(
        memory.get(key),
        E.map((d) => {
          if (!d) {
            return undefined;
          }
          return d; // todo verify hash
        }),
      );

    const saveMemory = (d: Document.Documentold<Node.Nodev1>) =>
      memory.set(d._key, d);

    return {
      loadMemory,
      saveMemory,
    };
  }),
  accessors: true,
})
{}
