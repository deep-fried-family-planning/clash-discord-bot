import * as Data from 'effect/Data';

export class DocumentFailure extends Data.TaggedError('DocumentFailure')<{
  cause: any;
}> {}

export class DocumentEncodeInputError extends Data.TaggedError('DocumentEncodeInputError')<{
  cause: any;
}> {}

export class DocumentDecodeItemError extends Data.TaggedError('DocumentDecodeItemError')<{
  cause: any;
}> {}

export class DocumentEncodeItemError extends Data.TaggedError('DocumentEncodeItemError')<{
  cause: any;
}> {}

export const isUpgraded = (item?: any) => {
  if (item?.upgraded) {
    return true;
  }
  return false;
};

export const noUndefinedEncoded = <I>(encoded: I) => {
  const enc = {...encoded} as any;
  const acc = {} as any;
  for (const k of Object.keys(encoded as any)) {
    if (enc[k] !== undefined) {
      acc[k] = enc[k];
    }
  }
  return acc as I;
};
