import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';


export const SingleSelect = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,

    };
}));
