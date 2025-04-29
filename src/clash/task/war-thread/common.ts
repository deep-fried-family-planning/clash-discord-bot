import  {Server, ServerClan} from '#src/database/arch/codec.ts';
import {ThreadId} from '#src/internal/discord-old/dynamo/schema/common.ts';
import {getTaskWars} from '#src/internal/graph/fetch-war-entities.ts';
import {DT, type E, g, pipe, S} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import type {ClanWar} from 'clashofclans.js';
import type {Channel} from 'dfx/types';
import type {DurationInput} from 'effect/Duration';

export const TEMP_ROLES = {
  warmanager : '1269057897577578577',
  staff      : '1266214350339969127',
  colead     : '1208867535131381840',
  coleadtrial: '1269059230955077674',
  donator    : '1254791225022615623',
};

export const WarThreadData = S.Struct({
  server  : Server.Schema,
  clan    : ServerClan.Schema,
  clanName: S.String,
  opponent: S.Struct({
    name: S.String,
    tag : S.String,
  }),
  thread: ThreadId,
  links : S.Record({
    key  : S.String,
    value: S.String,
  }),
});

export type TaskEffect = E.Effect<void, any, any>;
export type TaskSchema = S.Schema<{name: str}, any, any>;

export const makeTask = <
  Eval extends TaskEffect,
>(
  name: string,
  evaluator: (data: typeof WarThreadData.Type, war: EAR<typeof getTaskWars>) => Eval,
) => {
  const schema = S.Struct({
    name: S.Literal(name),
    data: WarThreadData,
  });

  const encode = S.encodeUnknown(schema);
  const decode = S.decodeUnknown(schema);

  return {
    predicate: name,

    send: (
      fromTime: Date,
      withDuration: DurationInput,
      server: Server,
      clan: ServerClan,
      war: ClanWar,
      thread: Channel,
      links: Record<str, str>,
    ) => g(function* () {
      const encoded = yield* encode({
        name: name,
        data: {
          server,
          clan,
          clanName: war.clan.name,
          opponent: {
            name: war.opponent.name,
            tag : war.opponent.tag,
          },
          thread: thread.id,
          links,
        },
      });

      const maybeTime = pipe(
        fromTime,
        DT.unsafeMake,
        DT.addDuration(withDuration),
      );

      const resolvedTime = (yield* DT.isFuture(maybeTime))
        ? maybeTime
        : pipe(
          new Date(Date.now()),
          DT.unsafeMake,
          DT.addDuration('1 minute'),
        );

      const time = pipe(
        resolvedTime,
        DT.formatIso,
        (iso) => iso.replace(/\..+Z/, ''),
      );

      yield* Scheduler.createSchedule({
        GroupName: `${encoded.data.clan.pk}-${encoded.data.clan.sk.replace('#', '')}`,
        Name     : `${encoded.name}-${encoded.data.opponent.tag.replace('#', '')}`,

        ScheduleExpression        : `at(${time})`,
        FlexibleTimeWindow        : {Mode: 'OFF'},
        ScheduleExpressionTimezone: 'Etc/Zulu',

        Target: {
          Arn    : process.env.SQS_ARN_SCHEDULED_TASK,
          RoleArn: process.env.LAMBDA_ROLE_ARN,
          Input  : JSON.stringify(encoded),
        },

        ActionAfterCompletion: 'DELETE',
      });
    }),

    evaluator: (task: unknown) => g(function* () {
      const decoded = yield* decode(task);

      const taskWars = yield* getTaskWars(decoded.data);

      return yield* evaluator(decoded.data, taskWars);
    }),
  };
};
