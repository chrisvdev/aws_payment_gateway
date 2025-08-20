type Env = {
  AWS_ACCESS_KEY_ID: string;
  AWS_DEFAULT_REGION: string;
  AWS_EXECUTION_ENV: string;
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE: string;
  AWS_LAMBDA_FUNCTION_NAME: string;
  AWS_LAMBDA_FUNCTION_VERSION: string;
  AWS_LAMBDA_INITIALIZATION_TYPE: string;
  AWS_LAMBDA_LOG_GROUP_NAME: string;
  AWS_LAMBDA_LOG_STREAM_NAME: string;
  AWS_LAMBDA_RUNTIME_API: string;
  AWS_REGION: string;
  AWS_SDK_UA_APP_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SESSION_TOKEN: string;
  AWS_XRAY_CONTEXT_MISSING: string;
  AWS_XRAY_DAEMON_ADDRESS: string;
  LAMBDA_RUNTIME_DIR: string;
  LAMBDA_TASK_ROOT: string;
  LANG: string;
  LD_LIBRARY_PATH: string;
  NODE_PATH: string;
  PATH: string;
  POWERTOOLS_LOGGER_SAMPLE_RATE: string;
  POWERTOOLS_LOG_LEVEL: string;
  POWERTOOLS_METRICS_DISABLED: string;
  POWERTOOLS_METRICS_FUNCTION_NAME: string;
  POWERTOOLS_METRICS_NAMESPACE: string;
  POWERTOOLS_SERVICE_NAME: string;
  POWERTOOLS_TRACER_CAPTURE_ERROR: string;
  POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: string;
  POWERTOOLS_TRACER_CAPTURE_RESPONSE: string;
  POWERTOOLS_TRACE_ENABLED: string;
  PWD: string;
  SHLVL: string;
  TZ: string;
  _AWS_XRAY_DAEMON_ADDRESS: string;
  _AWS_XRAY_DAEMON_PORT: string;
  _HANDLER: string;
  _X_AMZN_TRACE_ID: string;
}

export default function getEnvironmentVariable(varName: keyof Env): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Environment variable ${varName} is not set`);
  }
  return value;
}