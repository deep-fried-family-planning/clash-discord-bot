export * as DataTag from '#src/data/constants/data-tag.ts';
export type DataTag = typeof DataTag[keyof typeof DataTag];
export * as GsiKey from '#src/data/constants/gsi-key.ts';
export type GsiKey = typeof GsiKey[keyof typeof GsiKey];
export * as GsiName from '#src/data/constants/gsi-name.ts';
export type GsiName = typeof GsiName[keyof typeof GsiName];

export const enum ClanVerification {
  admin     = 0,
  elder     = 1,
  coleader  = 2,
  leader    = 3,
  developer = 4,
}

export const enum PlayerVerification {
  none      = 0,
  admin     = 1,
  token     = 2,
  developer = 3,
}
