import console from 'node:console';
import * as path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig(({mode}) => ({
  appType: 'custom',
  plugins: [tsconfigPaths()],
  test   : {
    watch: false,

    environment       : 'node',
    globals           : true,
    reporters         : ['verbose'],
    expandSnapshotDiff: true,

    testTimeout      : 0,
    hookTimeout      : 0,
    teardownTimeout  : 0,
    slowTestThreshold: 5000,

    isolate                : false,
    fileParallelism        : true,
    passWithNoTests        : true,
    includeTaskLocation    : true,
    logHeapUsage           : true,
    disableConsoleIntercept: true,

    coverage: {
      reportsDirectory: './.coverage',
      provider        : 'v8',
      reporter        : ['lcov'],
      reportOnFailure : true,
      ignoreEmptyLines: true,
      thresholds      : {
        perFile   : true,
        autoUpdate: true,
        statements: 0,
        branches  : 0,
        functions : 0,
        lines     : 0,
      },
    },

    benchmark: {
      compare   : './test/bench/vitest.bench.json',
      outputJson: './test/bench/vitest.bench.json',
    },

    projects: [
      {
        extends: true,
        test   : {
          name     : 'bench',
          include  : [],
          benchmark: {
            include  : ['./test/bench/**/*.bench.ts'],
            reporters: 'verbose',
          },
        },
      },
      {
        extends: true,
        test   : {
          name              : 'unit',
          include           : ['./test/unit/**/*.spec.ts', './test/unit/**/*.spec.tsx'],
          restoreMocks      : true,
          unstubEnvs        : true,
          unstubGlobals     : true,
          expandSnapshotDiff: true,
          // env               : {NODE_ENV: 'development'},
        },
      },
      {
        extends: true,
        test   : {
          name       : 'fullstack',
          include    : ['./test/fullstack/**/*.spec.ts', './test/fullstack/**/*.spec.tsx'],
          testTimeout: 3000,
        },
      },
    ],

    resolveSnapshotPath: (testPath, snapExtension, context) => {
      const parsed = path.parse(testPath);

      return `${parsed.dir}/.snap/${parsed.name}${snapExtension}`;
    },
  },
}));
