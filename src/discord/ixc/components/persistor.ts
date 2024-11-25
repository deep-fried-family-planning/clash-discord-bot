import type {MadeSelect} from '#src/discord/ixc/components/make-select.ts';
import type {MadeButton} from '#src/discord/ixc/components/make-button.ts';
import type {MadeSelectChannel} from '#src/discord/ixc/components/make-select-channel.ts';
import type {MadeSelectUser} from '#src/discord/ixc/components/make-select-user.ts';
import type {MadeSelectRole} from '#src/discord/ixc/components/make-select-role.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {reduceL} from '#src/internal/pure/pure-list';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Ax} from '#src/discord/ixc/store/derive-action.ts';


export const encodePersist = (
    ...components: (MadeSelect | MadeButton | MadeSelectChannel | MadeSelectUser | MadeSelectRole)[]
) => {
    return JSON.stringify(pipe(
        components,
        reduceL(emptyKV<str, str[]>(), (cs, c) => {
            cs[c.id.predicate] = c.values;
            return cs;
        }),
    ));
};


export const decodePersist = (components?: str) => components
    ? JSON.parse(components) as Record<str, str[]>
    : {};


export const extractPersist = (
    decodedPersist: Record<str, str[]>,
    ax: Ax,
    made: (MadeSelect | MadeButton | MadeSelectChannel | MadeSelectUser | MadeSelectRole),
) => {
    if (ax.id.predicate === made.id.predicate) {
        return ax.selected.map((s) => s.value);
    }
    return decodedPersist[made.id.predicate] ?? made.values;
};
