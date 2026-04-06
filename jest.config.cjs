const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js", "<rootDir>/tests/**/*.test.jsx"],
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,jsx}"],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text-summary", "lcov", "json-summary"],
  coverageThreshold: {
    global: {
      statements: 70,
      lines: 70,
      functions: 70,
      branches: 70,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
