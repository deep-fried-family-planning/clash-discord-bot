import type {str, und} from '#src/internal/pure/types-pure.ts';
import {parse} from 'regexparam';


export type V2Params = {
    params: {
        view     : str;
        nextView : str;
        slice    : str;
        action   : str;
        ctype    : str;
        cmode    : str;
        row      : str;
        col      : str;
        modifiers: str;
    };
};


export type Route = {
    custom_id: str;
    template : str;

    v2?: V2Params;


    params: {
        kind     : str;
        type?    : str | und;
        nextKind?: str | und;
        nextType?: str | und;
        backKind?: str;
        backType?: str | und;
        forward? : str | und;
        data?    : str[];
    };
    predicate    : str;
    nextPredicate: str;
    backPredicate: str;
};
export type RouteParams = Route['params'];


const templates = [
    '/v2/:view/:nextView/:slice/:action/:ctype/:cmode/:row/:col/:modifiers*',

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
