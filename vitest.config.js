import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60000,
    sequence: {
      concurrent: false,
    },
  },
});
