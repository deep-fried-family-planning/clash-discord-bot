import * as FC from '#disreact/core/FC.ts';
import type * as Polymer from '#disreact/model/entity/Polymer.ts';

export type State = Record<string, Polymer.Encoded[]>;

export interface Hydrant {
  version?: string;
  key?    : string;
  hash?   : string;
  endpoint: string;
  props   : Record<string, any>;
  state   : State;
}

export const hydrant = (
  endpoint: string,
  props: Record<string, any>,
  state: State,
): Hydrant =>
  ({
    endpoint,
    props,
    state,
  });

export interface Endpoint {
  id       : string;
  component: any;
}

export const endpoint = (id: string, component: FC.FC): Endpoint => {
  const fc = FC.register(component);
  return {
    id       : id,
    component: component,
  };
};

export interface ProtoEvent {
  id     : string;
  lookup : string;
  handler: string;
  data   : any;
}

export const protoEvent = (
  id: string,
  lookup: string,
  handler: string,
  data: any,
): ProtoEvent =>
  ({
    id     : id,
    lookup : lookup,
    handler: handler,
    data   : data,
  });
