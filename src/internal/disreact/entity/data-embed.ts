/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type {RestEmbed} from '#pure/dfx';
import {D, pipe} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Failure, Route} from '#src/internal/disreact/entity/index.ts';
import {cannot, type mut, type num, type str} from '#src/internal/pure/types-pure.ts';


export type Data = RestEmbed;
export type Meta = {
  route?: Route.T;
  ref?  : str;
  data  : mut<RestEmbed>;
};
export type Grid = T[];


export type T = D.TaggedEnum<{
  Controller  : Meta & {};
  DialogLinked: Meta & {refs: str[]};
  Basic       : Meta & {ref?: str};
  Status      : Meta & {ref?: str};
}>;
export type Controller = D.TaggedEnum.Value<T, 'Controller'>;
export type DialogLinked = D.TaggedEnum.Value<T, 'DialogLinked'>;
export type Basic = D.TaggedEnum.Value<T, 'Basic'>;


export const T              = D.taggedEnum<T>();
export const is             = T.$is;
export const match          = T.$match;
export const set            = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const Controller     = T.Controller;
export const Basic          = T.Basic;
export const DialogLinked = T.DialogLinked;
export const Status = T.Status;
export const Toast        = T.Status;
export const isController = is('Controller');
export const isBasic        = is('Basic');
export const isDialogLinked = is('DialogLinked');


export const getController = (ed: T[]) => {
  const controller = ed[0];
  if (!isController(controller)) return null;
  return controller;
};


export const getRoute = (ed: T) => ed.route;
export const setRoute = (
  route: Route.T,
) => match({
  Controller  : (ed) => (((ed as mut<Controller>).route = route) && ed) || ed,
  DialogLinked: (ed) => cannot(ed),
  Basic       : (ed) => cannot(ed),
  Status      : (ed) => cannot(ed),
});


const emptyRoute = (row: num) => pipe(
  Route.Embed.empty(),
  Route.setRow(row),
  Route.Embed.identity,
);


export const decode = (rest: RestEmbed, row: num) => {
  if (!rest.image?.url) return Basic({
    route: emptyRoute(row),
    data : rest,
  });

  const url   = new URL(rest.image.url);
  const route = Route.Embed.decode(url.pathname);

  if (!route) return Controller({
    route: emptyRoute(row),
    data : rest,
  });

  const embedRoute = pipe(
    route,
    Route.setRow(row),
    Route.setSearch(url.searchParams),
    Route.Embed.identity,
  );

  if (embedRoute.params.tag === 'DialogLinked') return DialogLinked({
    route: embedRoute,
    data : rest,
    refs : [...url.searchParams.keys()],
  });

  if (embedRoute.params.tag === 'Status') return Toast({
    route: embedRoute,
    data : rest,
  });

  return Basic({
    route: embedRoute,
    data : rest,
    ref  : embedRoute.params.ref,
  });
};

export const decodeGrid = (rest: RestEmbed[] = []) => rest.map(decode);


export const encode = (ex: T, row: num) => {
  if (!ex.route) throw new Failure.Critical({why: 'route is not set'});

  const route = pipe(
    ex.route,
    Route.setRow(row),
    Route.setTag(ex._tag),
    Route.setRef(ex.ref ?? NONE),
    Route.encode,
  );

  const url = new URL(`${DFFP_URL}${route}`);

  if (isController(ex)) {
    if (Route.isEmbed(ex.route)) return cannot(ex.data);
    ex.data.image = {url: url.href};
    return ex.data;
  }

  if (isDialogLinked(ex)) {
    const search = new URLSearchParams();
    for (const ref of ex.refs) search.set(ref, NONE);
    url.search    = search.toString();
    ex.data.image = {url: url.href};
    return ex.data;
  }

  ex.data.image = {url: url.href};
  return ex.data;
};
