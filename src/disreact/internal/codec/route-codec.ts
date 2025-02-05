/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
import {NONE_STR, Rest} from '#src/disreact/abstract/index.ts';
import type {EncodedDialog, EncodedMessage} from '#src/disreact/internal/codec/dsx-encoder.ts';
import {makeRoute} from '#src/disreact/internal/codec/utils.ts';
import {URL} from 'node:url';



export type DecodedRoute = {
  search: URLSearchParams;
  params: typeof main.Type;
};



export type EncodedRoute =
  | string;



const main = makeRoute('/jsx/:root/:node/:type/:flags/:id/:ttl/:token');



export const decodeMessageRouting = (rest: Rest.Interaction): DecodedRoute => {
  if (rest.type !== Rest.Rx.MESSAGE_COMPONENT) {
    throw new Error('Unsupported: Rest Type');
  }

  if (!rest.message?.embeds[0].image?.url) {
    throw new Error('Not Found: Routing URL');
  }

  const url    = new URL(rest.message.embeds[0].image.url);
  const params = main.decode(url.pathname);

  if (!params) {
    throw new Error('Unrecognized: Routing URL');
  }

  return {
    search: url.searchParams,
    params,
  };
};



export const decodeDialogRouting = (rest: Rest.Interaction): DecodedRoute => {
  if (rest.type !== Rest.Rx.MODAL_SUBMIT) {
    throw new Error('Unsupported: Rest Type');
  }

  if (!('data' in rest)) {
    throw new Error('Not Found: Routing URL (data)');
  }

  if (!('custom_id' in rest.data)) {
    throw new Error('Not Found: Routing URL (data.custom_id)');
  }

  const params = main.decode(rest.data.custom_id);

  if (!params) {
    throw new Error('Unrecognized: Routing URL');
  }

  return {
    search: new URLSearchParams(),
    params,
  };
};



export const encodeMessageRouting = (route: DecodedRoute, message: EncodedMessage): EncodedMessage => {
  const url    = new URL('https://dffp.org');
  url.pathname = main.encode(route.params);
  url.search   = route.search.toString();

  if (!message.embeds.length) {
    throw new Error('Unsupported: Message must have embeds');
  }

  if (message.embeds[0].image) {
    throw new Error('Unsupported: First embed must not have image');
  }

  const [first, ...embeds] = message.embeds;

  return {
    ...message,
    embeds: [
      {
        ...first,
        image: {
          url: url.href,
        },
      },
      ...embeds,
    ],
  };
};



export const encodeDialogRouting = (route: DecodedRoute, dialog: EncodedDialog): EncodedDialog => {
  if (dialog.custom_id !== NONE_STR) {
    throw new Error('Unsupported: Dialog must not have custom_id');
  }

  const path = main.encode(route.params);

  if (path.length > 100) {
    throw new Error('Critical: custom_id greater than 100 characters');
  }

  return {
    ...dialog,
    custom_id: path,
  };
};
