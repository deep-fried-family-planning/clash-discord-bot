import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name   : 'integration',
          include: ['test/integration/**/*.spec.ts'],
        },
      },
      {
        test: {
          name   : 'spec',
          include: ['test/spec/**/*.spec.ts'],
        },
      },
    ],
  },
});
