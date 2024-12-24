import {Ar, D, f, Kv} from '#src/internal/pure/effect.ts';
import {CxVi, Cx} from '.';
import type {IxIn} from '#src/internal/ix-v2/model/types.ts';
import {Discord} from 'dfx/index';
import {pipe} from 'effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import {defaultCxRouter} from '#src/internal/ix-v3/routing';
import type {CxMap, ExMap} from '#src/internal/ix-v3/entities/util.ts';


export type T = D.TaggedEnum<{
    Dialog : {cx: CxMap; ex: ExMap; ddb_id: str};
    Message: {cx: CxMap; ex: ExMap};
}>;
export const C = D.taggedEnum<T>();


export const pure = <A extends T>(self: A) => self;
export const data = f(pure, (self) => ({
    ex     : self,
    ax     : self,
    cx     : self,
    message: {
        embeds    : self.ex,
        components: self.cx,
    },
}));


export const make = (ix: IxIn) => {
    const cx = pipe(
        ix.message.components,
        Ar.flatMap((cs, row) => pipe(
            'components' in cs ? cs.components : [],
            Ar.map((c, col) => {
                const params = 'custom_id' in c ? defaultCxRouter.parse(c.custom_id) : CxVi.empty();

                return pipe(
                    Cx.make(c),
                    Cx.merge({
                        _data: CxVi.data(params),
                        _id  : {
                            ...params,
                            row: `${row}`,
                            col: `${col}`,
                        },
                        _status: 'mounted',
                    }),
                );
            }),
        )),
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
