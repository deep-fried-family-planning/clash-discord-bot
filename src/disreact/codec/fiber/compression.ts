import * as MsgPack from '@msgpack/msgpack';
import * as pako from 'pako';



export const compress = (data: Record<string, any>): string => {
  const binary     = MsgPack.encode(data);
  const compressed = pako.deflate(binary);
  return Buffer.from(compressed).toString('base64url');
};

export const decompress = (encoded: string): Record<string, any> => {
  const compressed   = Buffer.from(encoded, 'base64url');
  const decompressed = pako.inflate(compressed);
  return MsgPack.decode(decompressed) as Record<string, any>;
};
