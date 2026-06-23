import dotenv from "dotenv";

// Load variables from the .env file into process.env (must run before we read them)
dotenv.config();

/**
 * Central, type-safe access to environment variables.
 *
 * Reading process.env in one place (instead of scattered across the app) means:
 *  - we get autocomplete + types everywhere we use `env`
 *  - we fail fast with a clear message if something required is missing
 */
function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: required("CLIENT_URL", "http://localhost:3000"),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: required("JWT_SECRET"),
  // How long a login stays valid (7 days)
  jwtExpiresIn: "7d",
  isProduction: process.env.NODE_ENV === "production",
} as const;
