type Environment = "PUBLIC_CLOUDFLARE_SITE_KEY";

const environment: Record<Environment, string> = {
  PUBLIC_CLOUDFLARE_SITE_KEY: "",
};

Object.entries(environment).forEach(([key, value]) => {
  if (import.meta.env[key]) {
    environment[key as Environment] = import.meta.env[key as Environment] as string;
  } else throw new Error(`Missing environment variable: ${key}`);
});

export default environment;
