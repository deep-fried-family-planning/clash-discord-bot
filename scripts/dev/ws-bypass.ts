import {E, L, O, pipe} from '#src/internal/pure/effect.ts';
import {handler as ix_slash} from '#src/lambdas/ix_commands.ts';
import {handler as ix_menu} from '#src/lambdas/ix_components.ts';
import {handler as task} from '#src/lambdas/task.ts';
import type {CreateScheduleCommandInput} from '@aws-sdk/client-scheduler';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {APIGatewayProxyEventBase, SQSEvent} from 'aws-lambda';
import {PlatformAlgorithm, verify} from 'discord-verify';
import {Duration} from 'effect';
import {subtle} from 'node:crypto';
import type {WsCtx} from 'scripts/dev/dev_ws.ts';

export const WS_BYPASS_KEY = {
  pk: 'dev_ws',
  sk: 'now',
};

const names = {
  ix_slash: process.env.LAMBDA_ARN_IX_SLASH,
  ix_menu : process.env.LAMBDA_ARN_DISCORD_MENU,
  poll    : process.env.LAMBDA_ARN_IX_SLASH,
  task    : process.env.LAMBDA_ARN_IX_SLASH,
};

export class PassService extends E.Service<PassService>()('deepfryer/PassService', {
  effect: Lambda.use((lambda) =>
    ({
      routeTo: (name: keyof typeof names, data: any) =>
        lambda.invoke({
          FunctionName  : names[name],
          InvocationType: 'Event',
          Payload       : JSON.stringify(data),
        }),

      shouldRoute: (name: keyof typeof names, data?: any) =>
        E.succeed(false),
    }),
  ),
  accessors: true,
}) {}

class BypassService extends E.Service<PassService>()(PassService.key, {
  effect: E.gen(function* () {
    const dynamo = yield* DynamoDBDocument;
    const apigw = yield* ApiGatewayManagementApi;
    const lambda = yield* Lambda;

    const getBypass = yield* pipe(
      dynamo.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : WS_BYPASS_KEY,
      }),
      E.map((res) => O.fromNullable(res.Item?.context as WsCtx)),
      E.cachedWithTTL(Duration.seconds(10)),
    );

    return {
      routeTo: (name: keyof typeof names, data: any) => {
        if (process.env.LAMBDA_LOCAL === 'true') {
          return E.void;
        }
        return getBypass.pipe(
          E.andThen(
            O.match({
              onSome: (ws) =>
                apigw.postToConnection({
                  ConnectionId: ws.connectionId,
                  Data        : JSON.stringify({kind: name, data}),
                }),
              onNone: () =>
                lambda.invoke({
                  FunctionName  : names[name],
                  InvocationType: 'Event',
                  Payload       : JSON.stringify(data),
                }),
            }),
          ),
        );
      },

      shouldRoute: (name: keyof typeof names, data: any = {}) => {
        if (process.env.LAMBDA_LOCAL === 'true') {
          return E.void;
        }
        return getBypass.pipe(E.andThen(
          O.match({
            onSome: (ws) =>
              pipe(
                apigw.postToConnection({
                  ConnectionId: ws.connectionId,
                  Data        : JSON.stringify({kind: name, data}),
                }),
                E.as(true),
              ),
            onNone: () =>
              E.succeed(false),
          }),
        ));
      },
    };
  }),
  accessors: true,
}) {}

class FullstackPassService extends E.Service<PassService>()(PassService.key, {
  succeed: {
    routeTo: (name: keyof typeof names, data: any) => {
      if (process.env.LAMBDA_LOCAL === 'true') {
        return E.void;
      }
      return E.promise(
        async () => await ({
          ix_menu,
          ix_slash,
        } as any)[name](data) as any,
      );
    },

    shouldRoute: () => {
      return E.succeed(true);
    },
  },
  accessors: true,
}) {}

export const PassServiceLayer = process.env.LAMBDA_ENV === 'prod'
  ? PassService.Default.pipe(L.provide(Lambda.defaultLayer))
  : process.env.LAMBDA_ENV === 'fullstack' ? FullstackPassService.Default
    : BypassService.Default.pipe(
      L.provide(
        L.mergeAll(
          Lambda.defaultLayer,
          ApiGatewayManagementApi.layer({
            endpoint: process.env.APIGW_DEV_WS,
          }),
          DynamoDBDocument.defaultLayer,
        ),
      ),
    );

export class VerificationService extends E.Service<VerificationService>()('deepfryer/VerificationService', {
  succeed: {
    verify: (req: APIGatewayProxyEventBase<any>) =>
      E.promise(() =>
        verify(
          req.body,
          req.headers['x-signature-ed25519'],
          req.headers['x-signature-timestamp'],
          process.env.DFFP_DISCORD_PUBLIC_KEY,
          subtle,
          PlatformAlgorithm.NewNode,
        ),
      ),
  },
  accessors: true,
}) {}

class FullstackVerificationService extends E.Service<VerificationService>()(VerificationService.key, {
  succeed: {
    verify: () => E.succeed(true),
  },
}) {}

export const VerificationServiceLayer = process.env.LAMBDA_ENV === 'fullstack'
  ? FullstackVerificationService.Default
  : VerificationService.Default;

export class TaskService extends E.Service<TaskService>()('deepfryer/TaskService', {
  effect: E.gen(function* () {
    const scheduler = yield* SchedulerService;

    return {
      schedule: (data: CreateScheduleCommandInput) =>
        scheduler.createSchedule(data),
    };
  }),
  accessors: true,
}) {}

class FullstackTaskService extends E.Service<TaskService>()('deepfryer/FullstackTaskService', {
  succeed: {
    schedule: (data: CreateScheduleCommandInput) =>
      E.promise(
        async () => await task(
          {
            Records: [{body: JSON.stringify(data.Target!.Input!)}],
          } as SQSEvent,
          {} as any,
        ),
      ),
  },
  accessors: true,
}) {}

export const TaskServiceLayer = process.env.LAMBDA_ENV === 'fullstack'
  ? TaskService.Default.pipe(L.provide(SchedulerService.defaultLayer))
  : FullstackTaskService.Default;
