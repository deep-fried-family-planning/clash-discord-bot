import {E, L} from '#src/internal/pure/effect.ts';
import {Kv, p, pipe, S} from '#src/internal/pure/effect.ts';
import {g} from '#src/internal/pure/effect.ts';
import type {num, str} from '#src/internal/pure/types-pure';
import type {Protocol} from '#src/ix/enum/enums.ts';
import {Current} from '#src/ix/enum/enums.ts';
import type {Sc, ScAction, ScConfig, ScInit, ScK} from '#src/ix/store/make-slice-types.ts';
import type {AnyE, EA} from '#src/internal/types.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {makeLambda} from '@effect-aws/lambda';
import type {Message} from 'dfx/types';
import type {Sx, Tx} from '#src/ix/store/types.ts';


export const makeSliceConfiguration = <
    Initial extends {
        [k in str]: {
            scope     : str;
            protocols?: [typeof Protocol[keyof typeof Protocol]];
        }
    },
    Initializer extends E.Effect<
        {
            [k in keyof Initial]: unknown
        },
        any,
        any
    >,
    Actions extends {
        [k in keyof Initial]: (state: Sx, sliceState: EA<Initializer>) => AnyE<Initializer>
    },
    View extends (s: Sx, sliceState: EA<Initializer>) => Tx,
>(
    config: {
        namespace   : str;
        initialState: Initial;
        initializer : (s: unknown) => Initializer;
        actions     : Actions;
        view        : View;
    },
) => {
    return config;
};


const example = makeSliceConfiguration({
    namespace   : 'example',
    initialState: {
        accounts: {
            scope    : 'a',
            protocols: ['cmap'],
        },
        availability: {
            scope    : 'av',
            protocols: ['cmap'],
        },
    },
    initializer: (s: unknown) => E.succeed({
        accounts    : '',
        availability: '',
    }),
    actions: {
        accounts: (s, sc) => g(function * () {
            yield * ClashOfClans.getClans([]);
            const thing = sc.availability;
            return sc;
        }),
        availability: (s, sc) => g(function * () {
            yield * DynamoDBDocument.get({});
            return sc;
        }),
    },
    view: (s, sc) => {
        if (sc.admin) {
            return {

            };
        }


        return {
            embeds: [],
            grid  : [
                {
                    onClick: this.actions.availability,
                },
            ],
        };
    },
});


const ex2 = () => g(function * () {
    yield * example.actions['availability']({}, {
        accounts    : '',
        availability: '',
    });
    yield * example.actions['accounts']({}, {
        accounts    : '',
        availability: '',
    });
});

makeLambda(ex2, pipe(
    L.empty,
    L.provideMerge(ClashOfClans.Live),
    L.provideMerge(DynamoDBDocument.defaultLayer),
));
