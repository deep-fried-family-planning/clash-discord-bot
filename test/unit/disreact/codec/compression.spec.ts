import {compressStack, decompressStack} from '#src/disreact/codec/compression.ts';

describe('compression', () => {
  it('Url compression', () => {
    const url = {
      'TestMessage:0': [
        {
          s: 0,
        },
      ],
    };

    const compressed = compressStack(url);
    const decompress = decompressStack(compressed);

    expect(compressed.length).toMatchInlineSnapshot(`38`);
    expect(compressed).toMatchInlineSnapshot(`"eJxrXBuSWlzim1pcnJieamUwsXFhMQMAWi0IJA"`);
    expect(decompress).toEqual(url);
  });

  it('route compression', () => {
    const url = {
      root  : 'JSXTestMessage',
      dialog: 'JSXDialogTest',
      ttl   : 1234556,
      type  : 9,
      flags : 64,
      stacks: {
          'OmniPrivate:0'                                  : [{s: 0}, {}],
          'OmniPrivate:0:message:0:buttons:1:CloseButton:2': [{s: 1}, {s: 'sdlfkjasdlfjasldkfjasdl;fkjasldkfjasl;dkf'}],
          'OmniPrivate:0:message:0:buttons:1:CloseButton:3': [{s: 1}, {}],
        },
    };

    const compressed = compressStack(url.stacks);
    const decompress = decompressStack(compressed);

    expect(`/${url.root}/${url.dialog}/${url.ttl}/${url.type}/${url.flags}`.length).toMatchInlineSnapshot(`42`);
    expect(compressed.length).toMatchInlineSnapshot(`132`);
    expect(compressed).toMatchInlineSnapshot(`"eJxrXuufm5cZUJRZlliSamUwqXFhMUPDTX0UQavc1OLixHQQK6m0pCQ_r9jK0Mo5J7841QnMtTICaWME4puaxSk5adlZiSAKSOakZKeBOdZgQSg3xxpIk2qHMdiOBgAZokT8"`);
    expect(decompress).toEqual(url.stacks);
  });
});
