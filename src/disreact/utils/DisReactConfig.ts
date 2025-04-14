import type {Elem} from '#src/disreact/model/entity/elem.ts';
import type {FC} from '#src/disreact/model/entity/fc.ts';
import {Redacted} from 'effect';
import {E, flow, L} from '#src/disreact/utils/re-exports.ts';
import {RxTx} from 'src/disreact/codec/rxtx.ts';

export namespace DisReactConfig {
  export type Input = {
    token: Redacted.Redacted<string> | string;

    sources:
      // | (Elem.Any | FC)
      | (Elem.Any | FC)[];
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

  options.baseUrl ??= RxTx.DEFAULT_BASE_URL;
  options.dokenCapacity ??= 100;

  return options;
};

export class DisReactConfig extends E.Service<DisReactConfig>()('disreact/Config', {
  succeed: makeDefaultOptions({token: '', sources: []}),
}) {
  static readonly configLayer = flow(
    makeDefaultOptions,
    this.make,
    L.succeed(this),
  );
}
