import type {str} from '#src/internal/pure/types-pure.ts';
import {D, Kv, pipe} from '#src/internal/pure/effect.ts';
import type {Cx} from '.';
import {VxEx} from '.';
import {VxCx} from '.';


export type E = {
    Root: {
        name : str;
        label: str;
        fn   : () => VxCx.FrameT[] | VxEx.T[];
    };
    Dialog: {
        name : str;
        label: str;
        title: str;
        fn   : () => Extract<Cx.T, {_tag: 'Text'}>[];
    };
    Message: {
        name : str;
        label: str;
        fn   : () => VxCx.FrameT[] | VxEx.T[];
    };
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const pure = <A extends T>(self: A) => self;


export const make = C.$match({
    Dialog: (vxt) => ({vxt, cx: vxt.fn(), ex: []}),
    Root  : (vxt) => {
        const vxs = vxt.fn();

        const cx = [];
        const ex = [];

        for (const v of vxs) {
            if (VxEx.C.$is('PagedEmbed')(v)) {
                ex.push(...VxEx.make(v));
            }
            if (VxCx.FrameC.$is('ComponentFrame')(v) || VxCx.FrameC.$is('ComponentPageGroup')(v)) {
                cx.push(...VxCx.makeFrame(v));
            }
        }

        return {
            vxt,
            cx: pipe(cx, Kv.fromIterableWith((v) => [v._data!, v])),
            ex,
        };
    },
    Message: (vxt) => {
        const vxs = vxt.fn();

        const cx = [];
        const ex = [];

        for (const v of vxs) {
            if (VxEx.C.$is('PagedEmbed')(v)) {
                ex.push(...VxEx.make(v));
            }
            if (VxCx.FrameC.$is('ComponentFrame')(v) || VxCx.FrameC.$is('ComponentPageGroup')(v)) {
                cx.push(...VxCx.makeFrame(v));
            }
        }

        return {
            vxt,
            cx: pipe(cx, Kv.fromIterableWith((v) => [v._data!, v])),
            ex,
        };
    },
});


export type ShallowMap = Record<str, T>;


export const shallow = (node: T, unique: ShallowMap = {}) => {
    if (node.name in unique) {
        return unique;
    }

    if (C.$is('Dialog')(node)) {
        unique[node.name] = node;
    }

    unique[node.name] = node;

    if (C.$is('Root')(node) || C.$is('Message')(node)) {
        const components = node.fn();

        for (const c of components) {
            if (VxCx.FrameC.$is('ComponentFrame')(c) || VxCx.FrameC.$is('ComponentPageGroup')(c)) {
                unique = VxCx.shallow(node, c, unique);
            }
        }
    }

    return unique;
};
