import {Codec} from '#src/disreact/codec/Codec.ts';
import {Doken} from '#src/disreact/codec/doken.ts';
import {RxTx} from '#src/disreact/codec/rxtx.ts';
import {FC} from '#src/disreact/model/comp/fc.ts';
import {Fibril} from '#src/disreact/model/comp/fibril.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import type {RelayStatus} from '#src/disreact/model/Relay.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {SourceDefect, Registry} from '#src/disreact/model/Registry.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {E, F, pipe} from '#src/disreact/utils/re-exports.ts';
import {InteractionCallbackType, InteractionType} from 'dfx/types';
import {Intrinsic} from '../codec/rest-elem/index.ts';
import {Lifecycles} from '../model/lifecycles.ts';
import {Model} from '../model/model';
import {Misc} from '../utils/misc.ts';
import {Dokens} from './dokens.ts';
import {Helpers} from './helpers.ts';

export * as Methods from '#src/disreact/runtime/methods.ts';
export type Methods = never;

type Id = Elem | FC | string;

const getId = (component: Id) => {
  if (typeof component === 'string') {
    return component;
  }
  if (typeof component === 'object') {
    return 'nope';
  }
  return FC.getSrcId(component);
};

//
//
//
export const synthesize = (id: Id, props?: any) =>
  pipe(
    E.flatMap(Registry, (registry) =>
      registry.checkout(getId(id), props),
    ),
    E.flatMap((root) =>
      Lifecycles.initialize(root),
    ),
    E.flatMap((root) =>
      E.map(Codec, (codec) => {
        const encoded = codec.encodeRoot(root);

        return codec.encodeResponse({
          _tag   : Intrinsic.isModal(encoded) ? 'Modal' : 'Message',
          base   : RxTx.DEFAULT_BASE_URL,
          serial : Doken.makeEmptySingle(),
          hydrant: Fibril.encodeNexus(root.nexus!),
          data   : encoded as any,
        });
      }),
    ),
  );

//
//
//
export const respond = (body: any) => E.gen(function* () {
  const [req, event] = yield* Helpers.decodeRequestEvent(body);

  const model = yield* E.fork(
    Model.hydrateInvoke(req.hydrant!, event).pipe(Misc.trackModelTime),
  );

  const doken = yield* Dokens.make(req.fresh);

  yield* E.fork(
    Dokens.resolveActive(doken, req.serial).pipe(Misc.trackModelTime),
  );

  const relay = yield* Relay;
  const dom = yield* DisReactDOM;
  let status: RelayStatus | undefined;

  while (status?._tag !== 'Complete') {
    status = yield* relay.awaitStatus();

    if (status._tag === 'Close') {
      yield* Dokens.close(doken).pipe(Misc.trackDismountTime);
      break;
    }

    if (status._tag === 'Same') {
      const active = yield* Dokens.awaitActive(doken);

      if (active) {
        yield* E.fork(
          dom.discard(doken.fresh.id, doken.fresh.val, {type: 7}),
        );
        yield* Dokens.setFinal(doken, active);
        break;
      }

      yield* dom.defer(doken.fresh.id, doken.fresh.val, {type: 7}).pipe(Misc.trackDeferTime);
      yield* Dokens.setFinal(doken, Doken.makeActive(doken.fresh));
      break;
    }

    if (status._tag === 'Partial') {
      if (status.type === 'modal') {
        if (req.body.type === InteractionType.MODAL_SUBMIT) {
          return yield* new SourceDefect({
            message: 'Modal already open',
          });
        }

        yield* Dokens.setFinal(doken, doken.fresh);
        break;
      }

      const active = yield* Dokens.awaitActive(doken);

      if (active && status.isEphemeral === req.isEphemeral) {
        yield* Dokens.setFinal(doken, active);
        break;
      }

      yield* dom.defer(doken.fresh.id, doken.fresh.val, {type: 7}).pipe(Misc.trackDeferTime);
      yield* Dokens.setFinal(doken, Doken.makeActive(doken.fresh));
      break;
    }
  }

  const final = yield* Dokens.awaitFinal(doken);
  const root = yield* F.join(model);

  if (!root) {
    return;
  }

  if (final._tag === Doken.ACTIVE) {
    const output = yield* Helpers.encodeActiveReply(root, final);

    yield* dom.reply(final.id, final.val, output).pipe(Misc.trackReplyTime);
    return;
  }

  const encoded = yield* Codec.encodeRoot(root);

  const output = yield* Codec.encodeResponse({
    _tag   : Intrinsic.isModal(encoded) ? 'Modal' : 'Message',
    base   : RxTx.DEFAULT_BASE_URL,
    serial : Doken.makeSingle(final),
    hydrant: Fibril.encodeNexus(root.nexus),
    data   : encoded as any,
  });

  if (Intrinsic.isModal(output)) {
    yield* dom.create(final.id, final.val, {
      type: InteractionCallbackType.MODAL,
      data: output,
    }).pipe(Misc.trackCreateTime);
    return;
  }

  yield* dom.create(final.id, final.val, {
    type: 0,
    data: output,
  }).pipe(Misc.trackCreateTime);
});
