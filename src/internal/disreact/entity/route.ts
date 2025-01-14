import {D, pipe} from '#pure/effect';
import {NONE, ROW_NONE} from '#src/internal/disreact/entity/constants.ts';
import {Err, type Ix} from '#src/internal/disreact/entity/index.ts';
import {type alias, cannot, type Mutable, type num, type str} from '#src/internal/pure/types-pure.ts';
import {inject, parse} from 'regexparam';


/* eslint-disable @typescript-eslint/no-unnecessary-condition */


const make = <
  Template extends str,
  Params extends Parameters<typeof inject<Template>>[1],
  Builder extends (input: {original?: str; params: Params}) => T,
>(
  template: Template,
  builder: Builder,
) => {
  const parser = parse(template);

  const identity = (self: T) => self as ReturnType<Builder>;

  const empty = () => {
    const acc = {} as alias;
    for (const k of parser.keys) {
      acc[k] = NONE;
    }
    return builder({params: acc as Params}) as ReturnType<Builder>;
  };

  const encode = (input: Parameters<Builder>[0]) => {
    const params = input.params as alias;
    const acc    = {} as alias;
    for (const k of parser.keys) if (params[k]) acc[k] ??= params[k];
    return inject(template, input.params);
  };

  const decode = (path?: str) => {
    if (!path) return null;
    if (!parser.pattern.test(path)) return null;
    const [, ...matches] = parser.pattern.exec(path)!;
    const acc            = {} as alias;
    let idx              = 0;
    for (const k of parser.keys) acc[k] ??= matches[idx++];
    return builder({original: path, params: acc as Params}) as ReturnType<Builder>;
  };

  return {builder, identity, empty, encode, decode} as const;
};


type Common<A extends str> = {
  original?: str;
  query?   : URLSearchParams;
  params   : Parameters<typeof inject<A>>[1];
};
export type T = D.TaggedEnum<{
  Simulated: Common<typeof _Simulated>;
  Immediate: Common<typeof _Immediate>;
  Direct   : Common<typeof _Direct>;
  Component: Common<typeof _Component>;
  Embed    : Common<typeof _Embed>;
}>;
export type Simulated = D.TaggedEnum.Value<T, 'Simulated'>;
export type Immediate = D.TaggedEnum.Value<T, 'Immediate'>;
export type Direct = D.TaggedEnum.Value<T, 'Direct'>;
export type Component = D.TaggedEnum.Value<T, 'Component'>;
export type Embed = D.TaggedEnum.Value<T, 'Embed'>;


const T                  = D.taggedEnum<T>();
const is                 = T.$is;
export const match       = T.$match;
const _Simulated         = '/s/:pipe_id/:root_id/:node_id/:prev_id/:mod';
const _Immediate         = '/i/:pipe_id/:root_id/:node_id/:prev_id/:mod';
const _Direct            = '/d/:pipe_id/:root_id/:node_id/:prev_id/:defer/:ref/:row/:col/:mod';
const _Component         = '/c/:ref/:row/:col/:mod';
const _Embed             = '/e/:tag/:ref/:row/:mod';
export const Simulated   = make(_Simulated, T.Simulated);
export const Immediate   = make(_Immediate, T.Immediate);
export const Direct      = make(_Direct, T.Direct);
export const Component   = make(_Component, T.Component);
export const Embed       = make(_Embed, T.Embed);
export const isSimulated = is('Simulated');
export const isImmediate = is('Immediate');
export const isDirect    = is('Direct');
export const isComponent = is('Component');
export const isEmbed     = is('Embed');


export const clone = <A extends T>(dr: A): A => ({
  ...dr,
  query : new URLSearchParams(dr.query),
  params: {
    ...dr.params,
  },
});


const all = [
  Simulated,
  Immediate,
  Direct,
  Component,
  Embed,
] as const;


export const setQuery = (query: URLSearchParams) => match({
  Simulated: (dr) => (((dr as Mutable<typeof dr>).query = query) && dr) || dr,
  Immediate: (dr) => (((dr as Mutable<typeof dr>).query = query) && dr) || dr,
  Direct   : (dr) => cannot(dr),
  Component: (dr) => cannot(dr),
  Embed    : (dr) => (((dr as Mutable<typeof dr>).query = query) && dr) || dr,
});


export const getDefer = match({
  Simulated: (self) => NONE,
  Immediate: (self) => NONE,
  Direct   : (self) => self.params.defer,
  Component: (self) => NONE,
  Embed    : (self) => NONE,
});


export const setDefer = (defer: str) => match({
  Simulated: (self) => self,
  Immediate: (self) => self,
  Direct   : (self) => ((self.params.defer = defer) && self) || self,
  Component: (self) => self,
  Embed    : (self) => self,
});


export const getPipe = match({
  Simulated: (self) => self.params.pipe_id,
  Immediate: (self) => self.params.pipe_id,
  Direct   : (self) => self.params.pipe_id,
  Component: (self) => NONE,
  Embed    : (self) => NONE,
});


export const setPipe = (pipe_id: str) => match({
  Simulated: (self) => ((self.params.pipe_id = pipe_id) && self) || self,
  Immediate: (self) => ((self.params.pipe_id = pipe_id) && self) || self,
  Direct   : (self) => ((self.params.pipe_id = pipe_id) && self) || self,
  Component: (self) => self,
  Embed    : (self) => self,
});


export const getRoot = match({
  Simulated: (self) => self.params.root_id,
  Immediate: (self) => self.params.root_id,
  Direct   : (self) => self.params.root_id,
  Component: () => NONE,
  Embed    : () => NONE,
});


export const setRoot = (root_id: str) => match({
  Simulated: (dr) => ((dr.params.root_id = root_id) && dr) || dr,
  Immediate: (dr) => ((dr.params.root_id = root_id) && dr) || dr,
  Direct   : (dr) => ((dr.params.root_id = root_id) && dr) || dr,
  Component: (dr) => dr,
  Embed    : (dr) => dr,
});


export const getNode = match({
  Simulated: (self) => self.params.node_id,
  Immediate: (self) => self.params.node_id,
  Direct   : (self) => self.params.node_id,
  Component: () => NONE,
  Embed    : () => NONE,
});


export const setNode = (node_id: str) => match({
  Simulated: (dr) => ((dr.params.node_id = node_id) && dr) || dr,
  Immediate: (dr) => ((dr.params.node_id = node_id) && dr) || dr,
  Direct   : (dr) => ((dr.params.node_id = node_id) && dr) || dr,
  Component: (dr) => cannot(dr),
  Embed    : (dr) => cannot(dr),
});


export const setPrevious = (prev_id: str) => match({
  Simulated: (dr) => ((dr.params.prev_id = prev_id) && dr) || dr,
  Immediate: (dr) => ((dr.params.prev_id = prev_id) && dr) || dr,
  Direct   : (dr) => ((dr.params.prev_id = prev_id) && dr) || dr,
  Component: (dr) => cannot(dr),
  Embed    : (dr) => cannot(dr),
});
export const getPrevious = match({
  Simulated: (dr) => dr.params.prev_id,
  Immediate: (dr) => dr.params.prev_id,
  Direct   : (dr) => dr.params.prev_id,
  Component: () => NONE,
  Embed    : () => NONE,
});


export const setMod = (mod: str) => match({
  Simulated: (dr) => ((dr.params.mod = mod) && dr) || dr,
  Immediate: (dr) => ((dr.params.mod = mod) && dr) || dr,
  Direct   : (dr) => ((dr.params.mod = mod) && dr) || dr,
  Component: (dr) => ((dr.params.mod = mod) && dr) || dr,
  Embed    : (dr) => ((dr.params.mod = mod) && dr) || dr,
});


export const setTag = (tag: str) => match({
  Simulated: (dr) => dr,
  Immediate: (dr) => dr,
  Direct   : (dr) => dr,
  Component: (dr) => dr,
  Embed    : (dr) => ((dr.params.tag = tag) && dr) || dr,
});


export const setRef = (ref: str) => match({
  Simulated: (dr) => dr,
  Immediate: (dr) => dr,
  Direct   : (dr) => ((dr.params.ref = ref) && dr) || dr,
  Component: (dr) => ((dr.params.ref = ref) && dr) || dr,
  Embed    : (dr) => ((dr.params.ref = ref) && dr) || dr,
});
export const getRef = match({
  Simulated: () => NONE,
  Immediate: () => NONE,
  Direct   : (dr) => dr.params.ref,
  Component: (dr) => dr.params.ref,
  Embed    : (dr) => dr.params.ref,
});


export const setRow = (row: num | str) => match({
  Simulated: (dr) => dr,
  Immediate: (dr) => dr,
  Direct   : (dr) => ((dr.params.row = `${row}`) && dr) || dr,
  Component: (dr) => ((dr.params.row = `${row}`) && dr) || dr,
  Embed    : (dr) => ((dr.params.row = `${row}`) && dr) || dr,
});
export const getRow = (self: T) => {
  if (isEmbed(self) || isComponent(self)) {
    return parseInt(self.params.row);
  }
  return ROW_NONE;
};


export const setCol = (col: num | str) => match({
  Simulated: (dr) => dr,
  Immediate: (dr) => dr,
  Direct   : (dr) => ((dr.params.col = `${col}`) && dr) || dr,
  Component: (dr) => ((dr.params.col = `${col}`) && dr) || dr,
  Embed    : (dr) => dr,
});
export const getCol = (self: T) => {
  if (isComponent(self)) {
    return parseInt(self.params.col);
  }
  return ROW_NONE;
};


export const encode = match({
  Simulated: (dr) => Simulated.encode(dr),
  Immediate: (dr) => Immediate.encode(dr),
  Direct   : Direct.encode,
  Component: Component.encode,
  Embed    : (dr) => !dr.query ? Embed.encode(dr) : `${Embed.encode(dr)}?${dr.query.toString()}`,
});


export const encodeUrl = (baseUrl: str) => match({
  Simulated: (dr) => new URL(`${baseUrl}${!dr.query ? Simulated.encode(dr) : `${Simulated.encode(dr)}?${dr.query.toString()}`}`),
  Immediate: (dr) => new URL(`${baseUrl}${!dr.query ? Immediate.encode(dr) : `${Immediate.encode(dr)}?${dr.query.toString()}`}`),
  Direct   : Direct.encode,
  Component: Component.encode,
  Embed    : (dr) => new URL(`${baseUrl}${!dr.query ? Embed.encode(dr) : `${Embed.encode(dr)}?${dr.query.toString()}`}`),
});


export const decode = (id?: str) => {
  if (!id) return null;
  for (const route of all) {
    const decoded = route.decode(id);
    if (decoded) return decoded;
  }
  return null;
};


export const decodeFromControllerEmbed = (ix: Ix.Rest) => {
  const controller = ix.message?.embeds?.at(0);

  if (!controller) return null;
  if (!controller.image?.url) return null;

  const url   = new URL(controller.image.url);
  const maybe = decode(url.pathname);

  if (!maybe) return null;

  return pipe(
    maybe,
    setQuery(url.searchParams),
  ) as Simulated | Immediate | Direct;
};


export const decodeFromData = (ix: Ix.Rest) => decode(ix.data.custom_id) as Component | null;


export type Routed = {route?: T};

export const setRouted = <A extends Routed>(updated: T) => (self: A) => {
  self.route = updated;
  return self;
};

export const updateRouted = <A extends Routed>(updater: (r: T) => T) => (self: A) => {
  if (!self.route) throw new Err.DevMistake();
  self.route = updater(self.route);
  return self;
};
