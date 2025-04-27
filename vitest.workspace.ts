import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  {
    extends: 'vitest.config.ts',
    test   : {
      name              : 'unit',
      include           : ['test/unit/**/*.spec.ts', 'test/unit/**/*.spec.tsx'],
      restoreMocks      : true,
      unstubEnvs        : true,
      unstubGlobals     : true,
      expandSnapshotDiff: true,
      benchmark         : {
        include: ['test/unit/**/*.bench.ts'],
      },
    },
  },
  {
    extends: 'vitest.config.ts',
    test   : {
      name              : 'fullstack',
      include           : ['test/fullstack'],
      testTimeout       : 3000,
      expandSnapshotDiff: true,
      benchmark         : {
        include: [],
      },
    },
  },
]);
