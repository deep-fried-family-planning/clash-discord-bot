import {D, f} from '#src/internal/pure/effect.ts';
import type {RestButton, RestSelect, RestText} from '#src/internal/ix-v2/model/types.ts';
import type {ActionRow, Component} from 'dfx/types';
import type {num, ny, str, und} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';
import {NONE} from '#src/internal/ix-v3/entities/constants.ts';
import type {VxTree} from '.';
import {CxVi} from '.';
import type {DataSpec} from '#src/internal/ix-v3/partition/state-slice.ts';


type _Meta = {
    _data?   : str | und;
    _id      : CxVi.T;
    _click?  : und | (() => DataSpec);
    _switch? : und | (() => VxTree.T);
    _pswitch?: und | (() => VxTree.T);
    _status? : und | 'mounted' | 'dismounted' | 'willMount' | 'willDismount';
};


export type E = {
    None   : _Meta & {custom_id: str};
    Row    : _Meta & ActionRow & {custom_id: str};
    Button : _Meta & Partial<RestButton> & {custom_id: str};
    Link   : _Meta & Partial<RestButton>;
    Premium: _Meta & Partial<RestButton>;
    Select : _Meta & Partial<RestSelect>;
    User   : _Meta & Partial<RestSelect>;
    Role   : _Meta & Partial<RestSelect>;
    Channel: _Meta & Partial<RestSelect>;
    Mention: _Meta & Partial<RestSelect>;
    Text   : _Meta & Partial<RestText>;
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const empty = () => {
    const params = CxVi.empty();

    return C.None({
        custom_id: NONE,
        _data    : CxVi.data(params),
        _id      : params,
    });
};

export const pure = <A extends T>(self: A) => self;

export const map = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);

export const data = f(
    pure,
    ({
        _tag,
        _data,
        _id,
        ...cx
    }) => cx,
);

export const set = <
    A extends T,
    B extends keyof A,
    C extends A[B],
>(
    b: B,
    c: C,
) => (a: A) => {
    a[b] = c;
    return a;
};

export const merge = <A extends T>(a: Partial<A>) => (b: A) => ({
    ...b,
    ...a,
    _id: {
        ...b._id,
        ...a._id,
    },
});
export const mergeId = <A extends T>(a: Partial<A['_id']>) => (b: A) => ({
    ...b,
    _id: {
        ...b._id,
        ...a,
    },
});


const TMap = {
    [Discord.ComponentType.ACTION_ROW as num]: C.Row,
    [Discord.ComponentType.BUTTON as num]    : (rx: RestButton) => {
        if (!rx.custom_id) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return C.Link({...rx, custom_id: NONE} as ny);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        else return C.Button(rx as ny);
    },
    [Discord.ComponentType.TEXT_INPUT as num]        : C.Text,
    [Discord.ComponentType.STRING_SELECT as num]     : C.Select,
    [Discord.ComponentType.USER_SELECT as num]       : C.User,
    [Discord.ComponentType.ROLE_SELECT as num]       : C.Role,
    [Discord.ComponentType.CHANNEL_SELECT as num]    : C.Channel,
    [Discord.ComponentType.MENTIONABLE_SELECT as num]: C.Mention,
};
export const make = (rest: Component) => TMap[rest.type](rest as never);
