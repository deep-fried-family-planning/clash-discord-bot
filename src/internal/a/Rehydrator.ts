import type * as Document from '#disreact/core/behaviors/exp/documentold.ts';
import type * as Node from '#disreact/core/behaviors/exp/nodev1.ts';
import * as Jsx from '#src/internal/a/model/runtime/jsx.tsx';
import * as Cache from 'effect/Cache';
import type * as Duration from 'effect/Duration';
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

    return {

    };
  }),
  accessors: true,
})
{}
