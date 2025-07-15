import * as S from 'effect/Schema';

export type ModelSchema = never;

export const Props = () => {};

export const AllowedChildren = () => S.declare();

export const Element = <
  T extends string,
  P extends S.Struct.Fields,
>(
  config: {
    type     : T;
    props    : P;
    children?: any;
  },
) => {

};

export const Event = () => S.declare();

export const EventHandler = S.declare();

export const Hydrant = () => S.declare();

export const Simulated = () => S.declare();
