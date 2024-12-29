import {NONE} from '#discord/entities/constants/constants.ts';
import {ExPath} from '#discord/entities/routing/ex-path.ts';
import type {RestEmbed} from '#pure/dfx';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import {D, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {URL} from 'node:url';


export type Path = ExPath;
export const Path = ExPath;


export type Type = D.TaggedEnum<{
  Controller   : {_url?: URL} & RestEmbed;
  Basic        : {_url?: URL; ref: str} & RestEmbed;
  AccessorEmbed: {_url?: URL} & {accessors: str[]} & RestEmbed;
}>;


export const Enum            = D.taggedEnum<Type>();
export const BasicEmbed      = Enum.Basic;
export const AccessorEmbed   = Enum.AccessorEmbed;
export const EmbedController = Enum.Controller;


export const ControllerTag    = 'Controller';
export const BasicTag         = 'Basic';
export const AccessorEmbedTag = 'AccessorEmbed';


export const match           = Enum.$match;
export const is              = Enum.$is;
export const isController    = is('Controller');
export const isBasic         = is('Basic');
export const isAccessorEmbed = is('AccessorEmbed');


export const make = (exv: Type): Type => {
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
    return AccessorEmbed({
      ...base,
      accessors: ids,
    });
  }

  const route = url.pathname === '/'
    ? ExPath.empty()
    : ExPath.parse(url.pathname);

  if (route.kind === 'Controller') {
    return EmbedController(base);
  }

  return BasicEmbed({
    ...base,
    ref: route.ref,
  });
};


export const encode = (exv: Type) => {
  let {_tag, _url, ...rest} = exv;
  let accessors             = [] as str[];
  let ref                   = NONE;

  if (isAccessorEmbed(exv)) {
    ({_tag, _url, accessors, ...rest} = exv);
  }
  if (isBasic(exv)) {
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

  return {
    ...rest,
    image: {
      ...rest.image,
      url: _url!.href,
    },
  } as RestEmbed;
};


export const decodeAll = (rest: RestEmbed[]) => rest.map((r) => decode(r));

export const encodeAll = (exvs: Type[], rx_exvs?: Type[]): RestEmbed[] => {
  if (rx_exvs && exvs.length === rx_exvs.length) {
    return exvs.map((exv, row) => {
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

export const controllerUrl = (exvs: Type[]) => exvs.at(0)?._url;
export const withUrl       = (url: URL) => (exvs: Type[]) => exvs.with(0, {...exvs.at(0)!, _url: url});
