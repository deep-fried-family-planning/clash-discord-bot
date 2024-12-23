import type {Embed} from 'dfx/types';
import {D, Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Cx} from '#src/internal/ix-v2/model/system.ts';
import {$init, $flip, $lift} from '#src/internal/ix-v2/model/entities/alias.ts';


export type Rest = Embed;


type Meta = {
    _meta: {
        protocol?: str;
        name?    : str;
        path?    : str[];
        map?     : {[k in str]: str};
    };
};


export type Ex = D.TaggedEnum<{
    None        : Meta & Rest;
    Basic       : Meta & Rest;
    LinkedViewer: Meta & Rest;
    Viewer      : Meta & Rest;
    Editor      : Meta & Rest;
    JSON        : Meta & Rest;
    Table       : Meta & Rest;
}>;


export const Ex = D.taggedEnum<Ex>();


export const TMap = {
    '/ex/none'         : Ex.None,
    '/ex/basic'        : Ex.Basic,
    '/ex/linked-viewer': Ex.LinkedViewer,
    '/ex/viewer'       : Ex.Viewer,
    '/ex/editor'       : Ex.Editor,
    '/ex/json'         : Ex.JSON,
    '/ex/table'        : Ex.Table,
};


const baseUrl = 'https://dffp.org';


export const pure = <T extends Ex>(ex: T) => ex;


export const fromRx = (ex: Embed) => {
    if (!ex.author) {
        return Ex.Basic({_meta: {}, ...ex});
    }

    if (!ex.author.url) {
        return Ex.Basic({_meta: {}, ...ex});
    }

    const url = new URL(ex.author.url);

    if (url.origin !== baseUrl) {
        return Ex.Basic({_meta: {}, ...ex});
    }

    if (!(url.pathname in TMap)) {
        return Ex.Basic({_meta: {}, ...ex});
    }

    const [,first, kind, name, ...path] = url.pathname.split('/');

    const protocol = `/${first}/${kind}`;

    return TMap[protocol as keyof typeof TMap]({
        _meta: {
            protocol: protocol,
            path    : path,
            name    : name,
        },
        ...ex,
    });
};


export const resolveMap = (ex: Ex, protocols: {[k in str]: {[j in str]: str}}) => ({
    ...ex,
    meta: {
        ...ex._meta,
        map: protocols[ex._meta.name ?? ''] ?? {},
        rev: p(
            protocols[ex._meta.name ?? ''] ?? {},
            Kv.mapEntries((v, k) => [k, v]),
        ),
    },
});


export const decode = Ex.$match({
    None        : () => ({}),
    Basic       : () => ({}),
    LinkedViewer: () => ({}),
    Viewer      : () => ({}),
    Editor      : (ex) => p($init(ex._meta.map), $flip, $lift, Kv.mapEntries((v, k) => [v, Cx.Cx.Text({value: ex[k as keyof typeof ex]} as ReturnType<typeof Cx.Cx.Text>)])),
    JSON        : (ex) => p(ex.description!, JSON.parse) as Record<str, Cx.Cx>,
    Table       : () => ({}),
});


export const encode = (cx: Record<str, Cx.Cx>) => Ex.$match({
    None        : (ex) => ex,
    Basic       : (ex) => ex,
    LinkedViewer: (ex) => ex,
    Viewer      : (ex) => ex,
    Editor      : (ex) => ({...ex, ...p($init(ex._meta.map), $lift, Kv.map((v) => Cx.getSelected(cx[v])))}),
    JSON        : (ex) => ({...ex, description: JSON.stringify(cx)}),
    Table       : (ex) => ex,
});


export const attachUrl = Ex.$match({
    None        : pure,
    Basic       : pure,
    LinkedViewer: (ex) => ({...ex, author: {...ex.author, name: ex.author?.name ?? ex._meta.name ?? ex._meta.protocol!, url: `${baseUrl}/ex/${ex._meta.protocol ?? 'linked-viewer'}/${ex._meta.name}`}}),
    Viewer      : (ex) => ({...ex, author: {...ex.author, name: ex.author?.name ?? ex._meta.name ?? ex._meta.protocol!, url: `${baseUrl}/ex/${ex._meta.protocol ?? 'viewer'}/${ex._meta.name}`}}),
    Editor      : (ex) => ({...ex, author: {...ex.author, name: ex.author?.name ?? ex._meta.name ?? ex._meta.protocol!, url: `${baseUrl}/ex/${ex._meta.protocol ?? 'editor'}/${ex._meta.name}`}}),
    JSON        : (ex) => ({...ex, author: {...ex.author, name: ex.author?.name ?? ex._meta.name ?? ex._meta.protocol!, url: `${baseUrl}/ex/${ex._meta.protocol ?? 'json'}/${ex._meta.name}`}}),
    Table       : (ex) => ({...ex, author: {...ex.author, name: ex.author?.name ?? ex._meta.name ?? ex._meta.protocol!, url: `${baseUrl}/ex/${ex._meta.protocol ?? 'table'}/${ex._meta.name}`}}),
});


export const toTx = Ex.$match({
    None        : ({_tag, _meta, ...ex}) => ex,
    Basic       : ({_tag, _meta, ...ex}) => ex,
    LinkedViewer: ({_tag, _meta, ...ex}) => ex,
    Viewer      : ({_tag, _meta, ...ex}) => ex,
    Editor      : ({_tag, _meta, ...ex}) => ex,
    JSON        : ({_tag, _meta, ...ex}) => ex,
    Table       : ({_tag, _meta, ...ex}) => ex,
});
