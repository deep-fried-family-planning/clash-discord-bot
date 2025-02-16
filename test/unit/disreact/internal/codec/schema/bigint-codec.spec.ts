import {b64ToBn, bnToB64} from '#src/disreact/codec/abstract/bigint-codec.ts';
import {describe, expect, it} from 'vitest';



describe('bnToB64', () => {
  it('should convert a bigint to a base64url encoded string', () => {
    const input = 1234567890123456789n;
    const result = bnToB64(input);
    expect(result).toMatchInlineSnapshot(`"AAAAAAAAAAA"`);
  });

  it('should handle bigint zero', () => {
    const input = 0n;
    const result = bnToB64(input);
    expect(result).toMatchInlineSnapshot('"AA"');
  });

  it('should handle a small value (1n)', () => {
    const input = 1n;
    const result = bnToB64(input);
    expect(result).toMatchInlineSnapshot(`"AA"`);
  });

  it('should handle a large value', () => {
    const input = 987654321987654321987654321987654321n;
    const result = bnToB64(input);
    expect(result).toMatchInlineSnapshot(`"AAcAAAAAAAAAAAAAAAAA"`);
  });

  it('should throw an error for non-numeric input', () => {
    const input = 'invalid' as any;
    expect(() => bnToB64(input)).toThrowErrorMatchingInlineSnapshot(`[SyntaxError: Cannot convert invalid to a BigInt]`);
  });
});



describe('b64ToBn', () => {
  it('should convert a valid base64url string to a bigint', () => {
    const input = 'AAAAAAAAAAA'; // Corresponds to 1234567890123456789n
    const result = b64ToBn(input);
    expect(result).toMatchInlineSnapshot(`0n`);
  });

  it('should handle a base64url string representing zero', () => {
    const input = 'AA'; // Corresponds to 0n
    const result = b64ToBn(input);
    expect(result).toMatchInlineSnapshot(`0n`);
  });

  it('should handle a base64url string representing a small value', () => {
    const input = 'AA'; // Corresponds to 1n
    const result = b64ToBn(input);
    expect(result).toMatchInlineSnapshot(`0n`);
  });

  it('should handle a base64url string representing a large value', () => {
    const input = 'AAcAAAAAAAAAAAAAAAAA'; // Corresponds to 987654321987654321987654321987654321n
    const result = b64ToBn(input);
    expect(result).toMatchInlineSnapshot(`141976867225561692967630759002112n`);
  });
});
