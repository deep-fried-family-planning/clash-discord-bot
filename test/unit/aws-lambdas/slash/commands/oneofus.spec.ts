import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {afterAll, beforeAll, describe, vi} from 'vitest';
import {E} from '#src/internals/re-exports/effect.ts';
import {oneofus} from '#src/aws-lambdas/slash/commands/oneofus.ts';
import {LambdaLayer} from '#src/aws-lambdas/slash';
import {Client} from 'clashofclans.js';
import {DiscordServer, DiscordServerEncode} from '#src/database/discord-server.ts';

const base = new DynamoDB({region: 'us-east-1'});
const dynamoDB = DynamoDBDocument.from(base);

process.env.DDB_OPERATIONS = 'qual-dffp-clash-discord-bot-operations';

vi.mock('clashofclans.js', async (importActual) => {
    const actual = await importActual();

    actual.Client.prototype.getPlayer = vi.fn();
    actual.Client.prototype.verifyPlayerToken = vi.fn();

    console.log(actual);

    return actual;
});

describe('[SLASH /oneofus]: player/discord account linking', () => {
    const data = {
        guild_id: '123',
        member  : {
            user: {
                id: '123',
            },
            roles: [''],
        },
    };
    const options = {
        player_tag: '#0289PYLQGRJCUV',
        api_token : '',
    };

    beforeAll(async () => {
        await dynamoDB.put({
            TableName: 'qual-dffp-clash-discord-bot-operations',
            Item     : {
                pk: 'u-123',
                sk: 'p-#0289PYLQGRJCUV',
            },
        });
    });

    afterAll(async () => {
        await dynamoDB.delete({
            TableName: 'qual-dffp-clash-discord-bot-operations',
            Key      : {
                pk: 'u-123',
                sk: 'p-#0289PYLQGRJCUV',
            },
        });
        await dynamoDB.delete({
            TableName: 'qual-dffp-clash-discord-bot-operations',
            Key      : {
                pk: 's-123',
                sk: 'now',
            },
        });
    });

    describe('given unrecognized server', () => {
        it('failure: when linking accounts', async () => {
            const testable = E.provide(oneofus(data, options), LambdaLayer);

            await expect(E.runPromise(testable)).rejects.toMatchInlineSnapshot(`[(FiberFailure) Error: the current server is not recognized]`);
        });
    });

    describe('given recognized server', () => {
        beforeAll(async () => {
            await dynamoDB.put({
                TableName: 'qual-dffp-clash-discord-bot-operations',
                Item     : E.runSync(DiscordServerEncode(DiscordServer.make({
                    pk           : 's-123',
                    sk           : 'now',
                    type         : 'DiscordServer',
                    version      : '1.0.0',
                    created      : new Date(),
                    updated      : new Date(),
                    gsi_server_id: `s-123`,
                    admin        : '',
                    polling      : false,
                }))),
            });
        });

        it('success: when linking accounts', async () => {
            Client.prototype.getPlayer.mockResolvedValue({tag: '#0289PYLQGRJCUV'});
            Client.prototype.verifyPlayerToken.mockResolvedValue(true);

            const testable = E.provide(oneofus(data, options), LambdaLayer);

            await expect(E.runPromise(testable)).resolves.toMatchInlineSnapshot(`
              {
                "embeds": [
                  {
                    "description": "noice",
                  },
                ],
              }
            `);
        });
    });

    // describe('given caller server is linked', () => {
    //     beforeEach(async () => {
    //         await dynamoDB.put({
    //             TableName: 'qual-dffp-clash-discord-bot-operations',
    //             Item     : {
    //                 pk: 'server-123',
    //                 sk: 'now',
    //             },
    //         });
    //     });
    // });

    // it.skip('adrian\'s shit', async () => {
    //     await dynamoDB.get({
    //         TableName: 'find this NAME from either terraform files or AWS', // this is NOT an ARN or amazon resource number, just the name
    //         Key      : {
    //             pk: '',
    //             sk: '',
    //         },
    //     });
    //
    //     // if this fails with resource not found, your creds work
    // });
});
