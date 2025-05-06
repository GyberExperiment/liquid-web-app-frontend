const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'src/__tests__/e2e/**/*.test.js',
    supportFile: 'src/__tests__/e2e/support/index.js',
  },
  video: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  chromeWebSecurity: false,
  retries: {
    runMode: 1,
    openMode: 0,
  },
});
