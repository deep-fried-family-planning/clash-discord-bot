import * as Key from '#src/database/setup/key-type.ts';
import * as Tag from '#src/database/constants/dtag.ts';
import * as Util from '#src/database/setup/arch.ts';
import * as gsitag from '#src/database/constants/gtag.ts';

export {
  Key as PkSk,
  Tag as DataTag,
  Util as Arch,
  gsitag as GSITag,
};

export type DataTag = Extract<typeof Tag[keyof typeof Tag], string>;
