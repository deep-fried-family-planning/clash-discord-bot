import type {str} from '#src/internal/pure/types-pure.ts';
import {build, type ParamsBase, parse, set} from '#src/internal/ix-system/id/params-base.ts';


export const makeParams = <P extends ParamsBase>(routes: str[]) => ({
    parse: parse<P>(routes),
    build: build<P>(routes),
    set  : set,
    type : {} as {[k in keyof P]: str},
});
