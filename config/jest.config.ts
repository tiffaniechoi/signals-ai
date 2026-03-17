import type { Config } from "jest";
import nextJest from "next/jest.js";

// nextJest reads Next.js config and .env files from the project root.
const createJestConfig = nextJest({ dir: "../" });

const config: Config = {
  // Explicitly point rootDir back to the project root so <rootDir> tokens
  // in the paths below resolve correctly when running from config/.
  rootDir: "../",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/config/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
