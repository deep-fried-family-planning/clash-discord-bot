import * as Jsx from '#disreact/model/entity/Jsx.tsx';
import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Entrypoint from '#disreact/runtime/Entrypoint.ts';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import type * as Record from 'effect/Record';

export class SourceError extends Data.TaggedError('SourceError')<{
  message: string;
}>
{}

export interface Hydrant {
  source: Jsx.Jsx;
  props : Record<string, any>;
  state : Record<string, readonly Polymer.Monomer.Encoded[]>;
}

export const fromSource = (source: Entrypoint.Entrypoint, setup?: Record<string, any>): Hydrant => {
  if (typeof source === 'function') {
    const props = structuredClone(setup);

    return {
      source: Jsx.component(source, props),
      props : props ?? {},
      state : {},
    };
  }
  if (setup) {
    return {
      source: Jsx.clone(source),
      props : structuredClone(setup),
      state : {},
    };
  }
  return {
    source: Jsx.clone(source),
    props : structuredClone(source.props),
    state : {},
  };
};

export interface Hydrator {
  id   : string | undefined;
  props: Record<string, any>;
  state: Record<string, readonly Polymer.Monomer.Encoded[]>;
}

export const fromHydrator = (h: Hydrator) => Effect.suspend(() => {
  if (Entrypoint.isRegistered(h.id)) {
    const src = Entrypoint.get(h.id);

    return Effect.succeed(fromSource(src, h.props));
  }
  return new SourceError({
    message: `Source (${h.id}) is not registered.`,
  });
});

export const toHydrator = (hydrant: Hydrant) =>
  ({
    id   : Entrypoint.getId(hydrant.source),
    props: structuredClone(hydrant.props),
    state: {},
  });
