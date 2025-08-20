import { Construct } from "constructs";

export type Config = {
  app: {
    name: string;
  }
}

export function getConfig(scope: Construct): Config {
  const config: Config = {
    app: {
      name: scope.node.tryGetContext("app")?.name,
    },
  };

  if (!config.app.name) {
    throw new Error("App name is not defined in the context.");
  }

  return config;
}