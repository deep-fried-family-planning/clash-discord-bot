import {compressStack, decompressStack} from '#src/disreact/codec/entities/compression.ts';

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

  it('markdown compression', () => {
    const obj = {
      'Linker:0': [{s: '### About\n' +
          'Signup to participate in **O**re **D**uring **CWL** (ODCWL) so you can war in multiple clans during CWL and get 2x ore!\n' +
          '\n' +
          'This roster is for normal wars during CWL. You can participate in both kinds of wars at once. Ask clan leadership if you\'re confused.\n' +
          '\n' +
          '### Process\n' +
          '1. Make sure you\'re in your CWL clan by CWL war search.\n' +
          '2. After CWL search, go to the ODCWL clan before it\'s normal war search.\n' +
          '3. After ODCWL war search starts, you can hop back to your CWL clan and do your hits.\n' +
          '4. Once ODCWL war starts, you can hop over, do your normal war hits. \n' +
          '5. Hop between clans again, rinse, and repeat!\n' +
          '\n' +
          '**Remember: ** This is **not** the signup page for CWL. Signing up for ODCWL does **not** mean you are signed up for actual **CWL**. Remember to signup for both.'}],
    };

    const compressed = compressStack(obj);
    const decompress = decompressStack(compressed);

    console.log(obj['Linker:0'][0].s.length);

    expect(compressed.length).toMatchInlineSnapshot(`588`);
    expect(compressed).toMatchInlineSnapshot(`"eJxtUsFu1DAQPdBTvuKhPZRakQUFLtyq9sCh1SJAQhydZJJYSezI41B67CfwCdz4Jr6GsZPdLghppXXseW_evDePv26tGyi8e_nj8Sf_fna22-1wVfklFp9s55YZ0WM2IdraziYSrINSe6UCyf-NUkuwrpPj9ZdbpfBifyOHC7DHg19QG4d7ExJoWsZo55FQj8YxmhUnxTCuQUcRl9_hAz0vis-9ZQTPkQTJaH2A82EyY-I6hWp83Zr8o7DyscdgXcPw7YoyEd7VpHHFQ9aAkUxDgXs7w7ZJ7rnMVHvXLkyNLorkxIfga2IuXmncmYHAi9RspdJHTiHPkAmrh3xOAzOZUPe6uJR-bZojPayXJTqfTI09Ibu1gUnmFNJ4zifTHoleH4hWyNMTOMrsXB797v2MytRD6vG3vmR0s132NrIu3mjsxZRT0v-w-W8UyiPyRFwmQfFW431qSvGeyG0Bm85YV0KiYipz60AzmSj5KvWRJpoq2TpZHOS45aeU81G-kzG87t5sOsr557DTQqbk5SHdraIbT0_QiUwOBSasHNQcqk0dF5G9LarGQUKyaeuWytLm6D_KzAYp"`);
    expect(decompress).toEqual(obj);
  });
});
