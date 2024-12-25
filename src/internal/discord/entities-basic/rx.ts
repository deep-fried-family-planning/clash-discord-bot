import {Cx, CxVR, Flags} from '#dfdis';
import {defaultCxRouter} from '#discord/model-routing/ope.ts';
import type {CxMap, ExMap, IxIn} from '#discord/utils/types.ts';
import {Ar, D, Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx/index';
import type {ActionRow} from 'dfx/types';
import {pipe} from 'effect';


export type T = D.TaggedEnum<{
    Dialog : {cx: CxMap; ex: ExMap; ddb_id: str};
    Message: {cx: CxMap; ex: ExMap};
}>;
export const C = D.taggedEnum<T>();


export const make = (ix: IxIn) => {
    const cx = pipe(
        ix.message!.components,
        Ar.flatMap((cs, row) => pipe((cs as ActionRow).components, Ar.map((c, col) => p(
            Cx.make(c),
            Cx.merge({
                _id: {
                    ...defaultCxRouter.parse((c as {custom_id: str}).custom_id),
                    row: `${row}`,
                    col: `${col}`,
                },
                _status: Cx.Status.mounted,
            }),
            Cx.map((cx) => pipe(cx, Cx.set('_flags', Flags.assignFlags(cx._id)))),
            Cx.map((cx) => p(cx, Cx.set('_data', CxVR.vData(cx._id)))),
        )))),
        Kv.fromIterableWith((cx) => [cx._data!, cx]),
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
