import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([{
    extends: 'vitest.config.ts',
    test   : {
        name         : 'unit',
        include      : ['test/unit/**/*.spec.ts'],
        restoreMocks : true,
        unstubEnvs   : true,
        unstubGlobals: true,
    },
}, {
    extends: 'vitest.config.ts',
    test   : {
        name       : 'fullstack',
        include    : ['test/fullstack'],
        testTimeout: 20000,
    },
}]);
