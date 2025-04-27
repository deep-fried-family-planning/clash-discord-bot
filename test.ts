import type * as HttpClient from '@effect/platform/HttpClient';
import * as HttpClientError from '@effect/platform/HttpClientError';
import * as HttpClientRequest from '@effect/platform/HttpClientRequest';
import * as HttpClientResponse from '@effect/platform/HttpClientResponse';
import * as Effect from 'effect/Effect';
import type {ParseError} from 'effect/ParseResult';
import type * as S from 'effect/Schema';

export const make = (
  httpClient: HttpClient.HttpClient,
  options: {
    readonly transformClient?: ((client: HttpClient.HttpClient) => Effect.Effect<HttpClient.HttpClient>) | undefined;
  } = {},
): Client => {
  const unexpectedStatus = (request: HttpClientRequest.HttpClientRequest, response: HttpClientResponse.HttpClientResponse) =>
    Effect.flatMap(
      Effect.orElseSucceed(response.text, () => 'Unexpected status code'),
      (description) =>
        Effect.fail(new HttpClientError.ResponseError({
          request,
          response,
          reason: 'StatusCode',
          description,
        })),
    );
  const applyClientTransform = (client: HttpClient.HttpClient): Effect.Effect<HttpClient.HttpClient> =>
    options.transformClient ? options.transformClient(client) : Effect.succeed(client);
  const decodeError = <A, I, R>(response: HttpClientResponse.HttpClientResponse, schema: S.Schema<A, I, R>) => Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)(response), Effect.fail);
  return {
    getClanWarLeagueGroup: (clanTag) => HttpClientRequest.make('GET')(`/clans/${clanTag}/currentwar/leaguegroup`).pipe(
      Effect.succeed,
      Effect.flatMap((request) => Effect.flatMap(applyClientTransform(httpClient), (httpClient) => Effect.flatMap(httpClient.execute(request), HttpClientResponse.matchStatus({
        orElse: (response) => unexpectedStatus(request, response),
      })))),
      Effect.scoped,
    ),
  };
};

export interface Client {
  readonly getClanWarLeagueGroup: (clanTag: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>;
}
