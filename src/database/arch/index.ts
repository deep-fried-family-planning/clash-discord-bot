import * as Key from '#src/database/arch/key-type.ts';
import * as Tag from '#src/database/arch/dtag.ts';
import * as Util from 'src/database/arch/arch.ts';
import * as gsitag from '#src/database/arch/gtag.ts';

export {
  Key as PkSk,
  Tag as DataTag,
  Util as Arch,
  gsitag as GSITag,
};

export type DataTag = Extract<typeof Tag[keyof typeof Tag], string>;
