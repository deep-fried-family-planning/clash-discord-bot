import {makeSlice} from '#src/ix/store/make-slice.ts';
import {E, g} from '#src/internal/pure/effect.ts';
import {DriverError} from '#src/ix/store/make-driver.ts';


export const v2TestSlice = makeSlice({
    name: 'test',
    spec: {
        test: {
            scope: 'test',
        },
        accounts: {
            scope    : 'accounts',
            // type     : Discord.ComponentType.BUTTON,
            protocols: ['cmap'],
        },
        ope: {
            scope    : 'scope',
            protocols: ['cmap'],
        },
        errors: {
            scope    : 'errors',
            protocols: ['cmap'],
        },
    },
    init: (a: unknown) => g(function * () {
        return {
            test: {
                message: 'test',
            },
            accounts: {
                message: 'init accounts',
            },
            ope: {
                message: 'init ope',
            },
            errors: {
                message: 'init ope',
            },
        };
    }),
    actions: {
        accounts: (a, b, ax) => g(function * () {
            return b;
        }),
        ope: (sg, sc, ax) => g(function * () {
            return sc;
        }),
        test  : (a, b) => E.succeed(b),
        errors: (a, b) => new DriverError({message: 'Teehee'}),
    },
});
