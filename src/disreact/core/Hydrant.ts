import type * as Polymer from '#disreact/core/Polymer.ts';

export interface Hydrant {
  version?: string;
  key?    : string;
  hash?   : string;
  endpoint: string;
  props   : Record<string, any>;
  state   : Record<string, Polymer.Encoded[]>;
}

export const hydrant = (
  endpoint: string,
  props: Record<string, any>,
  state: Record<string, Polymer.Encoded[]>,
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

export const endpoint = (id: string, component: any): Endpoint => {
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
