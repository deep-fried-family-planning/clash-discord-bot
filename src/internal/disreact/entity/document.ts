import {D, pipe} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Cd, Ed, Err, Ix, Route} from '#src/internal/disreact/entity/index.ts';
import {isRestSubmit} from '#src/internal/disreact/entity/interaction.ts';
import type {mut, str} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  Entrypoint: {
    fromInterface?: boolean;
    target?       : Cd.T;
    onClick?      : Cd.T['onClick'];
    route?        : Route.T;
    embeds        : Ex.T;
    components    : Cx.T;
  };
  Message: {
    fromInterface?: boolean;
    target?       : Cd.T;
    onClick?      : Cd.T['onClick'];
    route?        : Route.T;
    embeds        : Ex.T;
    components    : Cx.T;
  };
  Dialog: {
    fromInterface?: boolean;
    onOpen?       : () => void;
    onSubmit?     : () => void;
    route?        : Route.T;
    title?        : str;
    components    : Cx.T;
  };
}>;
export type Entrypoint = D.TaggedEnum.Value<T, 'Entrypoint'>;
export type Message = D.TaggedEnum.Value<T, 'Message'>;
export type Dialog = D.TaggedEnum.Value<T, 'Dialog'>;


const T                 = D.taggedEnum<T>();
const is                = T.$is;
const match             = T.$match;
export const Entrypoint = T.Entrypoint;
export const Message    = T.Message;
export const Dialog     = T.Dialog;
export const isDialog   = is('Dialog');


export const updateTarget = (ix: Ix.T) => (self: T) => {
  if (!('custom_id' in ix)) return self;
  if (isDialog(self)) return self;
  if (!self.target) return self;
  if (!self.target.data.custom_id) return self;

  if (Ix.isSelectMention(ix) || Ix.isSelect(ix)) {
    self.components.custom_ids.set(self.target.data.custom_id, pipe(self.target, Cd.setSelectedOptions(ix)));
  }

  return self;
};


export const getTarget = (self: T) => {
  if (isDialog(self)) throw new Err.DevMistake();
  return self.target!;
};


export const setOnClick = (route: Route.T) => (self: T) => {
  if (!isDialog(self)) {
    const row = Route.getRow(route);
    const col = Route.getCol(route);
    (self as mut<typeof self>).onClick = self.components.grid[row][col].onClick;
  }
  return self;
};


export const getOnClick = (self: T) => {
  if (!isDialog(self)) {
    return self.onClick;
  }
  return undefined;
};


export const setTarget = (ix: Ix.T) => (self: T) => {
  if (!('custom_id' in ix)) return self;
  if (!isDialog(self)) {
    (self as mut<typeof self>).target = self.components.custom_ids.get(ix.custom_id)!;
  }
  return self;
};


export const getOnOpen = (self: T) => {
  if (isDialog(self) && self.fromInterface) return self.onOpen;
  return undefined;
};


export const getOnSubmit = (self: T) => {
  if (isDialog(self) && self.fromInterface) return self.onSubmit;
  return undefined;
};


export const encode = match({
  Entrypoint: (self) => {
    if (!self.route) throw new Err.DevMistake();
    return {
      embeds    : Ex.encode(self.embeds),
      components: Cd.encodeGrid(self.components.grid),
    };
  },
  Message: (self) => {
    if (!self.route) throw new Err.DevMistake();
    return {
      embeds    : Ex.encode(self.embeds),
      components: Cd.encodeGrid(self.components.grid),
    };
  },
  Dialog: (self) => {
    if (!self.route) throw new Err.DevMistake();
    return {
      custom_id : Route.encode(self.route),
      title     : self.title ?? NONE,
      components: Cd.encodeGrid(self.components.grid),
    };
  },
});


export const decodeMessage = (route: Route.T) => (ix: Ix.T) => {
  if (Route.isEntrypoint(route)) return Entrypoint({
    route,
    embeds: pipe(
      Ed.decodeGrid(ix.original.message?.embeds),
      Ex.make,
    ),
    components: pipe(
      Cd.decodeGrid(ix.original.message?.components),
      Cx.make,
    ),
  });

  return Message({
    route,
    embeds: pipe(
      Ed.decodeGrid(ix.original.message?.embeds),
      Ex.make,
    ),
    components: pipe(
      Cd.decodeGrid(ix.original.message?.components),
      Cx.make,
    ),
  });
};


export const decodeDialog = (route: Route.T, ix: Ix.Rest) => {
  if (!isRestSubmit(ix, ix.data)) throw noFix();

  return Dialog({
    route,
    components: pipe(
      Cd.decodeGrid(ix.data.components),
      Cx.make,
    ),
  });
};
