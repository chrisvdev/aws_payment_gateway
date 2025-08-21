process.loadEnvFile("./.env");

export type EnvironmentVariables = {
  CLOUDFLARE_SITE_KEY: string;
  CLOUDFLARE_SECRET_KEY: string;
};

const environment : EnvironmentVariables = {
  CLOUDFLARE_SITE_KEY: "",
  CLOUDFLARE_SECRET_KEY: ""
};

for (const key in environment) {
  const envKey = key as keyof EnvironmentVariables;
  if (typeof process.env[envKey] === "string" && process.env[envKey]!.length > 0) {
    environment[envKey] = process.env[envKey] as string;
  } else throw new Error(`Missing environment variable: ${envKey}`);
}

export default environment;
