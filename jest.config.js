﻿module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts','js'],
  roots: ['<rootDir>/src','<rootDir>/test'],
};
