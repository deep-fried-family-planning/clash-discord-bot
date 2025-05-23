import console from 'node:console';
import {URL} from 'node:url';

export const bindApiCall = (baseUrl: string) =>
  async <
    RJSON = {},
    Q extends {[key: string]: string | number | boolean} = {},
    B = {},
  >(ops: {
    method   : string;
    path     : string;
    headers? : {[key: string]: string};
    bearer?  : string;
    query?   : Q;
    body?    : RequestInit['body'];
    jsonBody?: B;
    form?    : {[key: string]: string};
  }) => {
    const url = new URL(`${baseUrl}${ops.path}`);

    if (ops.query) {
      for (const key in ops.query) {
        url.searchParams.append(key, `${ops.query[key]}`);
      }
    }

    const req = new Request(url, {
      method: ops.method,
      body  : ops.jsonBody
        ? JSON.stringify(ops.jsonBody)
        : ops.body
        ?? null,
    });

    if (ops.headers) {
      for (const key in ops.headers) {
        req.headers.append(key, ops.headers[key]);
      }
    }

    if (ops.bearer) {
      req.headers.set('Authorization', `Bearer ${ops.bearer}`);
    }

    if (ops.jsonBody) {
      req.headers.set('Content-Type', 'application/json');
    }

    console.log(`[${url.hostname}][${ops.method} ${ops.path}]:`, {
      headers: req.headers,
      body   : ops.body ?? ops.body,
    });

    const resp = await fetch(req);

    console.log(`[${url.hostname}][${ops.method} ${ops.path}]: ${resp.status} ${resp.statusText}`, {
      headers: resp.headers,
    });

    if (!resp.ok) {
      const text = await resp.text();

      const err = new Error(`[${url.hostname}][${ops.method} ${url.toString()}]: ${resp.status} ${resp.statusText}\n${text}`);

      throw err;
    }

    let json: RJSON;

    try {
      json = await resp.json() as RJSON;
    }

    catch (e) {
      json = {} as RJSON;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    resp.contents = json;

    return resp as Response & {contents: RJSON};
  };
