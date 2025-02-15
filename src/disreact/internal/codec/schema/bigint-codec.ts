export const bnToB64 = (bn: any) => {
  let hex = BigInt(bn).toString(16);
  if (hex.length % 2) {
    hex = '0' + hex;
  }

  const bin = [] as any;
  let i = 0;
  let d;
  let b;
  while (i < hex.length) {
    d = parseInt(hex.slice(i, i + 2), 16);
    b = String.fromCharCode(d);
    bin.push(b);
    i += 2;
  }

  return Buffer.from(bin, 'binary').toString('base64url');
};

export const b64ToBn = (b64: any) => {
  const bin = Buffer.from(b64, 'base64url').toString('binary');
  const hex = [] as any[];

  bin.split('').forEach((ch) => {
    let h = ch.charCodeAt(0).toString(16);
    if (h.length % 2) {
      h = '0' + h;
    }
    hex.push(h);
  });

  return BigInt('0x' + hex.join(''));
};
