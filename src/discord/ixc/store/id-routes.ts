import type {str, und} from '#src/internal/pure/types-pure.ts';
import {parse} from 'regexparam';
import type {RDXK} from '#src/discord/ixc/store/types.ts';


export type Route = {
    custom_id: str;
    template : str;
    params: {
        kind     : RDXK;
        type?    : str | und;
        nextKind?: RDXK | und;
        nextType?: str | und;
        backKind?: RDXK;
        backType?: str | und;
        forward? : str | und;
        data?    : str[];
    };
    predicate    : str;
    nextPredicate: str;
    backPredicate: str;
};
export type RouteParams = Route['params'];


export const enum DELIM {
    DATA = '&',
    SLASH = '/',
    PIPE = '|',
};


const templates = [
    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType/bk/:backKind/bt/:backType/f/:forward/d/:data',
    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType/bk/:backKind/bt/:backType/f/:forward',
    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType/bk/:backKind/bt/:backType/d/:data',
    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType/bk/:backKind/bt/:backType',

    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType/f/:forward/d/:data',
    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType/f/:forward',
    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType/d/:data',
    '/k/:kind/t/:type/nk/:nextKind/nt/:nextType',

    '/k/:kind/t/:type/bk/:backKind/bt/:backType/f/:forward/d/:data',
    '/k/:kind/t/:type/bk/:backKind/bt/:backType/f/:forward',
    '/k/:kind/t/:type/bk/:backKind/bt/:backType/d/:data',
    '/k/:kind/t/:type/bk/:backKind/bt/:backType',

    '/k/:kind/t/:type/f/:forward/d/:data',
    '/k/:kind/t/:type/f/:forward',
    '/k/:kind/t/:type/d/:data',
    '/k/:kind/t/:type',

    '/k/:kind',
] as const;


export const ID_ROUTES = templates.map((template) => {
    const route = parse(template);
    return {
        template,
        ...route,
    } as const;
});
