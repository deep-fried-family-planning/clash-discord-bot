export interface Entrypoint<A = any> {
  id       : string;
  component: A;
}

export const make = (id: string, component: any): Entrypoint => {
  return {
    id       : id,
    component: component,
  };
};

export interface Hydrant {
  entrypoint: string;
  props     : Record<string, any>;
}
