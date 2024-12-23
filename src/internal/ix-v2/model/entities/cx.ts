import {D, f, p} from '#src/internal/pure/effect.ts';
import type {ActionRow, SelectMenu, TextInput} from 'dfx/types';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import type {RestButton, RestText} from '#src/internal/ix-v2/model/types.ts';
import {Discord} from 'dfx';
import type {snflk} from '#src/discord/types.ts';


type RxCx = SelectMenu | TextInput | RestButton | ActionRow;


type Meta = {
    _meta: {
        id      : Record<str, str>;
        onClick?: Record<str, any>;
    };
};


export type Cx = D.TaggedEnum<{
    None   : Meta & ActionRow & {custom_id: str};
    Row    : Meta & ActionRow & {custom_id: str};
    Button : Meta & RestButton;
    Text   : Meta & RestText;
    String : Meta & SelectMenu;
    User   : Meta & SelectMenu;
    Role   : Meta & SelectMenu;
    Channel: Meta & SelectMenu;
    Mention: Meta & SelectMenu;
}>;


export const Cx = D.taggedEnum<Cx>();


const TMap = {
    [Discord.ComponentType.ACTION_ROW as num]        : Cx.None,
    [Discord.ComponentType.BUTTON as num]            : Cx.Button,
    [Discord.ComponentType.TEXT_INPUT as num]        : Cx.Text,
    [Discord.ComponentType.STRING_SELECT as num]     : Cx.String,
    [Discord.ComponentType.USER_SELECT as num]       : Cx.User,
    [Discord.ComponentType.ROLE_SELECT as num]       : Cx.Role,
    [Discord.ComponentType.CHANNEL_SELECT as num]    : Cx.Channel,
    [Discord.ComponentType.MENTIONABLE_SELECT as num]: Cx.Mention,
};


export const pure = <T extends Cx>(cx: T) => cx;

export const map = <T, V>(f: (a: T) => V) => (b: T) => f(b);

export const set = <T extends Cx, K extends keyof T>(k: K, v: T[K]) => (cx: T) => {
    cx[k] = v;
    return cx;
};

export const withoutMeta = <T extends Meta>({_meta, ...cx}: T) => cx;

export const withoutTag = <T extends {_tag: str}>({_tag, ...cx}: T) => cx;

export const fromRx = (rxCx: RxCx) => p(
    TMap[rxCx.type]({...rxCx, _meta: {id: {}}} as never),
    Cx.$match({
        None   : (cx) => cx,
        Row    : (cx) => cx,
        Button : (cx) => cx,
        Text   : (cx) => cx,
        String : (cx) => cx,
        User   : (cx) => cx,
        Role   : (cx) => cx,
        Channel: (cx) => cx,
        Mention: (cx) => cx,
    }),
);

export const setOptions = (options: unknown[]) => Cx.$match({
    None   : () => [],
    Row    : () => [],
    Button : (cx) => [cx.label!],
    Text   : (cx) => [cx.value!],
    String : (cx) => cx.options!.filter((o) => o.default).map((o) => o.value),
    User   : (cx) => cx.default_values!.map((v) => v.id),
    Role   : (cx) => cx.default_values!.map((v) => v.id),
    Channel: (cx) => cx.default_values!.map((v) => v.id),
    Mention: () => [],
});

export const getSelected = Cx.$match({
    None   : () => [],
    Row    : () => [],
    Button : (cx) => [cx.label!],
    Text   : (cx) => [cx.value!],
    String : (cx) => cx.options!.filter((o) => o.default).map((o) => o.value),
    User   : (cx) => cx.default_values!.map((v) => v.id),
    Role   : (cx) => cx.default_values!.map((v) => v.id),
    Channel: (cx) => cx.default_values!.map((v) => v.id),
    Mention: () => [],
});

export const setSelected = (...sel: str[]) => Cx.$match({
    None   : pure,
    Row    : pure,
    Button : pure,
    Text   : (cx) => ({...cx, value: sel[0]}),
    String : (cx) => ({...cx, options: cx.options!.map((o) => ({...o, default: sel.includes(o.value)}))}),
    User   : (cx) => ({...cx, default_values: sel.map((id) => ({type: 'user', id: id as snflk}))}),
    Role   : (cx) => ({...cx, default_values: sel.map((id) => ({type: 'role', id: id as snflk}))}),
    Channel: (cx) => ({...cx, default_values: sel.map((id) => ({type: 'channel', id: id as snflk}))}),
    Mention: pure,
});

export const update = (update: Partial<Cx>) => f(
    pure,
    (cx) => ({...cx, ...update, _meta: cx._meta}),
);

export const updateMeta = (update: Partial<Meta['_meta']>) => f(
    pure,
    (cx) => ({...cx, _meta: {...cx._meta, ...update, id: {...cx._meta.id, ...update.id}}}),
);

export const merge = <T extends Cx>(a?: T) => (b: T) => ({
    ...b,
    ...a,
    meta: {
        ...b._meta,
        ...a?._meta,
        id: {
            ...a?._meta.id,
            ...b._meta.id,
        },
    },
});

export const setCustomId = (custom_id: str) => f(pure, set('custom_id', custom_id));

export const toTx = f(pure, withoutMeta, withoutTag);


// export const Tag: {[k in Cx['_tag']]: k} = {
//     [Cx.Row('' as any)._tag]    : Cx.Row('' as any)._tag,
//     [Cx.Button('' as any)._tag] : Cx.Button('' as any)._tag,
//     [Cx.Text('' as any)._tag]   : Cx.Text('' as any)._tag,
//     [Cx.String('' as any)._tag] : Cx.String('' as any)._tag,
//     [Cx.User('' as any)._tag]   : Cx.User('' as any)._tag,
//     [Cx.Role('' as any)._tag]   : Cx.Role('' as any)._tag,
//     [Cx.Channel('' as any)._tag]: Cx.Channel('' as any)._tag,
//     [Cx.Mention('' as any)._tag]: Cx.Mention('' as any)._tag,
// };
