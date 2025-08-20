import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { Metrics } from "@aws-lambda-powertools/metrics";
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from "@aws-lambda-powertools/tracer";
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { parser } from '@aws-lambda-powertools/parser/middleware';
import { ZodType } from 'zod';
import middy, { type MiddyfiedHandler } from "@middy/core";
import httpErrorHandler from '@middy/http-error-handler'
import httpRouterHandler, { Method, Route } from '@middy/http-router'
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
  SQSRecord,
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerHandler,
  ScheduledEvent,
  Context
} from 'aws-lambda';
import type { RestAPI } from '../../lib/constructs/api_gateway';

export type APIGatewayProxyEventDefinition<T> = Omit<
  APIGatewayProxyEvent,
  'body'
> & {
  body?: T;
}
export type APIGatewayProxyEventHandler<T> = Handler<
  APIGatewayProxyEventDefinition<T>,
  APIGatewayProxyResult
>;
export type BaseHTTPLambdaHandler = Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>;
export type SQSRecordDefinition<T> = Omit<SQSRecord, 'body'> & {
  body?: T;
}
export type SQSEvent<T> = {
  Records: SQSRecordDefinition<T>[];
}
export type SQSEventHandler<T> = Handler<SQSEvent<T>, void>;
export type ScheduledEventHandler = Handler<ScheduledEvent, void>;
export type MiddyfiedHTTPEventHandler = MiddyfiedHandler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Error,
  Context,
  {}
>
export type MiddyfiedAPIGatewayAutorizerEventHandler = MiddyfiedHandler<
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
  Error,
  Context,
  {}
>
export type MiddyfiedSQSEventHandler<T> = MiddyfiedHandler<
  SQSEvent<T>,
  void,
  Error,
  Context,
  {}
>
export type MiddyfiedScheduledEventHandler = MiddyfiedHandler<
  ScheduledEvent,
  void,
  Error,
  Context,
  {}
>

export type LambdaRouterType<T extends RestAPI> = {
  [K in keyof T]: {
    [M in keyof T[K]]: MiddyfiedHTTPEventHandler | undefined;
  }
};

class Lambda {
  public _logger: Logger;
  public _metrics: Metrics;
  public _tracer: Tracer;
  constructor() {
    this._logger = new Logger();
    this._metrics = new Metrics();
    this._tracer = new Tracer();
  }
  public handler(lambdaFunction: Handler): MiddyfiedHandler {
    return middy(lambdaFunction)
      .use(injectLambdaContext(this._logger))
      .use(logMetrics(this._metrics))
      .use(captureLambdaHandler(this._tracer))
  }
  public HTTPEventHandler<T>(
    lambdaFunction: APIGatewayProxyEventHandler<T>,
    schema?: ZodType<T>
  ): MiddyfiedHTTPEventHandler {
    return schema ? this.handler(lambdaFunction)
      .use(parser({
        schema,
      }))
      .use(httpErrorHandler()) :
      this.handler(lambdaFunction)
        .use(httpErrorHandler());
  }
  public authorizerHandler(
    lambdaFunction: APIGatewayRequestAuthorizerHandler
  ): MiddyfiedAPIGatewayAutorizerEventHandler {
    return this.handler(lambdaFunction)
  }
  public sqsHandler<T>(
    lambdaFunction: SQSEventHandler<T>
  ): MiddyfiedSQSEventHandler<T> {
    return this.handler(lambdaFunction);
  }
  public scheduledHandler(
    lambdaFunction: ScheduledEventHandler
  ): MiddyfiedScheduledEventHandler {
    return this.handler(lambdaFunction);
  }
  public getRouter<T extends RestAPI>(routes: T): LambdaRouterType<T> {
    const lambdaRoutes = {} as unknown as LambdaRouterType<T>;
    for (const [path, method] of Object.entries(routes)) {
      for (const type of Object.keys(method)) {
        if (!lambdaRoutes[path]) {
          // @ts-expect-error
          lambdaRoutes[path] = {};
        }
        // @ts-expect-error
        lambdaRoutes[path][type] = undefined;
      }
    }
    return lambdaRoutes;
  }
  public RouterHandler<T extends RestAPI>(lambdaRouter: LambdaRouterType<T>): MiddyfiedHTTPEventHandler {
    const routes: Route<APIGatewayProxyEvent, APIGatewayProxyResult>[] = [];
    for (const [path, methods] of Object.entries(lambdaRouter)) {
      for (const [method, handler] of Object.entries(methods)) {
        if (handler) {
          routes.push({
            path,
            method: method.toUpperCase() as Method,
            handler: handler as MiddyfiedHTTPEventHandler
          });
        }
      }
    }
    return this.handler(httpRouterHandler(routes));
  }
}

export const lambda = new Lambda();
export const logger = lambda._logger;
export const metrics = lambda._metrics;
export const tracer = lambda._tracer;