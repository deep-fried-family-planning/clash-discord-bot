import {D, pipe} from '#pure/effect';
import {DFFP_URL} from 'src/constants/dffp-alias.ts';
import {type DA, Rf} from 'src/internal/disreact/virtual/entities/index.ts';
import {NONE} from 'src/internal/disreact/virtual/kinds/constants.ts';
import {Err} from 'src/internal/disreact/virtual/kinds/index.ts';
import {EmbedRoute, MainRoute} from 'src/internal/disreact/virtual/route/index.ts';
import type {mut} from 'src/internal/pure/types-pure.ts';



export type T = D.TaggedEnum<{
  Main        : {route: MainRoute.T; data: DA.Embed; ref?: Rf.T};
  Basic       : {route: EmbedRoute.T; data: DA.Embed; ref?: Rf.T};
  DialogLinked: {route: EmbedRoute.T; data: DA.Embed; ref?: Rf.T; refs: Rf.DialogLinked[]};
}>;

export type Main = D.TaggedEnum.Value<T, 'Main'>;
export type Basic = D.TaggedEnum.Value<T, 'Basic'>;
export type DialogLinked = D.TaggedEnum.Value<T, 'DialogLinked'>;

export const T = D.taggedEnum<T>();

export const Main         = T.Main;
export const Basic        = T.Basic;
export const DialogLinked = T.DialogLinked;

export const isMain         = T.$is('Main');
export const isBasic        = T.$is('Basic');
export const isDialogLinked = T.$is('DialogLinked');


const decode = (embed: DA.Embed) => {
  const url       = new URL(embed.image?.url ?? DFFP_URL);
  const mainRoute = MainRoute.decode(url.pathname);

  if (mainRoute) {
    return Main({
      route: mainRoute,
      ref  : Rf.decode(mainRoute.params.ref),
      data : embed,
    });
  }

  const route = EmbedRoute.decode(url.pathname);

  if (!route) throw new Err.Critical();

  if (route.params.type === 'Basic') {
    return Basic({
      route,
      ref : Rf.decode(route.params.ref),
      data: embed,
    });
  }

  if (!route.query) throw new Err.Critical();

  return DialogLinked({
    route,
    ref : Rf.decode(route.params.ref),
    refs: [...route.query.keys()].map(Rf.decode).filter(Rf.isDialogLinked),
    data: embed,
  });
};


export const decodeAll = (rest?: DA.Embed[]): T[] => {
  if (!rest) throw new Err.Critical();
  return rest.map(decode);
};


export const applyDefaultRefs = (ems: T[]) => {
  let default_ref_counter = 0;
  for (const em of ems) {
    if (!em.ref || em.ref.id === NONE) {
      (em as mut<typeof em>).ref = Rf.Ignore({id: `${default_ref_counter++}`});
    }
  }
  return ems;
};


const encode = (em: T) => {
  if (isMain(em)) {
    (em.data as mut<T['data']>).image = {url: pipe(em.route, MainRoute.setRef(Rf.encode(em.ref!)), MainRoute.encodeUrl)};
    return em.data;
  }

  (em.data as mut<T['data']>).image = {url: pipe(em.route, EmbedRoute.setRef(Rf.encode(em.ref!)), EmbedRoute.encodeUrl)};

  if (isDialogLinked(em)) {
    const route = pipe(em.route, EmbedRoute.setSearch(new URLSearchParams()));

    for (const ref of em.refs) {
      route.query!.set('ref', Rf.encode(ref));
    }

    (em.data as mut<T['data']>).image = {url: EmbedRoute.encodeUrl(route)};
  }
  return em.data;
};


export const encodeAll = (route: MainRoute.T) => ([main, ...ems]: T[]): DA.Embed[] => {
  if (!isMain(main)) {
    throw new Err.Critical();
  }

  (main as mut<typeof main>).route = route;

  return [encode(main), ...ems.map(encode)];
};
