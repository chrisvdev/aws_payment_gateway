import axios from "axios";
import { logger } from "./lambda.ts";

export default function createService(url: string, serviceName: string) {
  const service = axios.create({
    baseURL: url,
  });

  service.interceptors.request.use(
    (config) => {
      logger.debug(`Request to ${serviceName}`, JSON.stringify(config));
      return config;
    },
    (error) => {
      logger.error(`Error in ${serviceName}`, error);
      throw error;
    }
  );

  service.interceptors.response.use(
    (response) => {
      logger.debug(`Response from ${serviceName}`, JSON.stringify(response));
      return response;
    },
    (error) => {
      logger.error(`Error in ${serviceName}`, error);
      throw error;
    }
  );
  return service;
}