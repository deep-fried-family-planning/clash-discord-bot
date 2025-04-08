import {Codec} from '#src/disreact/codec/Codec.ts';
import {Doken} from '#src/disreact/codec/doken.ts';
import {RxTx} from '#src/disreact/codec/rxtx.ts';
import type {FC} from '#src/disreact/model/comp/fc.ts';
import {Fibril} from '#src/disreact/model/comp/fibril.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {Relay, RelayStatus} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {DateTime, Fiber} from 'effect';
import {Intrinsic} from '../codec/rest-elem/index.ts';
import {Model} from '../model/model';
import {Dokens} from './dokens.ts';

export * as Methods from '#src/disreact/runtime/methods.ts';
export type Methods = never;

/**
 *
 */
export const synthesize = (id: Elem.Task | FC | string, props?: any) => E.flatMap(Codec, (codec) =>
  Model.makeEntrypoint(id, props).pipe(
    E.map((root) => {
      return codec.encodeResponse(root, Doken.makeSyntheticSingle());
    }),
  ),
);

export const decodeRequestEvent = (input: any) => E.map(Codec, (codec) => {
  const request = codec.decodeRequest(input);
  const event = codec.decodeEvent(request);

  return [request, event] as const;
});

/**
 *
 */
export const respond = (body: any) => E.gen(function* () {
  const [req, event] = yield* decodeRequestEvent(body);

  const relay = yield* Relay;
  const dom = yield* DisReactDOM;

  const dokens = yield* Dokens.make(req.fresh);

  yield* E.fork(
    Dokens.resolveActive(dokens, req.serial),
  );

  const model = yield* E.fork(
    Model.hydrateInvoke(req.hydrant!, event),
  );

  yield* E.iterate(RelayStatus.Start(), {
    while: (r) => r._tag !== 'Complete',
    body : () => E.tap(relay.awaitStatus(), (r) => {
      if (r._tag === 'Close') {
        return Dokens.handleClose(dokens);
      }

      if (r._tag === 'Same') {
        return Dokens.awaitActive(dokens).pipe(E.flatMap((active) => {
          if (active) {
            return E.zipRight(
              dom.discard(dokens.fresh),
              E.zipRight(
                Dokens.setFinal(dokens, active),
                Dokens.currentActive(dokens, active),
              ),
            );
          }
          return E.zipRight(
            Dokens.engageDeferUpdate(dokens),
            Dokens.currentUpdate(dokens),
          );
        }));
      }

      if (r._tag === 'Partial') {
        if (r.type === 'modal') {
          return Dokens.currentModal(dokens);
        }
        if (r.isEphemeral === req.isEphemeral) {
          return Dokens.awaitActive(dokens).pipe(E.flatMap((active) => {
            if (active) {
              return E.zipRight(
                Dokens.setFinal(dokens, active),
                Dokens.currentActive(dokens, active),
              );
            }
            return E.zipRight(
              Dokens.engageDeferUpdate(dokens),
              Dokens.currentUpdate(dokens),
            );
          }));
        }
        return E.zipRight(
          Dokens.engageDeferSource(dokens),
          Dokens.currentSource(dokens),
        );
      }

      return E.void;
    }),
  });

  const codec = yield* Codec;
  const root = yield* Fiber.join(model);

  if (!root) {
    return;
  }

  const isPastCreate = yield* DateTime.isPast(dokens.fresh.ttl);

  if (isPastCreate) {
    const doken = yield* Dokens.awaitFinal(dokens);
    const payload = yield* codec.encodeResponseWithCache(root, doken);

    yield* dom.reply(doken, payload);
    return;
  }

  yield* Dokens.disengageTimeout(dokens);

  const doken = yield* Dokens.getCurrent(dokens);

  if (doken._tag === Doken.ACTIVE) {
    const payload = yield* codec.encodeResponseWithCache(root, doken);

    yield* dom.reply(doken, payload);
    return;
  }

  const payload = codec.encodeResponse(root, doken);

  if (doken._tag === Doken.MODAL) {
    yield* dom.createModal(doken, payload);
    return;
  }

  if (doken._tag === Doken.SOURCE) {
    yield* dom.createSource(doken, payload);
    return;
  }

  if (doken._tag === Doken.UPDATE) {
    yield* dom.createUpdate(doken, payload);
    return;
  }
});
