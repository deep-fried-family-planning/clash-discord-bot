import {D, Kv, p} from '#src/internal/pure/effect';
import type {alias} from '#src/internal/pure/types-pure.ts';
import {f} from '#src/internal/pure/effect.ts';


export type Alias = D.TaggedEnum<{
    Initial: {alias: alias};
    Reverse: {alias: alias};
}>;
export const Alias = D.taggedEnum<Alias>();


export const $pure = <T extends Alias>(self: T) => self;


export const $flip = Alias.$match({
    Initial: (self) => Alias.Reverse({alias: p(self.alias, Kv.mapEntries((v, k) => [v, k]))}),
    Reverse: (self) => Alias.Initial({alias: p(self.alias, Kv.mapEntries((v, k) => [v, k]))}),
});


export const $lift = f($pure, (self) => self.alias);


export const $init = (alias: alias | Alias = {}) => {
    if (Alias.$is('Initial')(alias)) {
        return alias;
    }
    if (Alias.$is('Reverse')(alias)) {
        return $flip(alias);
    }
    return Alias.Initial({alias});
};

