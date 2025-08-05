import {u} from '#disreact/codec/constants/html-tag.ts';
import type * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import type * as Jsx from '#disreact/engine/entity/Jsx.ts';

export const ControlledId = S.TemplateLiteralParser(
  S.String,
  '.', S.NumberFromString,
  '.', S.String,
  '.', S.NumberFromString,
);

export const isControlledId = S.is(ControlledId);

const BaseEvent = {
  id     : S.String,
  open   : S.declare((u): u is (jsx: Jsx.Jsx) => void => typeof u === 'function'),
  update : S.declare((u): u is (jsx: Jsx.Jsx) => void => typeof u === 'function'),
  replace: S.declare((u): u is (jsx: Jsx.Jsx) => void => typeof u === 'function'),
  close  : S.declare((u): u is () => void => typeof u === 'function'),
};

export const OnClickEvent = <A extends S.Struct.Field>(target: A) =>
  S.Struct({
    ...BaseEvent,
    type  : S.tag('onclick'),
    target: target,
  });

export const OnSelectEvent = <A extends S.Struct.Field>(target: A) =>
  S.Struct({
    ...BaseEvent,
    type  : S.tag('onselect'),
    target: target,
  });

export const OnSubmitEvent = <A extends S.Struct.Field>(target: A) =>
  S.Struct({
    ...BaseEvent,
    type  : S.tag('onsubmit'),
    target: target,
  });

export type Handler<A> = <E = never, R = never>(event: A) =>
      | void
      | Promise<void>
      | E.Effect<void, any, any>;

const handler = <A>(h: unknown): h is <E = never, R = never>(event: A) => void | Promise<void> | E.Effect<void, E, R> =>
      typeof h === 'function' &&
      h.length <= 1;

export const Handler = <A, I, R>(data: S.Schema<A, I, R>) => S.declare(handler<typeof data.Type>);

export const isHandler = S.is(Handler(S.Any));

export const Attributes = <A extends S.Struct.Fields>(fields: A) => S.Struct(fields);
