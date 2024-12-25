import type {Cx, CxVR, Flags, VxTree} from '#dfdis';
import {Const} from '#dfdis';
import {D, f} from '#src/internal/pure/effect.ts';
import {ANY, type ne, type num, type str, type und} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';
import type {Button, Component, SelectMenu, TextInput} from 'dfx/types';


export const enum Status {
    will_mount = 'will_mount',
    mounted = 'mounted',
    will_dismount = 'will_dismount',
    dismounted = 'dismounted',
    unknown = 'unknown',
    embed = 'embed',
}


type _Meta = {
    _data?  : str | und;
    _id?    : CxVR.T | und;
    _flags? : Flags.Id[];
    _click? : und | (() => {slice: str; action: str});
    _switch?: und | (() => VxTree.T);
    _status?: und | Status;
};


export type E = {
    None   : _Meta & {custom_id?: str};
    Button : _Meta & Partial<Button>;
    Link   : _Meta & Partial<Button>;
    Select : _Meta & Partial<SelectMenu>;
    User   : _Meta & Partial<SelectMenu>;
    Role   : _Meta & Partial<SelectMenu>;
    Channel: _Meta & Partial<SelectMenu>;
    Mention: _Meta & Partial<SelectMenu>;
    Text   : _Meta & Partial<TextInput>;
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();
export const Tag: {[k in Cx.T['_tag']]: k} = {
    None   : 'None',
    Button : 'Button',
    Link   : 'Link',
    Select : 'Select',
    User   : 'User',
    Role   : 'Role',
    Channel: 'Channel',
    Mention: 'Mention',
    Text   : 'Text',
};


export const pure = <A extends T>(self: A) => self;
export const map = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const set = <A extends T, B extends keyof A, C extends A[B] >(b: B, c: C) => (a: A) => {
    a[b] = c;
    return a;
};
export const merge = <A extends T>(a: Partial<A>) => (b: A) => ({...b, ...a, _id: {...b._id, ...a._id}});
export const mergeId = <A extends T>(a: Partial<A['_id']>) => (b: A) => ({...b, _id: {...b._id, ...a}});
export const data = f(pure, ({_tag, _data, _id, _flags, _click, _switch, _status, ...cx}) => cx);


const TMap = {
    [Discord.ComponentType.ACTION_ROW as num]        : C.None,
    [Discord.ComponentType.TEXT_INPUT as num]        : C.Text,
    [Discord.ComponentType.STRING_SELECT as num]     : C.Select,
    [Discord.ComponentType.USER_SELECT as num]       : C.User,
    [Discord.ComponentType.ROLE_SELECT as num]       : C.Role,
    [Discord.ComponentType.CHANNEL_SELECT as num]    : C.Channel,
    [Discord.ComponentType.MENTIONABLE_SELECT as num]: C.Mention,
};


export const make = (rest: Component) => {
    if (rest.type in TMap) {
        return TMap[rest.type](rest as never);
    }

    if (rest.type === Discord.ComponentType.BUTTON) {
        if (!('custom_id' in rest)) {
            return C.Link({
                ...rest,
                custom_id: Const.NONE,
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        else return C.Button(rest as ne);
    }

    return C.None({
        _data  : Const.NONE,
        _id    : ANY(),
        _status: Status.unknown,
    });
};
