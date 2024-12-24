import {Ar, D, f, Kv} from '#src/internal/pure/effect.ts';
import type {Rx} from '.';
import {Cx, CxVi} from '.';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {CxMap, EnumJust} from '#src/internal/ix-v3/entities/util.ts';
import type {IxIn} from '#src/internal/ix-v2/model/types.ts';
import {defaultCxRouter} from '#src/internal/ix-v3/routing';
import type {ResolvedDatum} from 'dfx/types';
import {Discord} from 'dfx';
import {pipe} from 'effect';


export type E = {
    DialogSubmit : {_id: CxVi.T; _data: str; cx: CxMap};
    DialogOpen   : {_id: CxVi.T; _data: str; dialog: str};
    Close        : {_id: CxVi.T; _data: str};
    Button       : {_id: CxVi.T; _data: str};
    Select       : {_id: CxVi.T; _data: str; selected: str[]};
    SelectManaged: {_id: CxVi.T; _data: str; selected: str[]; resolved: ResolvedDatum};
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const pure = <A extends T>(self: A) => self;


export const make = (ix: IxIn) => {
    const _id = defaultCxRouter.parse(ix.data.custom_id);

    if (_id.mod === 'close') {
        return C.Close({
            _id,
            _data: CxVi.data(_id),
        });
    }

    if ('values' in ix.data) {
        const selected = (ix.data.values ?? []) as unknown as str[];

        if ('resolved' in ix.data) {
            return C.SelectManaged({
                _id,
                _data   : CxVi.data(_id),
                selected,
                resolved: ix.data.resolved,
            });
        }
        return C.Select({
            _id,
            _data: CxVi.data(_id),
            selected,
        });
    }

    if (ix.type === Discord.InteractionType.MODAL_SUBMIT) {
        const dx = pipe(
            'components' in ix.data ? ix.data.components : [],
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
                            _status: 'willDismount',
                        }),
                    );
                })),
            ),
        );
        const cx = pipe(dx, Kv.fromIterableWith((v) => [v._data!, v]));

        return C.DialogSubmit({
            _id,
            _data: CxVi.data(_id),
            cx,
        });
    }

    if (_id.mod === 'dialog') {
        return C.DialogOpen({
            _id,
            _data : CxVi.data(_id),
            dialog: _id.view,
        });
    }

    return C.Button({
        _id,
        _data: CxVi.data(_id),
    });
};
