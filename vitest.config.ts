import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';



export default defineConfig({
  plugins: [tsconfigPaths()],
  test   : {
    reporters         : 'verbose',
    watch             : false,
    globals           : true,
    expandSnapshotDiff: true,
    chaiConfig        : {
      includeStack     : true,
      truncateThreshold: 0,
      showDiff         : true,
    },
    coverage: {
      provider       : 'istanbul',
      reporter       : ['lcov'],
      all            : true,
      skipFull       : true,
      reportOnFailure: true,
      thresholds     : {
        100    : true,
        perFile: true,
      },
    },
    logHeapUsage   : true,
    testTimeout    : 0,
    hookTimeout    : 0,
    teardownTimeout: 0,
  },
});
