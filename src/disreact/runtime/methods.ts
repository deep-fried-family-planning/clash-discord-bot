import {Codec} from '#src/disreact/codec/Codec.ts';
import {Doken} from '#src/disreact/codec/doken.ts';
import type {RxTx} from '#src/disreact/codec/rxtx.ts';
import type {FC} from '#src/disreact/model/comp/fc.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {Relay, RelayStatus} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {handleClose, handleSame, handleSource, handleUpdate} from '#src/disreact/runtime/utils.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Fiber} from 'effect';
import {Model} from '../model/model';
import {Dokens} from './dokens.ts';

export * as Methods from '#src/disreact/runtime/methods.ts';
export type Methods = never;

/**
 *
 */
export const synthesize = (id: Elem | FC | string, props?: any) => E.flatMap(Codec, (codec) =>
  Model.makeEntrypoint(id, props).pipe(
    E.map((root) => {
      return codec.encodeResponse(root, Doken.synthetic());
    }),
  ),
);

export const decodeRequestEvent = (input: any) => E.map(Codec, (codec) => {
  const request = codec.decodeRequest(input);
  const event = codec.decodeEvent(request);

  return [request, event] as const;
});

const condition = (r: RelayStatus) => r._tag !== 'Complete';

const iterateRelay = (ds: Dokens, req: RxTx.ParamsRequest) => {
  let isSame = false;

  const loopBody = (r: RelayStatus) => {
    if (r._tag === 'Close') {
      return handleClose(ds);
    }

    if (r._tag === 'Same') {
      isSame = true;
      return handleSame(ds);
    }

    if (r._tag === 'Partial') {
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
    return E.void;
  };

  return E.iterate(RelayStatus.Start(), {
    while: condition,
    body : () => pipe(
      Relay,
      E.flatMap((relay) => relay.awaitStatus),
      E.tap((r) => loopBody(r)),
    ),
  });
};

export const respondPiped = (body: any) =>
  pipe(
    decodeRequestEvent(body),
    E.flatMap(([req, event]) =>
      E.all({
        ds   : Dokens.make(req.fresh).pipe(E.tap((ds) => E.fork(iterateRelay(ds, req)))),
        req  : E.succeed(req),
        model: E.fork(Model.hydrateInvoke(req.hydrant!, event)),
      }),
    ),
    E.flatMap((s) =>
      Dokens.wait(s.ds).pipe(
        E.flatMap(() =>
          E.all({
            root : Fiber.join(s.model),
            doken: Dokens.isDeferPhase(s.ds).pipe(
              E.if({
                onTrue : () => Dokens.final(s.ds),
                onFalse: () => Dokens.current(s.ds),
              }),
            ),
            codec: Codec,
            dom  : DisReactDOM,
          }),
        ),
      ),
    ),
    E.flatMap(({root, doken, codec, dom}) => {
      if (!root) {
        return E.succeed(null);
      }

      if (Doken.isNever(doken)) {
        return E.die('Absurd: Never Doken');
      }

      if (Doken.isActive(doken)) {
        return pipe(
          codec.encodeResponseWithCache(root, doken),
          E.tap((payload) => dom.deferEdit(doken, payload)),
        );
      }

      const payload = codec.encodeResponse(root, doken);

      if (Doken.isModal(doken)) {
        return dom.createModal(doken, payload).pipe(E.as(payload));
      }

      if (Doken.isSource(doken)) {
        return dom.createSource(doken, payload).pipe(E.as(payload));
      }

      if (Doken.isUpdate(doken)) {
        return dom.createUpdate(doken, payload).pipe(E.as(payload));
      }

      return E.die('Absurd: No DOM Update');
    }),
  );

/**
 *
 */
export const respond = (body: any) => E.gen(function* () {
  const [req, event] = yield* decodeRequestEvent(body);

  const relay = yield* Relay;
  const dom = yield* DisReactDOM;

  const ds = yield* Dokens.make(req.fresh);

  const model = yield* E.fork(Model.hydrateInvoke(req.hydrant!, event));

  let isSame = false;

  yield* E.iterate(RelayStatus.Start(), {
    while: (r) =>
      r._tag !== 'Complete',

    body: () =>
      E.tap(relay.awaitStatus, (r) => {
        if (r._tag === 'Close') {
          return handleClose(ds);
        }

        if (r._tag === 'Same') {
          isSame = true;
          return handleSame(ds);
        }

        if (r._tag === 'Partial') {
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
  });

  const codec = yield* Codec;
  const root = yield* Fiber.join(model);

  if (!root) {
    return null;
  }

  yield* Dokens.wait(ds);
  const isDeferPhase = yield* Dokens.isDeferPhase(ds);

  if (isDeferPhase) {
    const doken = yield* Dokens.final(ds);

    if (Doken.isNever(doken)) {
      return E.die('Never token found.');
    }

    const payload = yield* codec.encodeResponseWithCache(root, doken);

    yield* dom.deferEdit(doken, payload);
    return payload;
  }

  const doken = yield* Dokens.current(ds);

  if (doken._tag === Doken.ACTIVE) {
    const payload = yield* codec.encodeResponseWithCache(root, doken);

    yield* dom.deferEdit(doken, payload);
    return payload;
  }

  const payload = codec.encodeResponse(root, doken);

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
