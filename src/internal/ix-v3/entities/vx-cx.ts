import type {num, str} from '#src/internal/pure/types-pure.ts';
import {Ar, D, p} from '#src/internal/pure/effect.ts';
import {Cx, VxTree} from '.';
import type {ShallowMap} from '#src/internal/ix-v3/entities/vx-tree.ts';
import type {EnumJust} from '#src/internal/ix-v3/entities/util.ts';


type Page = {
    _page?: {
        pgp?: str;
        pgn?: str;
        pgx?: str;
    };
};


export type E = {
    Component: Page & {
        data: Cx.T;
    };
    FunctionComponent: Page & {
        name: str;
        data: () => Cx.T;
    };
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const make = C.$match({
    Component        : (vx) => vx.data,
    FunctionComponent: (vx) => vx.data(),
});


export type RowE = {
    ComponentRow: {
        row         : num;
        page_port?  : str;
        page_static?: str;
        data        : T[];
    };
    ComponentPage: {
        page_port?  : str;
        page_static?: str;
        data        : EnumJust<RowT, 'ComponentRow'>[];
    };
};
export type RowT = D.TaggedEnum<RowE>;
export const RowC = D.taggedEnum<RowT>();


export const makeRow = RowC.$match({
    ComponentRow: (vx) => p(vx.data, Ar.map((cx, col) => p(
        make(cx),
        Cx.mergeId({
            row: `${vx.row}`,
            col: `${col}`,
        }),
    ))),
    ComponentPage: (vx) => p(vx.data, Ar.flatMap((pg, row) => p(pg.data, Ar.map((cx, col) => p(
        make(cx),
        Cx.mergeId({
            pgp: vx.page_port!,
            pgn: vx.page_static!,
            row: `${row}`,
            col: `${col}`,
        }),
    ))))),
});


export type FrameE = {
    ComponentPageGroup: {
        name: str;
        data: EnumJust<RowT, 'ComponentPage'>[];
    };
    ComponentFrame: {
        data: EnumJust<RowT, 'ComponentRow'>[] | EnumJust<FrameT, 'ComponentPageGroup'>[];
    };
};
export type FrameT = D.TaggedEnum<FrameE>;
export const FrameC = D.taggedEnum<FrameT>();


export const makeFrame = FrameC.$match({
    ComponentPageGroup: (vx) => p(vx.data, Ar.flatMap((pg, pgn) => p(pg.data, Ar.flatMap((pg, row) => makeRow({
        ...pg,
        row        : row,
        page_port  : pg.page_port!,
        page_static: `${pgn}`,
    }))))),
    ComponentFrame: (vx) => p(vx.data, Ar.flatMap((pgrow, maybeRow) => {
        if (RowC.$is('ComponentRow')(pgrow)) {
            return makeRow({
                ...pgrow,
                row: maybeRow,
            });
        }
        return p(pgrow.data, Ar.flatMap((pg, pgn) => p(pg.data, Ar.flatMap((pg, row) => makeRow({
            ...pg,
            row        : row,
            page_port  : pg.page_port!,
            page_static: `${pgn}`,
        })))));
    })),
});


export const shallow = (frameNode: VxTree.T, node: FrameT, unique: ShallowMap = {}) => {
    const vx = makeFrame(node);

    for (const cx of vx) {
        if (cx._switch) {
            const nextFrame = cx._switch();

            unique[nextFrame.name] = nextFrame;
            unique = VxTree.shallow(nextFrame, unique);
        }
    }

    return unique;
};
