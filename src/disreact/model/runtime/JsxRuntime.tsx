import * as Jsx from '#disreact/model/entity/Jsx.tsx';

export const Fragment = Jsx.Fragment;

export interface Setup extends Record<string, any> {
  key?: string;
  ref?: any;
};

export type Key =
  | string
  | undefined;

export const jsx = (type: Jsx.Type, setup: Setup, key?: Key): Jsx.Jsx => {
  switch (typeof type) {
    case 'string': {
      const self = Jsx.intrinsic(type, setup);
      self.key = key;
      self.child = setup.children;
      return self;
    }
    case 'function': {
      const self = Jsx.component(type, setup);
      self.key = key;
      return self;
    }
  }
  if (type === Fragment) {
    const self = Jsx.fragment(setup);
    self.child = setup.children;
    return self;
  }
  throw new Error(`Invalid JSX type: ${type}`);
};

export const jsxs = (type: Jsx.Type, setup: Setup, key?: Key): Jsx.Jsx => {
  switch (typeof type) {
    case 'string': {
      const self = Jsx.intrinsic(type, setup);
      self.key = key;
      self.childs = setup.children;
      return self;
    }
    case 'function': {
      const self = Jsx.component(type, setup);
      self.key = key;
      return self;
    }
  }
  if (type === Fragment) {
    const self = Jsx.fragment(setup);
    self.childs = setup.children;
    return self;
  }
  throw new Error(`Invalid JSX type: ${type}`);
};
