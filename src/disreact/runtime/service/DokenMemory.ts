// import {DokenMemoryError} from '#src/disreact/codec/error.ts';
// import {C, E, L} from '#src/internal/pure/effect.ts';
// import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
// import {type Cause, Duration, Exit, pipe} from 'effect';
// import * as Doken from '#src/disreact/codec/rest/doken.ts';
//
//
//
// type DokenMemoryKind =
//   | 'local'
//   | 'dynamo'
//   | 'custom';
//
// type DokenError =
//   | DokenMemoryError
//   | Cause.UnknownException;
//
// export class DokenMemory extends E.Tag('DisReact.DokenMemory')<
//   DokenMemory,
//   {
//     kind   : DokenMemoryKind;
//     load   : (id: string) => E.Effect<Doken.Type | null, DokenError>;
//     memLoad: (id: string) => E.Effect<Doken.Type | null, DokenError>;
//     free   : (id: string) => E.Effect<void, DokenError>;
//     memFree: (id: string) => E.Effect<void, DokenError>;
//     save   : (d: Doken.Type) => E.Effect<void, DokenError>;
//     memSave: (d: Doken.Type) => E.Effect<void, DokenError>;
//   }
// >() {
//   static readonly localLayer = (config: LocalDokenMemoryConfig) =>
//     pipe(
//       LocalDokenMemory(config),
//     );
//
//   static readonly dynamoLayer = (TableName: string) =>
//     pipe(
//       DynamoDokenMemory(TableName),
//       L.provide(DynamoDBDocument.defaultLayer),
//     );
// }
//
// export type LocalDokenMemoryConfig = {
//   capacity?  : number;
//   timeToLive?: Duration.DurationInput;
// };
//
// export const LocalDokenMemory = (config: LocalDokenMemoryConfig) => L.effect(DokenMemory, E.gen(function* () {
//   const cache = yield* C.make({
//     capacity  : config.capacity ?? 1000,
//     timeToLive: config.timeToLive ?? '12 minutes',
//     lookup    : () => E.succeed(null as null | Doken.Type),
//   });
//
//   return {
//     kind   : 'local' as const,
//     save   : (doken) => cache.set(doken.id, doken),
//     load   : (id) => cache.get(id),
//     free   : (id) => cache.invalidate(id),
//     memSave: (doken) => cache.set(doken.id, doken),
//     memLoad: (id) => cache.get(id),
//     memFree: (id) => cache.invalidate(id),
//   };
// }));
//
// const DynamoDokenMemory = (TableName: string) => L.effect(DokenMemory, E.gen(function* () {
//   const dynamo = yield* DynamoDBDocument;
//
//   const cache = yield* C.makeWith({
//     lookup: (id: string) =>
//       pipe(
//         dynamo.get({
//           TableName,
//           Key: {
//             pk: `t-${id}`,
//             sk: `t-${id}`,
//           },
//         }),
//         E.flatMap((resp) => resp.Item
//           ? Doken.makeFromParams(resp.Item as any)
//           : E.succeed(null),
//         ),
//       ),
//     timeToLive: (exit) =>
//       Exit.match(
//         exit,
//         {
//           onFailure: () => Duration.millis(0),
//           onSuccess: (d) => !d
//             ? Duration.millis(0)
//             : Duration.minutes(5),
//         },
//       ),
//     capacity: 1000,
//   });
//
//   return {
//     kind: 'dynamo' as const,
//     load: (id) =>
//       pipe(
//         cache.get(id),
//         E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
//       ),
//     memLoad: (id) =>
//       pipe(
//         cache.contains(id),
//         E.if({
//           onTrue : () => cache.get(id),
//           onFalse: () => E.succeed(null),
//         }),
//         E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
//       ),
//     free: (id) =>
//       pipe(
//         cache.invalidate(id),
//         E.tap(() => dynamo.delete({
//           TableName,
//           Key: {
//             pk: `t-${id}`,
//             sk: `t-${id}`,
//           },
//         })),
//         E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
//       ),
//     memFree: (id) => cache.invalidate(id),
//     save   : (d) =>
//       pipe(
//         cache.set(d.id, d),
//         E.tap(() => dynamo.put({
//           TableName,
//           Item: {
//             pk: `t-${d.id}`,
//             sk: `t-${d.id}`,
//             ...d,
//           },
//         })),
//         E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
//       ),
//     memSave: (d) => cache.set(d.id, d),
//   };
// }));
