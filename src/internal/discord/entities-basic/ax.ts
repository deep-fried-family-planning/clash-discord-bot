import {Const, Cx, CxVR, Flags} from '#dfdis';
import {defaultCxRouter} from '#discord/model-routing/ope.ts';
import type {CxMap, IxIn} from '#discord/utils/types.ts';
import {isComponentIx, isModalIx} from '#discord/utils/types.ts';
import {Ar, D, Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';
import type {ActionRow, ResolvedDatum} from 'dfx/types';


export type E = {
    DialogSubmit : {_id: CxVR.T; _data: str; _flags: Flags.Id[]; cx: CxMap};
    DialogOpen   : {_id: CxVR.T; _data: str; _flags: Flags.Id[]; dialog: str};
    Close        : {_id: CxVR.T; _data: str; _flags: Flags.Id[]};
    Button       : {_id: CxVR.T; _data: str; _flags: Flags.Id[]};
    Select       : {_id: CxVR.T; _data: str; _flags: Flags.Id[]; selected: str[]};
    SelectManaged: {_id: CxVR.T; _data: str; _flags: Flags.Id[]; selected: str[]; resolved: ResolvedDatum};
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const make = (ix: IxIn) => {
    const _id = defaultCxRouter.parse('custom_id' in ix.data ? ix.data.custom_id : '');
    const _data = CxVR.vData(_id);
    const _flags = Flags.assignFlags(_id);

    if (_id.mod === Const.CLOSE) {
        return C.Close({
            _data,
            _id,
            _flags,
        });
    }

    if (isComponentIx(ix.data) && 'values' in ix.data) {
        const selected = ix.data.values as unknown as str[];

        return 'resolved' in ix.data
            ? C.SelectManaged({
                _data,
                _id,
                _flags,
                selected,
                resolved: ix.data.resolved,
            })
            : C.Select({
                _data,
                _id,
                _flags,
                selected,
            });
    }

    if (isModalIx(ix.data) && ix.type === Discord.InteractionType.MODAL_SUBMIT) {
        const cx = p(
            ix.data.components,
            Ar.flatMap((cs, row) => p((cs as ActionRow).components, Ar.map((c, col) => p(
                Cx.make(c),
                Cx.merge({
                    _data,
                    _id: {
                        ...defaultCxRouter.parse((c as {custom_id: str}).custom_id),
                        row: `${row}`,
                        col: `${col}`,
                    },
                    _status: Cx.Status.will_mount,
                }),
                Cx.map((cx) => p(cx, Cx.set('_flags', Flags.assignFlags(cx._id)))),
                Cx.map((cx) => p(cx, Cx.set('_data', CxVR.vData(cx._id)))),
            )))),
            Kv.fromIterableWith((v) => [v._data!, v]),
        );

        return C.DialogSubmit({
            _data,
            _id,
            _flags,
            cx,
        });
    }

    if (_id.mod === 'dialog') {
        return C.DialogOpen({
            _data,
            _id,
            _flags,
            dialog: _id.view,
        });
    }

    return C.Button({
        _data,
        _id,
        _flags,
    });
};
