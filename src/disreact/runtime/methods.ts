import {Codec} from '#src/disreact/codec/Codec.ts';
import {Doken} from '#src/disreact/codec/doken.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import type {FC} from '#src/disreact/model/entity/fc.ts';
import {Progress, Relay} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/utils/DisReactDOM.ts';
import {handleClose, handleSame, handleSource, handleUpdate} from '#src/disreact/runtime/utils.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Fiber} from 'effect';
import {Model} from 'src/disreact/model/Model.ts';
import {Lifecycle} from 'src/disreact/model/lifecycle.ts';
import {Dokens} from './dokens.ts';

export * as Methods from '#src/disreact/runtime/methods.ts';
export type Methods = never;

export const synthesize = (id: Elem | FC | string, props?: any) =>
  pipe(
    Model.makeEntrypoint(id, props),
    E.flatMap(([root, encoding]) =>
      Codec.encodeFinal(
        root,
        Doken.synthetic(),
        encoding,
      ),
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

  const ds = yield* Dokens.make(req.fresh);

  const model = yield* E.fork(Model.hydrateInvoke(req.hydrant!, event));

  let isSame = false;

  yield* E.fork(
    E.iterate(Progress.Start(), {
      while: (r) =>
        r._tag !== 'Done',

      body: () =>
        E.tap(relay.awaitStatus, (r) => {
          if (r._tag === 'Close') {
            return handleClose(ds);
          }

          if (r._tag === 'Same') {
            isSame = true;
            return handleSame(ds);
          }

          if (r._tag === 'Part') {
            if (isSame) {
              return E.void;
            }

            if (r.type === 'modal') {
              return Dokens.finalizeModal(ds);
            }

            if (r.isEphemeral === req.isEphemeral) {
              return handleUpdate(ds);
            }

            return handleSource(ds);
          }
        }),
    }),
  );

  const codec = yield* Codec;
  const root = yield* Fiber.join(model);

  if (!root) {
    return null;
  }

  const final = yield* Lifecycle.encode(root);

  if (!final) {
    return null;
  }

  const modal = yield* Dokens.current(ds);

  if (Doken.isModal(modal)) {
    const payload = yield* codec.encodeFinal(root, Doken.synthetic(), final);
    yield* dom.createModal(modal, payload);
    return payload;
  }

  yield* Dokens.wait(ds);
  const isDeferPhase = yield* Dokens.isDeferPhase(ds);

  if (isDeferPhase) {
    const doken = yield* Dokens.final(ds);

    if (Doken.isNever(doken)) {
      return E.die('Never token found.');
    }

    const payload = yield* codec.encodeFinal(root, doken, final);

    yield* dom.deferEdit(doken, payload);
    return payload;
  }

  const doken = yield* Dokens.current(ds);

  if (doken._tag === Doken.ACTIVE) {
    const payload = yield* codec.encodeFinal(root, doken, final);

    yield* dom.deferEdit(doken, payload);
    return payload;
  }

  const payload = yield* codec.encodeFinal(root, doken, final);

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
