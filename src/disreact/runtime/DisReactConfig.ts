import type {Elem} from '#src/disreact/model/elem/elem.ts';
import type {FC} from '#src/disreact/model/elem/fc.ts';
import {Effect, flow, Layer, Redacted} from 'effect';

export namespace DisReactConfig {
  export type Input = {
    token: Redacted.Redacted<string> | string;

    sources:
    // | (Elem.Any | FC)
      | (Elem | FC)[];
    // | [string, Elem.Any | FC][]
    // | Record<string, Elem.Any | FC>;
    version?      : number | string;
    baseUrl?      : string;
    dokenCapacity?: number;
  };

  export interface Resolved extends Input {
    token        : Redacted.Redacted<string>;
    baseUrl      : string;
    dokenCapacity: number;
  }
}

const makeDefaultOptions = (input: DisReactConfig.Input): DisReactConfig.Resolved => {
  const options = input as DisReactConfig.Resolved;

  if (!Redacted.isRedacted(options.token)) {
    options.token = Redacted.make(options.token);
  }

  options.baseUrl ??= 'https://dffp.org';
  options.dokenCapacity ??= 10;

  return options;
};

export class DisReactConfig extends Effect.Service<DisReactConfig>()('disreact/Config', {
  succeed  : makeDefaultOptions({token: '', sources: []}),
  accessors: true,
}) {
  static readonly configLayer = (input: DisReactConfig.Input) =>
    Layer.succeed(
      DisReactConfig,
      DisReactConfig.make(makeDefaultOptions(input)),
    );
}
