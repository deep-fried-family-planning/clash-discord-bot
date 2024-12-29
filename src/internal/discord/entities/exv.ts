import {NONE} from '#discord/entities/constants.ts';
import {ExPath} from '#discord/entities/ex-router.ts';
import type {RestEmbed} from '#pure/dfx';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import {D, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {URL} from 'node:url';


export type T = D.TaggedEnum<{
  Controller   : {_url?: URL} & RestEmbed;
  Basic        : {_url?: URL; ref: str} & RestEmbed;
  AccessorEmbed: {_url?: URL} & {accessors: str[]} & RestEmbed;
}>;
export const C = D.taggedEnum<T>();


export const BasicEmbed      = C.Basic;
export const AccessorEmbed   = C.AccessorEmbed;
export const EmbedController = C.Controller;


export const make = (exv: T): T => {
  const url = new URL(DFFP_URL);

  if (exv._tag === 'AccessorEmbed') {
    for (const accessor of exv.accessors) {
      url.searchParams.set(accessor, 'a');
    }
  }

  url.pathname = `/${exv._tag}`;

  return {
    _url: url,
    ...exv,
  };
};


export const decode = (ex: RestEmbed) => {
  const url = new URL(ex.image?.url ?? DFFP_URL);

  const base = {
    ...ex,
    _url: url,
  };

  const ids = [...url.searchParams.keys()].filter((id) => id.startsWith('a_'));

  if (ids.length) {
    return C.AccessorEmbed({
      ...base,
      accessors: ids,
    });
  }

  const route = url.pathname === '/'
    ? ExPath.empty()
    : ExPath.parse(url.pathname);

  if (route.kind === 'Controller') {
    return C.Controller(base);
  }

  return C.Basic({
    ...base,
    ref: route.ref,
  });
};


export const encode = (exv: T) => {
  let {_tag, _url, ...rest} = exv;
  let accessors             = [] as str[];
  let ref                   = NONE;

  console.log('');
  console.log('encode_before', _url?.href);

  if (C.$is('AccessorEmbed')(exv)) {
    ({_tag, _url, accessors, ...rest} = exv);
  }
  if (C.$is('Basic')(exv)) {
    ({_tag, _url, ref, ...rest} = exv);
  }

  _url!.pathname = pipe(
    ExPath.empty(),
    ExPath.set('kind', _tag),
    ExPath.set('ref', ref),
    ExPath.build,
  );

  for (const id of accessors) {
    _url!.searchParams.set(id, 'a');
  }

  console.log('encode_after', _url?.href);

  return {
    ...rest,
    image: {
      ...rest.image,
      url: _url!.href,
    },
  } as RestEmbed;
};


export const decodeAll = (rest: RestEmbed[]) => rest.map((r) => decode(r));

export const encodeAll = (exvs: T[], rx_exvs?: T[]): RestEmbed[] => {
  if (rx_exvs && exvs.length === rx_exvs.length) {
    console.log('encode with rx');
    return exvs.map((exv, row) => {
      console.log('encode_accessor_embed', exv._tag, rx_exvs[row]._tag);

      if (exv._tag === 'AccessorEmbed' && rx_exvs[row]._tag === 'AccessorEmbed') {
        const rx_exv = rx_exvs[row];

        return encode({
          ...exv,
          ...rx_exv,
          _url: exv._url!,
        });
      }

      return encode(exv);
    });
  }
  return exvs.map((exv) => encode(exv));
};

export const controllerUrl = (exvs: T[]) => exvs.at(0)?._url;
export const withUrl       = (url: URL) => (exvs: T[]) => exvs.with(0, {...exvs.at(0)!, _url: url});
