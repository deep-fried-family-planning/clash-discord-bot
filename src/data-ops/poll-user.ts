import {User, UserPartition, UserPlayer, UserServerLink} from '#src/data/index.ts';
import * as Array from 'effect/Array';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Record from 'effect/Record';

export const pollUser = E.fn('pollUser')(function* (user_id: string) {
  const userPartition = yield* UserPartition.get({
    KeyConditionExpression: {
      pk: user_id,
    },
  });

  const [user] = userPartition.Items.filter((item) => User.is(item));

  const currentTags = pipe(
    userPartition.Items,
    Array.filter((item) => UserPlayer.is(item)),
    Record.fromIterableWith((item) => [item.sk, item.name]),
  );

  const serverLinks = pipe(
    userPartition.Items,
    Array.filter((item) => UserServerLink.is(item)),
    Record.fromIterableWith((item) => [item.sk, item]),
  );

  for (const server_id of user.servers.values()) {
    if (!(server_id in serverLinks)) {
      const newLink = UserServerLink.make({
        pk  : user_id,
        sk  : server_id,
        pkl : server_id,
        skl : user_id,
        tags: currentTags,
      });

      yield* UserServerLink.put({
        Item: newLink,
      });
      continue;
    }

    const differences = pipe(
      serverLinks[server_id].tags,
      Record.difference(currentTags),
      Record.size,
    );

    if (differences) {
      const updatedLink = UserServerLink.make({
        ...serverLinks[server_id],
        tags: currentTags,
      });

      yield* UserServerLink.put({
        Item: updatedLink,
      });
    }
  }

  for (const server_id of Record.keys(serverLinks)) {
    if (user.servers.has(server_id)) {
      continue;
    }
    yield* UserServerLink.del({
      Key: {
        pk: user_id,
        sk: server_id,
      },
    });
  }
});
