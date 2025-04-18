import {dtNowIso} from '#src/internal/discord-old/util/markdown.ts';
import {encodeRosterId, encodeUserId} from '#src/dynamo/schema/common-encoding.ts';
import {decodeDiscordRosterSignup, type DRosterSignup, type DRosterSignupKey, encodeDiscordRosterSignup} from '#src/dynamo/schema/discord-roster-signup.ts';
import {E} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';



export const rosterSignupCreate = (signup: DRosterSignup) => E.gen(function* () {
  const encoded = yield * encodeDiscordRosterSignup(signup);

  yield * DynamoDBDocument.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : encoded,
  });
});


export const rosterSignupRead = (signup: DRosterSignupKey) => E.gen(function* () {
  const pk = yield * encodeRosterId(signup.pk);
  const sk = yield * encodeUserId(signup.sk);

  const item = yield * DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {pk, sk},
  });

  if (!item.Item) {
    return null;
  }

  return yield * decodeDiscordRosterSignup(item.Item);
});


export const rosterSignupByRoster = (signup: Pick<DRosterSignupKey, 'pk'>) => E.gen(function* () {
  const pk = yield * encodeRosterId(signup.pk);

  const items = yield * DynamoDBDocument.query({
    TableName                : process.env.DDB_OPERATIONS,
    KeyConditionExpression   : 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': pk,
    },
  });

  if (!items.Items) {
    return [];
  }

  return yield * E.all(items.Items.map((i) => decodeDiscordRosterSignup(i)));
});


export const rosterSignupUpdate = (signup: DRosterSignup) => E.gen(function* () {
  const encoded = yield * encodeDiscordRosterSignup(signup);

  const item = yield * DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {
      pk: encoded.pk,
      sk: encoded.sk,
    },
  });

  yield * DynamoDBDocument.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : {
      ...item.Item,
      ...encoded,
      updated: dtNowIso(),
    },
  });
});


export const rosterSignupDelete = (signup: DRosterSignupKey) => E.gen(function* () {
  const pk = yield * encodeRosterId(signup.pk);
  const sk = yield * encodeUserId(signup.sk);

  yield * DynamoDBDocument.delete({
    TableName: process.env.DDB_OPERATIONS,
    Key      : {pk, sk},
  });
});
