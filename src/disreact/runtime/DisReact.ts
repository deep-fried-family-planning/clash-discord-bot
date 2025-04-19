import type {Tx} from '#src/disreact/codec/tx.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import type {FC} from '#src/disreact/model/elem/fc.ts';
import {E} from '#src/disreact/utils/re-exports.ts';
import type {Rx} from '../codec/rx';

export class DisReact extends E.Tag('disreact/DisReact')<
  DisReact,
  {
    createRoot: (id: Elem | FC | string, props?: any) => E.Effect<Tx.Response>;
    respond   : (input: Rx.Request) => E.Effect<Tx.Response>;
  }
>() {

}
