import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { Metrics } from "@aws-lambda-powertools/metrics";
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from "@aws-lambda-powertools/tracer";
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { parser } from '@aws-lambda-powertools/parser/middleware';
import { ZodType } from 'zod';
import middy, { type MiddyfiedHandler } from "@middy/core";
import httpJsonBodyParser from '@middy/http-json-body-parser'
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
  Context,
  Callback
} from 'aws-lambda';
import type { RestAPI } from '../../lib/constructs/api_gateway.ts';

export type APIGatewayProxyEventHeaders = {
  Accept: string;
  "Accept-Encoding": string;
  "Cache-Control": string;
  "Content-Type": string;
  Host: string;
  "User-Agent": string;
  "X-Amzn-Trace-Id": string;
  "X-Forwarded-For": string;
  "X-Forwarded-Port": string;
  "X-Forwarded-Proto": string;
};

export type APIGatewayProxyEventDefinition<T> = Omit<
  APIGatewayProxyEvent,
  'body' | 'headers'
> & {
  body: T;
  headers: APIGatewayProxyEventHeaders;
}
export type APIGatewayProxyResultDefinition<T> =
  Partial<
    Omit<
      APIGatewayProxyResult,
      'body'
    >
    & {
      body: T;
    }
  >

export type APIGatewayProxyEventHandler<T, R> = Handler<
  APIGatewayProxyEventDefinition<T>,
  APIGatewayProxyResultDefinition<R>
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

  public HTTPEventHandler<T, R>(
    lambdaFunction: APIGatewayProxyEventHandler<T, R>,
    schema?: ZodType<T>
  ): MiddyfiedHTTPEventHandler {
    const handler: BaseHTTPLambdaHandler = async (event, context, callback) => {
      this._logger.info('event:', JSON.stringify(event));
      const response = await lambdaFunction(
        event as APIGatewayProxyEventDefinition<T>,
        context,
        callback as Callback<APIGatewayProxyResultDefinition<R>>
      );
      if (response && (response?.body || response?.statusCode)) {
        const {
          multiValueHeaders,
          isBase64Encoded,
          headers,
          statusCode,
          body
        } = response;
        return {
          multiValueHeaders,
          isBase64Encoded,
          headers: { ...headers, "Content-Type": "application/json" },
          statusCode: statusCode || 200,
          body: body ?
            (typeof body === 'string' ? body : JSON.stringify(body)) : '',
        }
      }
      logger.error(
        'Invalid response from lambda function',
        JSON.stringify(response)
      );
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      }
    }

    return schema ? this.handler(handler)
      .use(parser({
        schema,
      }))
      .use(httpErrorHandler()) :
      this.handler(handler)
        .use(httpJsonBodyParser())
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
    type Router = Record<
      string,
      Record<
        string,
        MiddyfiedHTTPEventHandler | undefined
      >
    >
    const lambdaRoutes = {} as unknown as LambdaRouterType<T>;
    for (const [path, method] of Object.entries(routes)) {
      for (const type of Object.keys(method)) {
        if (!lambdaRoutes[path]) {
          (lambdaRoutes as Router)[path] = {};
        }
        (lambdaRoutes as Router)[path][type] = undefined;
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