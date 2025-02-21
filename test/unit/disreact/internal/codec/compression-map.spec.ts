import {makeCompressionMap} from '#src/disreact/codec/compression-map.ts';



describe('makeCompressionMap', () => {
  it('should flatten a nested object', () => {
    const input = {a: {b: {c: 42, d: 'test'}, e: [1, 2, 3]}, f: 'hello'};
    const output = makeCompressionMap(input);
    const expected = {
      'a.b.c' : 42,
      'a.b.d' : 'test',
      'a.e[0]': 1,
      'a.e[1]': 2,
      'a.e[2]': 3,
      f       : 'hello',
    };
    expect(output).toEqual(expected);
  });

  it('should handle arrays of objects', () => {
    const input = {g: [{h: 'value1'}, {i: 'value2'}]};
    const output = makeCompressionMap(input);
    const expected = {
      'g[0].h': 'value1',
      'g[1].i': 'value2',
    };
    expect(output).toEqual(expected);
  });

  it('should handle empty objects and arrays', () => {
    const input = {emptyObj: {}, emptyArr: []};
    const output = makeCompressionMap(input);
    const expected = {};
    expect(output).toEqual(expected);
  });

  it('should process deeply nested structures', () => {
    const input = {a: {b: {c: [{d: 1}]}}};
    const output = makeCompressionMap(input);
    const expected = {
      'a.b.c[0].d': 1,
    };
    expect(output).toEqual(expected);
  });

  it('should handle primitive values at the root level', () => {
    const input = {a: 42, b: 'test', c: true};
    const output = makeCompressionMap(input);
    const expected = {
      a: 42,
      b: 'test',
      c: true,
    };
    expect(output).toEqual(expected);
  });

  it('key maps real discord messages', () => {
    const message =  {
      application_id: '1256809603715436606',
      attachments   : [],
      author        : {
        avatar                : '5f71735406403cdc51158038e24bb671',
        avatar_decoration_data: null,
        bot                   : true,
        clan                  : null,
        discriminator         : '5344',
        global_name           : null,
        id                    : '1256809603715436606',
        primary_guild         : null,
        public_flags          : 524288,
        username              : 'QualDeepFryer',
      },
      channel_id: '1317321691809972254',
      components: [
        {
          components: [
            {
              custom_id: 'buttons:1:button:0',
              id       : 2,
              label    : 'Back',
              style    : 2,
              type     : 2,
            },
            {
              custom_id: 'CloseButton:1:button:0',
              id       : 3,
              label    : 'Close 0',
              style    : 1,
              type     : 2,
            },
            {
              custom_id: 'buttons:1:button:2',
              id       : 4,
              label    : 'Modal',
              style    : 2,
              type     : 2,
            },
          ],
          id  : 1,
          type: 1,
        },
      ],
      content         : '',
      edited_timestamp: '2025-02-12T03:13:02.128660+00:00',
      embeds          : [
        {
          content_scan_version: 0,
          description         : 'Use the buttons below to link new accounts and manage your settings with DeepFryer.',
          image               : {
            flags    : 0,
            height   : 0,
            proxy_url: 'https://images-ext-1.discordapp.net/external/yHQXUMuE4roeVMyG5Ecv-2aVBCFTWfU3KNdWH77RAgQ/%3FLink%253A0%253Amessage%253A0%253Abuttons%253A1%253ACloseButton%253A1%3D%25255B%25257B%252522s%252522%25253A0%25257D%25252C%25257B%25257D%25255D/https/dffp.org/dsx/Link/5/64/1339071720211873792/1739330817438/aW50ZXJhY3Rpb246MTMzOTA3MTcyMDIxMTg3Mzc5MjpuU2ZTTlYyWURvWmZpelJCYmZhWTJ4d29zSXNYY0tzc2w3QzBXM3hGTmNxaXRGaWpxQWVDTEZ1aHRvRmtaN3UyVk1MME41TjJJWTg3QXRhNWQ4S3hGN0tGS1N0aVhUV0pPOUVJVG01UHZneHk3ZHk1YmZPUzBvenk3RlV1VzJUTA',
            url      : 'https://dffp.org/dsx/Link/5/64/1339071720211873792/1739330817438/aW50ZXJhY3Rpb246MTMzOTA3MTcyMDIxMTg3Mzc5MjpuU2ZTTlYyWURvWmZpelJCYmZhWTJ4d29zSXNYY0tzc2w3QzBXM3hGTmNxaXRGaWpxQWVDTEZ1aHRvRmtaN3UyVk1MME41TjJJWTg3QXRhNWQ4S3hGN0tGS1N0aVhUV0pPOUVJVG01UHZneHk3ZHk1YmZPUzBvenk3RlV1VzJUTA?Link%3A0%3Amessage%3A0%3Abuttons%3A1%3ACloseButton%3A1=%255B%257B%2522s%2522%253A0%257D%252C%257B%257D%255D',
            width    : 0,
          },
          title: 'Link Management',
          type : 'rich',
        },
      ],
      flags               : 64,
      id                  : '1339071723470979082',
      interaction_metadata: {
        authorizing_integration_owners: {0: '1287829383544963154'},
        id                            : '1339071720211873792',
        interacted_message_id         : '1339069663870586920',
        type                          : 3,
        user                          : {
          avatar                : '7ad8c035b5caa70e2132e550aba50fcf',
          avatar_decoration_data: null,
          clan                  : null,
          discriminator         : '0',
          global_name           : 'NotStr8DontH8',
          id                    : '644290645350940692',
          primary_guild         : null,
          public_flags          : 4194304,
          username              : 'yourguyryry',
        },
      },
      mention_everyone : false,
      mention_roles    : [],
      mentions         : [],
      message_reference: {
        channel_id: '1317321691809972254',
        guild_id  : '1287829383544963154',
        message_id: '1339069663870586920',
        type      : 0,
      },
      pinned    : false,
      position  : 171,
      timestamp : '2025-02-12T03:12:57.625000+00:00',
      tts       : false,
      type      : 19,
      webhook_id: '1256809603715436606',
    };
    const output = makeCompressionMap(message);
    expect(output).toMatchInlineSnapshot(`
      {
        "application_id": "1256809603715436606",
        "author.avatar": "5f71735406403cdc51158038e24bb671",
        "author.avatar_decoration_data": null,
        "author.bot": true,
        "author.clan": null,
        "author.discriminator": "5344",
        "author.global_name": null,
        "author.id": "1256809603715436606",
        "author.primary_guild": null,
        "author.public_flags": 524288,
        "author.username": "QualDeepFryer",
        "channel_id": "1317321691809972254",
        "components[0].components[0].custom_id": "buttons:1:button:0",
        "components[0].components[0].id": 2,
        "components[0].components[0].label": "Back",
        "components[0].components[0].style": 2,
        "components[0].components[0].type": 2,
        "components[0].components[1].custom_id": "CloseButton:1:button:0",
        "components[0].components[1].id": 3,
        "components[0].components[1].label": "Close 0",
        "components[0].components[1].style": 1,
        "components[0].components[1].type": 2,
        "components[0].components[2].custom_id": "buttons:1:button:2",
        "components[0].components[2].id": 4,
        "components[0].components[2].label": "Modal",
        "components[0].components[2].style": 2,
        "components[0].components[2].type": 2,
        "components[0].id": 1,
        "components[0].type": 1,
        "content": "",
        "edited_timestamp": "2025-02-12T03:13:02.128660+00:00",
        "embeds[0].content_scan_version": 0,
        "embeds[0].description": "Use the buttons below to link new accounts and manage your settings with DeepFryer.",
        "embeds[0].image.flags": 0,
        "embeds[0].image.height": 0,
        "embeds[0].image.proxy_url": "https://images-ext-1.discordapp.net/external/yHQXUMuE4roeVMyG5Ecv-2aVBCFTWfU3KNdWH77RAgQ/%3FLink%253A0%253Amessage%253A0%253Abuttons%253A1%253ACloseButton%253A1%3D%25255B%25257B%252522s%252522%25253A0%25257D%25252C%25257B%25257D%25255D/https/dffp.org/dsx/Link/5/64/1339071720211873792/1739330817438/aW50ZXJhY3Rpb246MTMzOTA3MTcyMDIxMTg3Mzc5MjpuU2ZTTlYyWURvWmZpelJCYmZhWTJ4d29zSXNYY0tzc2w3QzBXM3hGTmNxaXRGaWpxQWVDTEZ1aHRvRmtaN3UyVk1MME41TjJJWTg3QXRhNWQ4S3hGN0tGS1N0aVhUV0pPOUVJVG01UHZneHk3ZHk1YmZPUzBvenk3RlV1VzJUTA",
        "embeds[0].image.url": "https://dffp.org/dsx/Link/5/64/1339071720211873792/1739330817438/aW50ZXJhY3Rpb246MTMzOTA3MTcyMDIxMTg3Mzc5MjpuU2ZTTlYyWURvWmZpelJCYmZhWTJ4d29zSXNYY0tzc2w3QzBXM3hGTmNxaXRGaWpxQWVDTEZ1aHRvRmtaN3UyVk1MME41TjJJWTg3QXRhNWQ4S3hGN0tGS1N0aVhUV0pPOUVJVG01UHZneHk3ZHk1YmZPUzBvenk3RlV1VzJUTA?Link%3A0%3Amessage%3A0%3Abuttons%3A1%3ACloseButton%3A1=%255B%257B%2522s%2522%253A0%257D%252C%257B%257D%255D",
        "embeds[0].image.width": 0,
        "embeds[0].title": "Link Management",
        "embeds[0].type": "rich",
        "flags": 64,
        "id": "1339071723470979082",
        "interaction_metadata.authorizing_integration_owners.0": "1287829383544963154",
        "interaction_metadata.id": "1339071720211873792",
        "interaction_metadata.interacted_message_id": "1339069663870586920",
        "interaction_metadata.type": 3,
        "interaction_metadata.user.avatar": "7ad8c035b5caa70e2132e550aba50fcf",
        "interaction_metadata.user.avatar_decoration_data": null,
        "interaction_metadata.user.clan": null,
        "interaction_metadata.user.discriminator": "0",
        "interaction_metadata.user.global_name": "NotStr8DontH8",
        "interaction_metadata.user.id": "644290645350940692",
        "interaction_metadata.user.primary_guild": null,
        "interaction_metadata.user.public_flags": 4194304,
        "interaction_metadata.user.username": "yourguyryry",
        "mention_everyone": false,
        "message_reference.channel_id": "1317321691809972254",
        "message_reference.guild_id": "1287829383544963154",
        "message_reference.message_id": "1339069663870586920",
        "message_reference.type": 0,
        "pinned": false,
        "position": 171,
        "timestamp": "2025-02-12T03:12:57.625000+00:00",
        "tts": false,
        "type": 19,
        "webhook_id": "1256809603715436606",
      }
    `);
  });
});
