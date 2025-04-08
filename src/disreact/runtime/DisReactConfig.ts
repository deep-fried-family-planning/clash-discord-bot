import type {FC} from '#src/disreact/model/comp/fc.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {Redacted} from 'effect';
import {E, flow, L} from 'src/disreact/utils/re-exports.ts';
import {RxTx} from '../codec/rxtx';

export namespace DisReactConfig {
  export type Input = {
    token         : Redacted.Redacted<string> | string;
    version?      : number | string;
    baseUrl?      : string;
    modal?        : (Elem | FC)[];
    public?       : (Elem | FC)[];
    ephemeral?    : (Elem | FC)[];
    dokenCapacity?: number;
  };

  export interface Resolved extends Input {
    token        : Redacted.Redacted<string>;
    baseUrl      : string;
    modal        : (Elem | FC)[];
    public       : (Elem | FC)[];
    ephemeral    : (Elem | FC)[];
    dokenCapacity: number;
  }
}

const makeDefaultOptions = (input: DisReactConfig.Input): DisReactConfig.Resolved => {
  const options = input as DisReactConfig.Resolved;

  if (!Redacted.isRedacted(options.token)) {
    options.token = Redacted.make(options.token);
  }

  options.public ??= [];
  options.ephemeral ??= [];
  options.modal ??= [];
  options.baseUrl ??= RxTx.DEFAULT_BASE_URL;
  options.dokenCapacity ??= 100;

  return options;
};

export class DisReactConfig extends E.Service<DisReactConfig>()('disreact/Config', {
  succeed: makeDefaultOptions({token: ''}),
}) {
  static readonly configLayer = flow(
    makeDefaultOptions,
    this.make,
    L.succeed(this),
  );
}
