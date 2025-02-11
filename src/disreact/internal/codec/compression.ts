import * as MsgPack from '@msgpack/msgpack';
import * as pako from 'pako';



export const compressStack = (data: Record<string, any>): string => {
  const binary     = MsgPack.encode(data, {useBigInt64: true, maxDepth: 1000, ignoreUndefined: true, initialBufferSize: 4096, sortKeys: true});
  const compressed = pako.deflate(binary);
  return b64UrlSafe(compressed);
};



export const decompressStack = (url: string): Record<string, any> => {
  const compressed   = b64FromUrl(url);
  const decompressed = pako.inflate(compressed);
  return MsgPack.decode(decompressed) as Record<string, any>;
};



const b64UrlSafe = (buffer: Uint8Array) => Buffer.from(buffer).toString('base64url');

const b64FromUrl = (url: string) => Buffer.from(url, 'base64url');
