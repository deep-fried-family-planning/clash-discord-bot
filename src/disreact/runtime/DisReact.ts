import {Codec} from '#src/disreact/codec/Codec.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Source} from '#src/disreact/model/meta/source.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Sources} from '#src/disreact/model/Sources.ts';
import type {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {Methods} from './methods';

const make = () => {
  const layers = pipe(
    L.mergeAll(
      Sources.Default,
      Dispatcher.Default,
      Codec.Default,
      Relay.Default,
      DisReactDOM.Default,
      DokenMemory.Default,
    ),
  );

  return {
    registerRoot: (src: Source.Registrant, id?: string) =>
      pipe(
        Methods.registerRoot(src, id),
        E.provide(layers),
      ),

    createRoot: (id: Source.Key, props?: any) =>
      pipe(
        Methods.createRoot(id, props),
        E.provide(layers),
      ),

    respond: (input: any) =>
      pipe(
        Methods.respond(input),
        E.provide(layers),
        E.provide(Relay.Fresh),
      ),
  };
};

export class DisReact extends E.Service<DisReact>()('disreact/DisReact', {
  succeed  : make(),
  accessors: true,
}) {}
