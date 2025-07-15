import * as Jsx from '#disreact/model/entity/Jsx.ts';

export const Fragment = Jsx.Fragment;

export const makeJsx = (type: Jsx.Type, setup: Jsx.Setup, key: Jsx.Key) => {
  const self = Jsx.make(type, setup, key);
  (self.child as any) = setup.children;
  return self;
};

export const makeJsxs = (type: Jsx.Type, setup: Jsx.Setup, key: Jsx.Key) => {
  const self = Jsx.make(type, setup, key);
  (self.jsx as any) = false;
  (self.childs as any) = setup.children;
  return self;
};
