import {Cx} from '#dfdis';
import {cxRouter} from '#discord/model-routing/ope.ts';
import type {CxMap, ExMap, IxIn} from '#discord/utils/types.ts';
import {Ar, D, Kv, p} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx/index';
import type {ActionRow} from 'dfx/types';


export type T = D.TaggedEnum<{
  Dialog : {cx: CxMap; ex: ExMap; ddb_id: str};
  Message: {cx: CxMap; ex: ExMap};
}>;
export const C = D.taggedEnum<T>();


export const make = (ix: IxIn) => {
  const cx = p(
    ix.message!.components,
    Ar.flatMap((cs, row) => p((cs as ActionRow).components, Ar.map((c, col) => p(
      Cx.makeFromRest(c),
      Cx.set('route', {
        ...cxRouter.parse((c as {custom_id: str}).custom_id),
        row: `${row}`,
        col: `${col}`,
      }),
      Cx.resolveFlags,
    )))),
    Kv.fromIterableWith((cx) => [cx.accessor, cx]),
  );

  // let messageEmbeds = [];
  //
  // try {
  //     messageEmbeds = ix.message.embeds.map((ex) => {
  //         try {
  //             const params = 'name' in (ex.author ?? {}) ? exvi.parse(ex.author!.name) : ExVi.empty();
  //
  //             return pipe(
  //                 Ex.make(ex),
  //                 Ex.merge({
  //                     _id: params,
  //                 }),
  //             );
  //         }
  //         catch (e) {
  //             return {};
  //         }
  //     });
  // }
  // catch (e) {
  //     console.error(e);
  // }

  if (ix.type === Discord.InteractionType.MODAL_SUBMIT) {
    return C.Dialog({
      ex    : {},
      cx,
      ddb_id: '',
    });
  }

  return C.Message({
    ex: {},
    cx,
  });
};
