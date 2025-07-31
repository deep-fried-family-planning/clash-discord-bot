import * as Effect from 'effect/Effect';
import type * as Doken from '#disreact/adaptor/internal/Doken.ts';
import type * as Option from 'effect/Option';

export interface Dokens {
  latest: Doken.Latest;
  active: Option.Option<Doken.Active>;
}
