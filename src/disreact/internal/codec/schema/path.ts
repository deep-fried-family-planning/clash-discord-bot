import {Rest} from '#src/disreact/abstract/index.ts';
import {pipe, S} from '#src/internal/pure/effect.ts';
import {DateTime, Record} from 'effect';

export const RootId = S.String;
export const Ephem = S.transformLiterals(['0', false], ['1', true]);
export const DokenType = S.Literal(...Record.values(Rest.Tx).filter(Number.isInteger));
export const DokenValue = S.StringFromBase64Url;

export const DokenTTL = pipe(
  S.String,
  S.transform(S.DateTimeUtcFromNumber, {
    encode: (millis) => {
      // const uint8 = ;
      // new DataView(uint8.buffer).setFloat64(0, millis, false);
      const buffer = Buffer.from(new Uint8Array(8));
      buffer.writeDoubleBE(millis);
      return buffer.toString('base64url');
    },
    decode: (str) => {
      return Buffer.from(str.padEnd(8, '0'), 'base64url').readDoubleBE();
    },
  }),
);

export const DokenId = S.String;



export const PathParamParser = S.transform(
  S.URL,
  S.TemplateLiteralParser(
    '/m/', RootId, '/', Ephem, DokenType, '/', DokenId, '/', DokenTTL, '/', DokenValue,
  ),
  {
    encode: (params) => {
      const url = new URL('https://dffp.org');
      url.pathname = params;
      return url;
    },
    decode: (url) => {
      return url.pathname as any;
    },
  },
);



const PathParamDecoder = S.encodeUnknownSync(PathParamParser);
const PathParamEncoder = S.decodeSync(PathParamParser);


export const decodePath = (str: string) => {

};

const dat = DateTime.unsafeNow();
console.log(dat.epochMillis);
const enc = S.encodeUnknownSync(DokenTTL)(dat);
console.log(enc);
const dec = S.decodeUnknownSync(DokenTTL)(enc);
console.log(dec);
const dat2 = DateTime.unsafeNow();
console.log(dat2);
