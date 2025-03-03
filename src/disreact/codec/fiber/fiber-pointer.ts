export type T = {
  id     : string;
  root_id: string;
};

export const make = (id: string, root_id: string): T => {
  return {
    id,
    root_id,
  };
};

export const toKey = (self: T) => `${self.root_id}/${self.id}`;

export const Null: T = {
  id     : '',
  root_id: '',
};
