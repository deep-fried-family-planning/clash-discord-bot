import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {jsonEmbed} from '#src/internal/discord-old/util/embed.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import type {IxD} from '#src/internal/discord.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';

export const GIMME_DATA = {
  type       : 1,
  name       : 'gimme',
  description: 'devs & inner circle ONLY!!!',
  options    : {
    // kind: {
    //     type       : 3,
    //     name       : 'kind',
    //     description: 'kind',
    //     required   : true,
    //     choices    : [{
    //         name : 'clan',
    //         value: 'clan',
    //     }, {
    //         name : 'clan',
    //         value: 'clan',
    //     }, {
    //         name : 'clan',
    //         value: 'clan',
    //     }],
    // },
    pk: {
      type       : 3,
      name       : 'pk',
      description: 'not chemistry pk',
      required   : true,
    },
    sk: {
      type       : 3,
      name       : 'sk',
      description: 'be careful',
      required   : true,
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /gimme]
 */
export const gimmeData = (data: IxD, options: IxDS<typeof GIMME_DATA>) => E.gen(function* () {
  const [server, user] = yield* validateServer(data);

  if (!user.roles.includes(server.admin as snflk)) {
    return yield* new SlashUserError({issue: 'inner circle ONLY!!!'});
  }

  const ddb = yield* DynamoDBDocument.get({
    TableName     : process.env.DDB_OPERATIONS,
    ConsistentRead: true,
    Key           : {
      pk: options.pk,
      sk: options.sk,
    },
  });

  return {
    embeds: [jsonEmbed(ddb.Item)],
  };
});
