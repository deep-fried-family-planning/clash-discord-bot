import {Codec} from '#src/disreact/codec/Codec.ts';
import {Doken} from '#src/disreact/codec/doken.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import type {FC} from '#src/disreact/model/meta/fc.ts';
import {Progress, Relay} from '#src/disreact/model/Relay.ts';
import {DokenManager} from '#src/disreact/runtime/DokenManager.ts';
import {handleClose, handleSame, handleSource, handleUpdate} from '#src/disreact/runtime/utils.ts';
import {DisReactDOM} from '#src/disreact/utils/DisReactDOM.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {DateTime, Fiber} from 'effect';
import console from 'node:console';
import {Model} from 'src/disreact/model/Model.ts';
import {Dokens} from './dokens.ts';

export * as Methods from '#src/disreact/runtime/methods.ts';
export type Methods = never;

export const synthesize = (id: Elem | FC | string, props?: any) =>
  pipe(
    Model.create(id, props),
    E.flatMap((root) =>
      root
        ? Codec.encodeFinal(Doken.synthetic(), root)
        : E.succeed(null),
    ),
  );

export const decodeRequestEvent = (input: any) => E.map(Codec, (codec) => {
  const request = codec.decodeRequest(input);
  const event = codec.decodeEvent(request);

  return [request, event] as const;
});

export const respond = (body: any) => E.gen(function* () {
  const [req, event] = yield* decodeRequestEvent(body);
  const relay = yield* Relay;
  const dom = yield* DisReactDOM;

  yield* DokenManager.init(req);

  // const ds = yield* Dokens.make(req.fresh);

  const model = yield* E.fork(Model.invoke(req.hydrant!, event));

  yield* E.fork(DokenManager.listen(relay.mailbox));

  // let isSame = false;
  // yield* E.fork(
  //   E.iterate(Progress.Start(), {
  //     while: (r) =>
  //       r._tag !== 'Done',
  //
  //     body: () =>
  //       E.tap(relay.awaitStatus, (r) => {
  //         if (r._tag === 'Close') {
  //           return handleClose(ds);
  //         }
  //
  //         if (r._tag === 'Same') {
  //           isSame = true;
  //           return handleSame(ds);
  //         }
  //
  //         if (r._tag === 'Part') {
  //           if (isSame) {
  //             return E.void;
  //           }
  //
  //           if (r.type === 'modal') {
  //             return Dokens.finalizeModal(ds);
  //           }
  //
  //           if (r.isEphemeral === req.isEphemeral) {
  //             return handleUpdate(ds);
  //           }
  //
  //           return handleSource(ds);
  //         }
  //       }),
  //   }),
  // );

  const codec = yield* Codec;
  const root = yield* Fiber.join(model);

  if (!root) {
    return null;
  }

  const modal = yield* DokenManager.current;

  console.log('modal', modal);

  if (Doken.isModal(modal)) {
    const payload = yield* codec.encodeFinal(Doken.synthetic(), root);
    yield* dom.createModal(modal, payload);
    return payload;
  }

  const isDeferPhase = yield* DateTime.isPast(req.fresh.ttl);

  if (isDeferPhase) {
    const doken = yield* DokenManager.final;

    console.log('doken', doken);

    if (Doken.isNever(doken)) {
      return E.fail('Never token found.');
    }

    const payload = yield* codec.encodeFinal(doken, root);

    yield* dom.deferEdit(doken, payload);
    return payload;
  }

  const doken = yield* DokenManager.current;

  if (doken._tag === Doken.ACTIVE) {
    const payload = yield* codec.encodeFinal(doken, root);

    yield* dom.deferEdit(doken, payload);
    return payload;
  }

  const payload = yield* codec.encodeFinal(doken, root);

  if (Doken.isModal(doken)) {
    yield* dom.createModal(doken, payload);
    return payload;
  }

  if (Doken.isSource(doken)) {
    yield* dom.createSource(doken, payload);
    return payload;
  }

  if (Doken.isUpdate(doken)) {
    yield* dom.createUpdate(doken, payload);
    return payload;
  }
});
