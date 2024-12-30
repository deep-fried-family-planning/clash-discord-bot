import {NONE_NUM} from '#discord/entities/constants/constants.ts';
import {NONE, ROW_NONE} from '#discord/entities/constants/path.ts';
import {ExPath} from '#discord/entities/routing/ex-path.ts';
import type {RestEmbed} from '#pure/dfx';
import {D, pipe} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import type {Mutable, num, str} from '#src/internal/pure/types-pure.ts';
import {URL} from 'node:url';


export type Path = ExPath;
export type Meta = {
  path : Path;
  query: URLSearchParams;
};
export type T = D.TaggedEnum<{
  Controller  : Meta & {data: Mutable<Data>};
  DialogLinked: Meta & {data: Mutable<Data>; refs: str[]};
  Basic       : Meta & {data: Mutable<Data>; ref?: str};
}>;
export type Grid = T[];
export type Data = RestEmbed;


export const E        = D.taggedEnum<T>();
export const Path     = ExPath;
export const is       = E.$is;
export const match    = E.$match;
export const pure     = <A extends T>(a: A) => a;
export const pureGrid = (exs: Grid) => exs;
export const get      = <A extends T, B extends keyof A>(b: B) => (a: A): A[B] => a[b];
export const set      = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const setWith  = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const map      = <A extends T>(fa: (a: A) => A) => (a: A) => fa(a);
export const mapTo    = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapGrid  = (fa: (a: T, row: num) => T) => (grid: Grid) => grid.map((row, rowIdx) => fa(row, rowIdx));


export const Controller   = E.Controller;
export const Basic        = E.Basic;
export const DialogLinked = E.DialogLinked;


export const decode = (rest: RestEmbed, row?: num) => {
  const url      = new URL(rest.image?.url ?? DFFP_URL);
  const basePath = url.pathname === '/'
    ? Path.empty()
    : Path.parse(url.pathname);

  const path = pipe(
    basePath,
    Path.set('row', row ?? NONE_NUM),
  );

  const base = {
    path,
    query: url.searchParams,
    data : rest,
  };

  if (path.tag === NONE) {
    return Basic(base);
  }

  if (path.tag === 'Controller') {
    return Controller({
      path,
      query: url.searchParams,
      data : rest,
    });
  }

  if (path.tag === 'DialogLinked') {
    return DialogLinked({
      path,
      query: url.searchParams,
      refs : [...url.searchParams.keys()].filter((k) => k.startsWith('a_')),
      data : rest,
    });
  }

  return Basic(base);
};

export const encode = (ex: T, row?: num) => {
  const url = new URL(DFFP_URL);

  if (ex._tag === 'DialogLinked') {
    for (const ref of ex.refs) {
      ex.query.set(ref, 'd');
    }
  }

  const path = pipe(
    ex.path,
    Path.set('row', row ?? ROW_NONE),
    Path.build,
  );


  url.pathname  = path;
  url.search    = ex.query.toString();
  ex.data.image = {url: url.href};

  return ex.data;
};


export const decodeGrid = (rest: RestEmbed[] = []) => rest.map(decode);
export const encodeGrid = (rx_exs?: Grid) => (exs: Grid) => {
  if (!rx_exs) {
    return exs.map(encode);
  }
  return exs.map((ex, row) => {
    if (ex._tag === 'DialogLinked' && rx_exs[row]._tag === 'DialogLinked') {
      return encode(
        {
          ...ex,
          data: {
            ...ex.data,
            ...rx_exs[row].data,
          },
        },
        row,
      );
    }
    return encode(ex, row);
  });
};
