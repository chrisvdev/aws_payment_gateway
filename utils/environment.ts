process.loadEnvFile("./.env");

const environment : Record<string, string> = {
  CLOUDFLARE_SITE_KEY: "",
  CLOUDFLARE_SECRET_KET: ""
};

Object.entries(environment).forEach(([key, value]) => {
  if (process.env[key]) {
    environment[key] = process.env[key] as string;
  } else throw new Error(`Missing environment variable: ${key}`);
});

export default environment;
