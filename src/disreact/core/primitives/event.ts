import type * as Event from '#disreact/core/Event.ts';
import * as proto from '#disreact/core/behaviors/proto.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import * as Lineage from '#disreact/core/behaviors/lineage.ts';

const Prototype = proto.type<Event.Event>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

export const event = (target: any) =>
  proto.init(Prototype, {
    target: target,
  });

const HandlerPrototype = proto.type<Event.PropsHandler>({
  ...Lineage.EqualPrototype,
});

export const handler = (fn: Event.Handler) =>
  proto.init(HandlerPrototype, {});
