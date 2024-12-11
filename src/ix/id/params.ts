import type {str} from '#src/internal/pure/types-pure.ts';
import {build, type ParamsBase, parse, set} from '#src/ix/id/params-base.ts';


export const makeParams = <P extends ParamsBase>(routes: str[]) => ({
    parse: parse<P>(routes),
    build: build<P>(routes),
    set  : set<P>,
});
