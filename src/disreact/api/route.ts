import type {Ix} from '#src/internal/disreact/virtual/entities/dapi.ts';



export type DisReactRoute = {
  root  : string;
  node  : string;
  search: URLSearchParams;
};


export const decodeFromURL = (url: URL): DisReactRoute => {
  return {
    root  : '',
    node  : '',
    search: new URLSearchParams(url.searchParams),
  };
};


export const decodeFromPathname = (pathname: string): DisReactRoute => {
  const [root, node] = pathname.split('/');
  const search       = new URLSearchParams();

  return {
    root,
    node,
    search,
  };
};


export const getInteractionRoutingInfo = (rest: Ix): DisReactRoute => {

};
