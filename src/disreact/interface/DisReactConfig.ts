import type {FC} from '#src/disreact/model/entity/fc.ts';
import type { RDT} from '#src/internal/pure/effect.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import type { Element } from '#src/disreact/model/entity/element';



export interface DisReactOptions {
  version?: number | string;
  // app  : string;
  token   : RDT.Redacted;
  // codec: {
  //   componentPrefix: string;
  //   hydrationPrefix: string;
  //   modalPrefix    : string;
  // };
  sources: {
    modal?    : (Element | FC)[];
    public?   : (Element | FC)[];
    ephemeral?: (Element | FC)[];
  };
  doken: {
    capacity?: number;
  };
}

interface DisReactResolved extends DisReactOptions {
  sources: {
    modal    : (Element | FC)[];
    public   : (Element | FC)[];
    ephemeral: (Element | FC)[];
  };
}

export class DsxSettings extends E.Service<DsxSettings>()('disreact/Config', {
  accessors: true,
  succeed  : {} as unknown as DisReactResolved,
}) {
  static readonly configLayer = (options: DisReactOptions) => {
    options.sources.public ??= [];
    options.sources.ephemeral ??= [];
    options.sources.modal ??= [];
    return L.succeed(this, this.make(options as DisReactResolved));
  };
}
