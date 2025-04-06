import type {FC} from '#src/disreact/model/comp/fc.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {E, L, type RDT} from 'src/disreact/utils/re-exports.ts'

export interface DisReactOptions {
  version?: number | string
  // app  : string;
  token   : RDT.Redacted<string>
  // codec: {
  //   componentPrefix: string;
  //   hydrationPrefix: string;
  //   modalPrefix    : string;
  // };
  sources: {
    modal?    : (Elem | FC)[]
    public?   : (Elem | FC)[]
    ephemeral?: (Elem | FC)[]
  }
  doken: {
    capacity?: number
  }
}

interface DisReactResolved extends DisReactOptions {
  sources: {
    modal    : (Elem | FC)[]
    public   : (Elem | FC)[]
    ephemeral: (Elem | FC)[]
  }
}

export class DisReactConfig extends E.Service<DisReactConfig>()('disreact/Config', {
  succeed: {} as unknown as DisReactResolved,
}) {
  static readonly configLayer = (options: DisReactOptions) => {
    options.sources.public ??= []
    options.sources.ephemeral ??= []
    options.sources.modal ??= []
    return L.succeed(this, this.make(options as DisReactResolved))
  }
}
