import type {str} from '#src/internal/pure/types-pure.ts';
import {parse} from 'regexparam';
import type {RDXT} from '#src/discord/ixc/store/types.ts';
import type {RDXK} from '#src/discord/ixc/store/types.ts';


export type Route = {
    custom_id: str;
    template : str;
    params: {
        kind     : RDXK;
        type?    : RDXT;
        nextKind?: RDXK;
        nextType?: RDXT;
        forward? : str | undefined;
        data?    : str[];
    };
    predicate    : str;
    nextPredicate: str;
};
export type RouteParams = Route['params'];


export const enum DELIM {
    DATA = '&',
    RESERVED_FWDSLASH = '/',
    RESERVED_PIPE = '|',
};


const templates = [
    '/k/:kind/t/:type/l/:nextKind/u/:nextType/f/:forward/d/:data',
    '/k/:kind/t/:type/l/:nextKind/u/:nextType/f/:forward',
    '/k/:kind/t/:type/l/:nextKind/u/:nextType',
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
