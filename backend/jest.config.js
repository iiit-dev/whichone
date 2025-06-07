export default {
  // Use node environment for tests
  testEnvironment: 'node',
  
  // Transform ES modules
  preset: null,
  
  // Module name mapping for ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Transform configuration
  transform: {},
  
  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/database/migrations/**',
    '!src/database/seeders/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // Verbose output
  verbose: true
}; 