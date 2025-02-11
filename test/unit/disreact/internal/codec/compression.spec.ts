import { compressStack, decompressStack } from '#src/disreact/internal/codec/compression.ts';

describe('compression', () => {
  it('Url compression', () => {
    const url = {
      'TestMessage:0': [
        {
          s: 0,
        },
      ],
    };

    const compress = compressStack(url);
    const decompress = decompressStack(compress);


    expect(decompress).toEqual(url);
  });
});
