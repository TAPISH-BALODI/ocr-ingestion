module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts','js'],
  roots: ['<rootDir>/src','<rootDir>/test'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  maxWorkers: 1,
};
