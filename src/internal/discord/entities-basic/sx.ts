import type {Rx} from '#dfdis';
import {Ax, Cx} from '#dfdis';
import type {CxMap} from '#discord/utils/types.ts';
import {Kv} from '#src/internal/pure/effect';
import {pipe} from 'effect';


export const mergeSxAx = (rx: Rx.T) => Ax.C.$match({
    DialogSubmit: (ax) => ({ax, rx, sx: {...rx.cx, ...ax.cx} as CxMap}),
    DialogOpen  : (ax) => ({ax, rx, sx: rx.cx}),
    Close       : (ax) => ({ax, rx, sx: rx.cx}),
    Button      : (ax) => ({ax, rx, sx: rx.cx}),

    SelectManaged: (ax) => Cx.C.$match({
        None   : () => ({ax, rx, sx: rx.cx}),
        Row    : () => ({ax, rx, sx: rx.cx}),
        Button : () => ({ax, rx, sx: rx.cx}),
        Link   : () => ({ax, rx, sx: rx.cx}),
        Select : () => ({ax, rx, sx: rx.cx}),
        Text   : () => ({ax, rx, sx: rx.cx}),
        User   : (cx) => ({ax, rx, sx: pipe(rx.cx, Kv.set(ax._data, {...cx, default_values: ax.selected.map((s) => ({id: s, type: 'user'}))})) as CxMap}),
        Role   : (cx) => ({ax, rx, sx: pipe(rx.cx, Kv.set(ax._data, {...cx, default_values: ax.selected.map((s) => ({id: s, type: 'role'}))})) as CxMap}),
        Channel: (cx) => ({ax, rx, sx: pipe(rx.cx, Kv.set(ax._data, {...cx, default_values: ax.selected.map((s) => ({id: s, type: 'channel'}))})) as CxMap}),
        Mention: () => ({ax, rx, sx: rx.cx}),
    })(rx.cx[ax._data]),

    Select: (ax) => Cx.C.$match({
        None   : () => ({ax, rx, sx: rx.cx}),
        Row    : () => ({ax, rx, sx: rx.cx}),
        Button : () => ({ax, rx, sx: rx.cx}),
        Link   : () => ({ax, rx, sx: rx.cx}),
        Select : (cx) => ({ax, rx, sx: pipe(rx.cx, Kv.set(ax._data, {...cx, options: cx.options!.map((o) => ({...o, default: ax.selected.includes(o.value)}))})) as CxMap}),
        User   : () => ({ax, rx, sx: rx.cx}),
        Role   : () => ({ax, rx, sx: rx.cx}),
        Channel: () => ({ax, rx, sx: rx.cx}),
        Mention: () => ({ax, rx, sx: rx.cx}),
        Text   : () => ({ax, rx, sx: rx.cx}),
    })(rx.cx[ax._data]),
});
