import type {str} from '#src/internal/pure/types-pure.ts';
import {Ar, D, p} from '#src/internal/pure/effect.ts';
import {Ex} from '.';


export type E = {
    Embed: {
        name: str;
        data: Ex.T;
    };
    EmbedFunction: {
        name: str;
        data: () => Ex.T;
    };
    PagedEmbed: {
        name : str;
        pages: Extract<T, {_tag: 'Embed' | 'EmbedFunction'}>[];
    };
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const pure = <A extends T>(self: A) => self;


export const make = C.$match({
    Embed        : (vx) => [vx.data],
    EmbedFunction: (vx) => [vx.data()],
    PagedEmbed   : (vx) => p(
        vx.pages,
        Ar.map((pg, pgn) => {
            const data = C.$is('EmbedFunction')(pg)
                ? pg.data()
                : pg.data;

            return p(
                data,
                Ex.mergeId({
                    page_port  : vx.name,
                    page_static: `${pgn}`,
                }),
            );
        }),
    ),
});
