import tsconfigPaths from 'vite-tsconfig-paths'
import {defineConfig} from 'vitest/config'



export default defineConfig({
  plugins: [tsconfigPaths()],
  test   : {
    globals            : true,
    environment        : 'node',
    watch              : false,
    includeTaskLocation: true,
    logHeapUsage       : true,

    reporters         : 'verbose',
    chaiConfig        : {truncateThreshold: 0},
    expandSnapshotDiff: true,
    testTimeout       : 0,
    hookTimeout       : 0,
    teardownTimeout   : 0,
    slowTestThreshold : 5000,

    coverage: {
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
  },
})
