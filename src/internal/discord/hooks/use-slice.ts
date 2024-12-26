import type {Slice} from '#dfdis';
import type {str} from '#src/internal/pure/types-pure.ts';


export const createUseSlice = (
  slices: str[],
  params: URLSearchParams,
) => <
  T extends ReturnType<typeof Slice.make>,
>(
  slice: T,
) => {
  slices.push(slice.name);

  const exists = params.has(slice.name);

  if (exists) {
    return;
  }
};
