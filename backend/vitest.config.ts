import * as path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  appType: 'custom',
  plugins: [tsconfigPaths()],
  test   : {
    globals            : true,
    environment        : 'node',
    watch              : false,
    includeTaskLocation: true,
    logHeapUsage       : true,

    reporters         : ['verbose'],
    expandSnapshotDiff: true,
    testTimeout       : 0,
    hookTimeout       : 0,
    teardownTimeout   : 0,
    slowTestThreshold : 5000,

    benchmark: {
      include   : [],
      reporters : ['verbose'],
      compare   : './test/vitest.bench.json',
      outputJson: './test/vitest.bench.json',
    },

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

    resolveSnapshotPath: (testPath, snapExtension, context) => {
      const parsed = path.parse(testPath);

      return `${parsed.dir}/.snap/${parsed.name}${snapExtension}`;
    },
  },
});
